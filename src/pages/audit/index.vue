<template>
  <div ref="audit" class="audit">
    <div ref="filter" class="filter">
      <a-select
        v-model="listQuery.level"
        allow-clear
        placeholder="请选择日志级别"
        class="filter-item"
        @change="handleFilter"
      >
        <a-select-option v-for="item in levelList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
      </a-select>
      <a-input v-model="listQuery.ip" allow-clear placeholder="请输入ip地址" class="filter-item" @change="changeIP" />
      <a-range-picker
        :open="open"
        class="filter-item"
        :value="timeRange"
        :disabled-date="disabledDate"
        :show-time="{format: 'HH:mm:ss'}"
        format="YYYY-MM-DD HH:mm:ss"
        @change="onchangeTime"
        @openChange="open = !open"
        @calendarChange="calendarChange"
        @ok="handleFilter"
      >
        <template slot="renderExtraFooter">
          <a-button size="small" :class="{isActive: isActive === 1}" @click="computedTime(1)">昨天</a-button>
          <a-button size="small" :class="{isActive: isActive === 3}" @click="computedTime(3)">近三天</a-button>
          <a-button size="small" :class="{isActive: isActive === 5}" @click="computedTime(5)">近五天</a-button>
          <a-button size="small" :class="{isActive: isActive === 7}" @click="computedTime(7)">近一周</a-button>
        </template>
      </a-range-picker>
      <a-button type="primary" icon="search" @click="handleFilter">搜索</a-button>
      <a-button type="primary" icon="sync" @click="resetHandler">重置</a-button>
    </div>
    <a-table
      :data-source="auditList"
      :loading="loading"
      :columns="columns"
      :pagination="pagination"
      :scroll="{x: 900, y: tableHeight - 50}"
      bordered
      :row-key="(record, index) => index"
      @change="change"
    >
      <template slot="level" slot-scope="text">
        <a-tag v-if="text === 0" class="info">信息</a-tag>
        <a-tag v-if="text === 1" class="success">调试</a-tag>
        <a-tag v-if="text === 2" class="danger">错误</a-tag>
        <a-tag v-if="text === 3" class="warning">告警</a-tag>
      </template>
      <a-tooltip slot="content" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="详情">
          <a-button type="link" @click="handleDetail(record)"><a-icon type="file" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getAuditList } from '@/api/audit'
import { parseTime } from '@/utils/time'
import detail from './components/index.vue'
export default {
  components: {
    detail
  },
  data() {
    return {
      loading: false,
      levelList: [
        { label: '信息', value: 0 },
        { label: '调试', value: 1 },
        { label: '错误', value: 2 },
        { label: '告警', value: 3 }

      ],
      total: 0,
      auditList: [],
      listQuery: {
        page: 1,
        limit: 10
      },
      timeRange: [],
      tableHeight: 0,
      rowData: {},
      detailVisible: false,
      columns: [
        { title: 'IP', dataIndex: 'ip', width: 200, ellipsis: true },
        { title: '日志级别', dataIndex: 'level', width: 100, ellipsis: true, scopedSlots: { customRender: 'level' }},
        { title: '时间', dataIndex: 'time', width: 200, ellipsis: true, customRender: (text) => { return parseTime(text) } },
        { title: '内容', dataIndex: 'content', ellipsis: true, scopedSlots: { customRender: 'content' }},
        { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: 'operation' }, width: 100, align: 'center' }
      ],
      isActive: 0,
      open: false,
      dates: [],
      timer: null
    }
  },
  computed: {
    pagination() {
      return {
        total: this.total,
        current: this.listQuery.page || 1,
        pageSize: this.listQuery.limit || 10,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: true,
        showTotal: (total) => {
          return `共 ${total} 条`
        }
      }
    }
  },
  watch: {
    open(val) {
      if (val) {
        this.dates = []
      }
    }
  },
  created() {
    this.computedTime()
    this.getAuditList()
  },
  mounted() {
    setTimeout(() => {
      this.tableHeight = this.$refs.audit.clientHeight - 140
    })
  },
  methods: {
    getAuditList() {
      this.loading = true
      const param = {
        page: this.listQuery.page,
        limit: this.listQuery.limit,
        ip: this.listQuery.ip || '',
        type: 0,
        level: this.listQuery.level === undefined ? -1 : this.listQuery.level,
        startTime: this.timeRange[0] || '',
        endTime: this.timeRange[1] || '',
        content: '',
        extra: ''
      }
      getAuditList(param).then(res => {
        if (res.code === 200) {
          res.data.count && (this.total = res.data.count)
          this.auditList = res.data.log
        } else {
          this.total = 0
        }
      }).catch(() => {
        this.total = 0
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>