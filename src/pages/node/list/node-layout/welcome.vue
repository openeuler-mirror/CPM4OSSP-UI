<template>
  <div ref="welcome" class="welcome">
    <div>
      <a-button type="primary" icon="line-chart" @click="handleHistory">历史监控图表</a-button>
      <span v-show="node.cycle && node.cycle !== 0">
        <label style="margin:0 5px 0 20px">节点资源监控区间:</label>
        <a-select v-model="interval" style="width:130px" @change="handelChange">
          <a-select-option v-for="item in intervalSelect" :key="item.value">{{ item.label }}</a-select-option>
        </a-select>
      </span>
    </div>
    <a-divider>资源监控图</a-divider>
    <div id="top-chart">{{ noDataText }}</div>
    <a-divider>进程监控表</a-divider>
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
    <a-modal
      v-model="monitorVisible"
      width="75%"
      :centered="true"
      title="历史监控图表"
      :footer="null"
      :mask-closable="false"
      :destroy-on-close="true"
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
      dates: []
    }
  },
  mounted() {
    this.initData()
    this.tableHeight = (this.$refs.welcome.clientHeight - 144) / 2
  },
  destroyed() {
    clearInterval(this.topChartTimer)
  },
  methods: {
    initData() {
      if (!this.topChartTimer) {
        this.loadNodeProcess()
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
          this.loadNodeProcess()
        }, millis)
      }
    },
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
      if (memoryUsedItem.data.length > 0) {
        series.push(memoryUsedItem)
      }
      let legends = series.map((data) => {
        return data.name
      })
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
        ],
        series: series,
        color: ['#dc3545', '#377bc9', '#E3AA75']
      }
    },
    drawTopChart() {
      let option = this.generateChart(this.topData)
      const topChart = echarts.init(document.getElementById('top-chart'))
      topChart.on('dataZoom', (event) => {
        if (event.batch) {
          this.start = event.batch[0].start
          this.end = event.batch[0].end
        } else {
          this.start = event.start
          this.end = event.end
        }
      })
      topChart.setOption(option)
    },
    loadNodeProcess() {
      getProcessList(this.node.id).then(res => {
        if (res.code === 200) {
          this.processList = res.data
        }
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
    handleHistory() {
      this.monitorVisible = true
    },
    onchange(value, dateString) {
      this.timeArray.beginDate = new Date(dateString[0]).getTime()
      this.timeArray.endDate = new Date(dateString[1]).getTime()
    },
    drawHistoryChart() {
      let option = this.generateChart(this.historyData)
      const historyChart = echarts.init(document.getElementById('history-chart'))
      historyChart.setOption(option)
    },
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
    calendarChange(val) {
      this.dates = val
    },
    disabledDate(current) {
      if (this.dates.length === 0) return false
      const disabledDate = this.dates[0] && Math.abs(dayjs(current).diff(this.dates[0], 'day')) > 30
      return disabledDate
    }
  }
}
</script>

<style scoped>
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
</style>
