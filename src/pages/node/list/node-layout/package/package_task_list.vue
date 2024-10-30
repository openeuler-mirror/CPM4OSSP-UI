<template>
  <div>
    <div ref="filter" class="btn-box">
      <a-button type="danger" :disabled="BtnIsDisabled" icon="delete" @click="deleteTaskList">删除操作记录</a-button>
      <a-statistic title="未读/总计" :value="taskNumNot" class="">
        <template #suffix>
          <span> / {{ taskList.length }}</span>
        </template>
      </a-statistic>
    </div>
    <a-table
      bordered
      :columns="columns"
      :data-source="taskList"
      :row-key="(record, index) => record.id"
      :style="{'max-height': tableHeight - 50 + 'px', 'min-height': tableHeight - 150 + 'px' }"
      :row-selection="{ onChange: onSelectChange, selectedRowKeys: rowKeys }"
      :scroll="{y: tableHeight - 210}"
    >
      <template slot="taskAction" slot-scope="text">
        <span v-if="text === 'install'">安装</span>
        <span v-if="text === 'update'">升级</span>
        <span v-if="text === 'uninstall'">卸载</span>
      </template>
      <template slot="taskStatus" slot-scope="text">
        <span v-if="text === 0">未开始</span>
        <span v-if="text === 1">进行中</span>
        <span v-if="text === 2">成功</span>
        <span v-if="text === 3">失败</span>
      </template>
      <a-tooltip slot="taskTarget" slot-scope="text" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="taskViewTimes" slot-scope="text, record">
        <a-badge :dot="text === 0" :offset="[-15,0]">
          <a-popover trigger="click" :overlay-style="{width:'auto',maxWidth:'300px'}">
            <template slot="content">
              <span v-if="record.taskStatus === 0">未开始</span>
              <span v-if="record.taskStatus === 1">正在进行中...</span>
              <span v-if="record.taskStatus === 2">执行成功</span>
              <span v-if="record.taskStatus === 3">执行失败:{{ record.taskContent }}</span>
            </template>
            <a-tooltip title="查看" placement="bottom">
              <a-button type="link" @click="showDetail(record)"><a-icon type="file-text" /></a-button>
            </a-tooltip>
          </a-popover>
        </a-badge>
        <a-tooltip title="删除" placement="bottom">
          <a-button type="link" :disabled="record.taskStatus === 0 || record.taskStatus === 1" @click="deleteTask(record)"><a-icon type="delete" class="danger" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
  </div>
</template>

<script>
import { setTaskViewed, delTaskById } from '@/api/node_package'
import { mapGetters } from 'vuex'
export default {
  props: {
    nodeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      columns: [
        { title: '节点ID', dataIndex: 'nodeId' },
        { title: '操作类型', dataIndex: 'taskAction', scopedSlots: { customRender: 'taskAction' }},
        { title: '软件包名', dataIndex: 'taskTarget', ellipsis: true, scopedSlots: { customRender: 'taskTarget' }},
        { title: '操作结果', dataIndex: 'taskStatus', scopedSlots: { customRender: 'taskStatus' }},
        { title: '操作', dataIndex: 'taskViewTimes', scopedSlots: { customRender: 'taskViewTimes' }, width: 120, align: 'center' }
      ],
      selectedTaskList: [],
      popoverVisible: false,
      BtnIsDisabled: true,
      tableHeight: '60vh',
      rowKeys: []
    }
  },
  computed: {
    ...mapGetters([
      'taskNumNot'
    ]),
    taskList() {
      return this.$store.state.node.taskList
    }
  },
  watch: {
    selectedTaskList(val) {
      if (val.length > 0) {
        this.BtnIsDisabled = false
      } else {
        this.BtnIsDisabled = true
      }
    }
  },
  created() {
    this.calcTableHeight()
    this.getTaskStatus()
  },
  methods: {
    calcTableHeight() {
      this.$nextTick(() => {
        this.tableHeight = window.innerHeight - this.$refs['filter'].clientHeight - 250
      })
    },
    getTaskStatus() {
      this.$store.dispatch('getTaskList', { nodeId: this.nodeId })
    },
    onSelectChange(row, packageRow) {
      this.rowKeys = row
      this.selectedTaskList = packageRow
    },
    deleteTaskList() {
      let flag = this.selectedTaskList.some(item => {
        return item.taskStatus === 0 || item.taskStatus === 1
      })
      if (flag) {
        this.$notification.warning({
          message: '不能删除未开始或者正在进行中的任务'
        })
        return
      }
      this.$confirm({
        title: '系统提示',
        content: '确定删除所选记录?',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          const param = {
            nodeId: this.nodeId,
            taskList: []
          }
          this.selectedTaskList.forEach(item => {
            var obj = {
              id: item.id,
              taskStatus: item.taskStatus
            }
            param.taskList.push(obj)
          })
          this.handleDeleteTask(param)
          this.rowKeys = []
          this.selectedTaskList = []
        }
      })
    },
    showDetail(record) {
      if (record.taskViewTimes > 0) return
      const param = { nodeId: this.nodeId, taskId: record.id }
      setTaskViewed(param).then(res => {
        if (res.code === 200) {
          this.getTaskStatus()
        }
      })
    },
    deleteTask(record) {
      this.$confirm({
        title: '系统提示',
        content: '确实删除该条记录?',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          const param = {
            nodeId: this.nodeId,
            taskList: [
              { id: record.id, taskStatus: record.taskStatus }
            ]
          }
          this.handleDeleteTask(param)
        }
      })
    },
    handleDeleteTask(param) {
      delTaskById(param).then(res => {
        if (res.code === 200) {
          this.$notification.success({ message: '删除操作记录成功' })
          this.getTaskStatus()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-box{
  display: flex;
  justify-content: space-between;
  margin-right: 50px;
  margin-bottom:15px ;
  ::v-deep .ant-statistic{
    .ant-statistic-title{
      margin: 0;
      font-size: 12px;
    }
    .ant-statistic-content{
      font-size: 15px;
    }
  }
}
.ant-btn{
  margin-right: 15px;
}
</style>
