<template>
  <div ref="welcome" class="welcome">
    <div>
      <!-- 历史监控数据 -->
      <a-button type="primary" icon="line-chart" @click="handleHistory">历史监控图表</a-button>
      <!-- 监控区间选择 -->
      <span v-show="node.cycle && node.cycle !== 0">
        <label style="margin:0 5px 0 20px">节点资源监控区间:</label>
        <a-select v-model="interval" style="width:130px" @change="handelChange">
          <a-select-option v-for="item in intervalSelect" :key="item.value">{{ item.label }}</a-select-option>
        </a-select>
      </span>
    </div>
    <a-divider>资源监控图<span class="echarts-tip info"><a-icon type="exclamation-circle" style="margin-right:3px;" />开启资源监控期间,运行平台的主机硬件资源消耗会有所增加</span></a-divider>
    <!-- top 图表 -->
    <div id="top-chart">{{ noDataText }}</div>
    <a-divider>
      <a-tooltip title="刷新进程监控表">
        <a-button type="link" size="small" style="" @click="loadNodeProcess"><a-icon type="sync" /></a-button>
      </a-tooltip>
      进程监控表
    </a-divider>
    <!-- 进程表格数据 -->
    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="processList"
      :style="{'max-height':tableHeight+'px'}"
      :scroll="{x:1100,y:tableHeight-55}"
      bordered
      row-key="pid"
      class="node-table"
      :pagination="false"
    >
      <a-tooltip slot="command" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="port" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="user" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="jpomName" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="结束">
          <a-button type="link" @click="kill(record)"><a-icon type="close-circle" class="danger" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
    <!-- 历史监控 -->
    <a-modal
      v-model="monitorVisible"
      width="75%"
      :centered="true"
      title="历史监控图表"
      :footer="null"
      :mask-closable="false"
      :destroy-on-close="true"
      @cancel="handleModalClose"
    >
      <div ref="filter" class="filter">
        <a-range-picker
          class="filter-item"
          :allow-clear="false"
          :show-time="{format: 'HH:mm:ss'}"
          format="YYYY-MM-DD HH:mm:ss"
          :disabled-date="disabledDate"
          @openChange="dateOpenStatus"
          @calendarChange="calendarChange"
          @change="onchange"
          @ok="searchData"
        />
        <div class="tip">
          <a-alert message="使用鼠标滚轮可对图例进行放大和缩小" type="info" show-icon />
        </div>
      </div>
      <div id="history-chart">请选择日期范围查看历史监控图</div>
    </a-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getNodeTop, getProcessList, killPid, getTopHistory } from '@/api/node'
import echarts from 'echarts'
import { parseTime } from '@/utils/time'
import { throttle } from '@/utils/index'
export default {
  props: {
    node: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      topData: {},
      topChartTimer: null,
      loading: false,
      processList: [],
      monitorVisible: false,
      timeArray: {
        beginDate: '',
        endDate: ''
      },
      historyData: [],
      columns: [
        { title: '进程 ID', dataIndex: 'pid', width: 100, ellipsis: true },
        { title: '进程名称', dataIndex: 'command', ellipsis: true, scopedSlots: { customRender: 'command' }},
        { title: '端口', dataIndex: 'port', ellipsis: true, scopedSlots: { customRender: 'port' }},
        { title: '所有者', dataIndex: 'user', width: 100, ellipsis: true, scopedSlots: { customRender: 'user' }},
        { title: '物理内存', dataIndex: 'res', width: 100, ellipsis: true },
        { title: '进程状态', dataIndex: 'status', width: 100, ellipsis: true },
        { title: '占用CPU', dataIndex: 'cpu', width: 100, ellipsis: true },
        { title: '物理内存百分比', dataIndex: 'mem', width: 100, ellipsis: true },
        { title: '虚拟内存', dataIndex: 'virt', width: 100, ellipsis: true },
        { title: '共享内存', dataIndex: 'shr', width: 100, ellipsis: true },
        { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: 'operation' }, width: 100, align: 'center', fixed: 'right' }
      ],
      noDataText: '加载中...',
      interval: 1800,
      intervalSelect: [
        { label: '最近三十分钟', value: 1800 },
        { label: '最近一小时', value: 3600 },
        { label: '最近二小时', value: 7200 },
        { label: '最近三小时', value: 10800 },
        { label: '最近四小时', value: 14400 },
        { label: '最近五小时', value: 18000 }
      ],
      tableHeight: 0,
      start: 0,
      end: 100,
      // 控制日期选择范围在30天
      dates: [],
      topChart: null,
      historyChart: null,
      // 进程列表总数据
      allProcessList: [],
      // 用于取消滚动监听
      scrollListener: null
    }
  },
  async mounted() {
    this.initData()
    this.tableHeight = (this.$refs.welcome.clientHeight - 144) / 2
    await this.loadNodeProcess()
    this.$nextTick(() => {
      this.getScroller()
    })
  },
  beforeDestroy() {
    clearInterval(this.topChartTimer)
    this.topChart && this.topChart.dispose()
    this.cancelScroll()
  },
  methods: {
    // 初始化页面
    initData() {
      if (!this.topChartTimer) {
        // 进程列表数据过多时会影响echarts动画，generateChart中关闭动画
        // this.loadNodeProcess()
        // 计算多久时间绘制图表
        var millis = 30000
        if (this.node.cycle === 0) {
          this.noDataText = '未开启资源监控'
          return
        } else if (this.node.cycle < 0) {
          this.loadNodeTop()
          millis = Math.abs(this.node.cycle) * 1000
        } else {
          this.loadNodeTop()
          millis = this.node.cycle * 60 * 1000
        }
        this.topChartTimer = setInterval(() => {
          this.loadNodeTop()
        }, millis)
      }
    },
    // 请求 top 命令绘制图表
    loadNodeTop() {
      getNodeTop({ nodeId: this.node.id, interval: this.interval }).then(res => {
        if (res.code === 200) {
          this.topData = res.data
        }
        this.drawTopChart()
      })
    },
    generateChart(data) {
      let cpuItem = {
        name: 'cpu占用',
        type: 'line',
        data: [],
        showSymbol: false,
        // 设置折线为曲线
        smooth: true
      }
      let diskItem = {
        name: '磁盘占用',
        type: 'line',
        data: [],
        showSymbol: false,
        smooth: true
      }
      let memoryItem = {
        name: '内存占用',
        type: 'line',
        data: [],
        showSymbol: false,
        smooth: true
      }
      let memoryUsedItem = {
        name: '内存占用(累计)',
        type: 'line',
        data: [],
        showSymbol: false,
        smooth: true
      }
      // 坐标轴数据组装
      let Xlist = []
      data.forEach(item => {
        if (item != null) {
          cpuItem.data.push(parseFloat(item.cpuUsage))
          diskItem.data.push(parseFloat(item.diskUsage))
          memoryItem.data.push(parseFloat(item.memoryUsage))
          Xlist.push(parseTime(item.monitorTime))
          if (item.memoryUsed) {
            memoryUsedItem.data.push(parseFloat(item.memoryUsed))
          }
        }
      })
      let series = [cpuItem, memoryItem, diskItem]
      series.forEach(item => {
        item.animation = false
        // 数据量远大于像素点时降低采样策略
        item.sampling = 'average'
      })
      if (memoryUsedItem.data.length > 0) {
        series.push(memoryUsedItem)
      }
      let legends = series.map((data) => {
        return data.name
      })
      // 指定图表的配置项和数据
      return {
        title: {
          text: '监控项'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: legends
        },
        grid: {
          left: 15,
          right: 60,
          bottom: '1%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: Xlist,
          axisLabel: {
            // rotate: 45
          }
        },
        calculable: true,
        yAxis: {
          type: 'value',
          axisLabel: {
            // 设置y轴数值为%
            formatter: '{value} %'
          },
          max: 100
        },
        dataZoom: [
          {
            type: 'inside',
            start: this.start,
            end: this.end
          }
          // 用于X轴坐标范围修改，但是存在问题（会出现资源监控曲线图异常的情况）
          // {
          //   type: 'slider',
          //   start: this.start,
          //   end: this.end
          // }
        ],
        series: series,
        color: ['#dc3545', '#377bc9', '#E3AA75']
      }
    },
    // 绘制 top 图表
    drawTopChart() {
      let option = this.generateChart(this.topData)
      // 绘制图表
      this.topChart = echarts.init(document.getElementById('top-chart'))
      // 记录datazoom开始结束位置
      this.topChart.on('dataZoom', (event) => {
        if (event.batch) {
          this.start = event.batch[0].start
          this.end = event.batch[0].end
        } else {
          this.start = event.start
          this.end = event.end
        }
      })
      this.topChart.setOption(option)
      this.topChart.resize()
    },
    // 加载节点进程列表
    loadNodeProcess() {
      this.loading = true
      return new Promise((resolve, reject) => {
        getProcessList(this.node.id).then(res => {
          if (res.code === 200) {
            this.allProcessList = res.data
            this.setNodeProcessPagenation(1, 20)
            resolve()
          }
        })
          .catch(() => reject())
          .finally(() => {
            this.loading = false
          })
      })
    },
    // kill pid
    kill(record) {
      this.$confirm({
        title: '系统提示',
        content: '真的要结束这个进程么？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          // kill
          const params = {
            nodeId: this.node.id,
            pid: record.pid
          }
          killPid(params).then(res => {
            if (res.code === 200) {
              this.$notification.success({
                message: res.msg,
                duration: 2
              })
              this.loadNodeProcess()
            }
          })
        }
      })
    },
    // 历史图表
    handleHistory() {
      this.monitorVisible = true
    },
    // 选择时间
    onchange(value, dateString) {
      this.timeArray.beginDate = new Date(dateString[0]).getTime()
      this.timeArray.endDate = new Date(dateString[1]).getTime()
    },
    // 画历史图表
    drawHistoryChart() {
      let option = this.generateChart(this.historyData)
      // 绘制图表
      this.historyChart = echarts.init(document.getElementById('history-chart'))
      this.historyChart.setOption(option)
      this.historyChart.resize()
    },
    // 历史监控图表弹窗关闭
    handleModalClose() {
      if (this.historyChart) {
        this.historyChart.dispose()
      }
    },
    // 根据时间段获取监控数据
    searchData() {
      const params = {
        nodeId: this.node.id,
        ...this.timeArray
      }
      getTopHistory(params).then(res => {
        if (res.code === 200) {
          this.historyData = res.data
        }
        this.drawHistoryChart()
      })
    },
    handelChange() {
      this.loadNodeTop()
    },
    dateOpenStatus(status) {
      this.dates = []
    },
    // 选择日期触发事件
    calendarChange(val) {
      this.dates = val
    },
    // 日期可选范围控制在30天内
    disabledDate(current) {
      if (this.dates.length === 0) return false
      const disabledDate = this.dates[0] && Math.abs(dayjs(current).diff(this.dates[0], 'day')) > 30
      return disabledDate
    },
    // 前端数据分页 直接操作表格数据
    setNodeProcessPagenation(pageNum, pageSize = 10) {
      const start = (pageNum - 1) * pageSize
      const end = start + pageSize
      this.processList = this.allProcessList?.slice(start, end)
    },
    // 设置监听滚动元素
    getScroller() {
      // 获取表格可视区域高度
      let tableBody = document.querySelector('.node-table .ant-table-body')
      let lastScrollTop = 0
      // 初始索引
      let start = 0
      let end = 20
      this.scrollListener = throttle(this.handleScroll.bind(null, {
        el: tableBody,
        lastScrollTop,
        start,
        end
      }), 300)

      tableBody.addEventListener('scroll', this.scrollListener)
    },
    handleScroll(opt, e) {
      // 滚动进度
      let process = e.target.scrollTop / (opt.el.scrollHeight - opt.el.clientHeight)

      if (e.target.scrollTop < opt.lastScrollTop) {
        // 向上滚动
        // 滚动到0%时加载上一页数据,始终渲染20条数据
        if (process === 0) {
          // 判断是否还在第一页数据
          if (opt.start === 0 || opt.start < 0 || opt.start - 10 < 0) {
            this.processList = this.allProcessList?.slice(0, 20)
            opt.start = 0
            opt.end = 20
          } else {
            this.processList = this.allProcessList?.slice(opt.start - 10, opt.end - 10)
            opt.start -= 10
            opt.end -= 10
            e.target.scrollTop = opt.el.scrollHeight / 2
          }
        }
      } else if (e.target.scrollTop > opt.lastScrollTop) {
        // 向下滚动
        // 滚动到100%时加载下一页数据,始终渲染20条数据
        if (process === 1) {
          // 滚动到最后一页
          if (opt.end >= this.allProcessList.length) {
            this.processList = this.allProcessList?.slice(opt.start, this.allProcessList.length)
            opt.start = this.allProcessList.length - 20
            opt.end = this.allProcessList.length
          } else {
            this.processList = this.allProcessList?.slice(opt.start + 10, opt.end + 10)
            opt.start += 10
            opt.end += 10
            e.target.scrollTop = opt.el.scrollHeight / 2 - opt.el.clientHeight
          }
        }
      }

      // 记录最后一次滚动的位置
      opt.lastScrollTop = e.target.scrollTop
    },
    // 取消滚动监听
    cancelScroll() {
      try {
        // 在使用动态组件components时，会出现先切换组件，再执行beforeDestory;即使is属性发生变化，beforeDestory可能也不会立即执行，组件的销毁和挂载能可会在下一次的dom更新周期中执行
        // 此时切换组件，在beforeDestory获取到的dom为下一个页面的dom,但是当前组件的实例还可以使用，所以使用this获取dom
        let tableBody = this.$el.querySelector('.node-table .ant-table-body')
        tableBody.removeEventListener('scroll', this.scrollListener)
      } catch (error) {
        console.warn(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.welcome {
  height: 100%;
}
#top-chart {
  height: calc((100% - 144px) / 2);
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(0, 0, 0, 0.25);
}
.filter {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  .tip{
    height: 25px;
  }
}
.filter-item {
  width: 150px;
  margin-right: 10px;
}
#history-chart {
  height: 60vh;
  text-align: center;
  line-height: 60vh;
  color: rgba(0, 0, 0, 0.25);
}
.echarts-tip{
  font-size: 12px;
  margin-left: 10px;
}
</style>
