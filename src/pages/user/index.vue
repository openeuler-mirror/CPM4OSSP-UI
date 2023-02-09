<template>
  <div class="user">
    <div ref="filter" class="filter">
      <a-button type="primary" icon="plus" @click="handleAdd">新增</a-button>
    </div>
    <a-table
      :data-source="list"
      :loading="loading"
      :columns="columns"
      :style="{'max-height': tableHeight + 'px' }"
      :scroll="{x: 1000, y: tableHeight - 60}"
      :pagination="false"
      bordered
      :row-key="(record, index) => index"
    >
      <a-tooltip slot="id" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="编辑">
          <a-button type="link" @click="handleEdit(record)"><a-icon type="edit" /></a-button>
        </a-tooltip>
        <a-tooltip title="删除">
          <a-button type="link" @click="handleDelete(record)"><a-icon type="delete" class="danger" /></a-button>
        </a-tooltip>
        <a-tooltip title="解锁">
          <a-button type="link" :disabled="record.pwdErrorCount === 0" @click="handleUnlock(record)"><a-icon type="unlock" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
  </div>
</template>

<script>
import { getUserList } from '../../api/user'
import { parseTime } from '../../utils/time'
export default {
  data() {
    return {
      loading: false,
      tableHeight: '70vh',
      list: [],
      rowData: {},
      editUserVisible: false,
      columns: [
        { title: '用户名称', dataIndex: 'id', ellipsis: true, scopedSlots: { customRender: 'id' }},
        { title: '修改时间', dataIndex: 'modifyTime', ellipsis: true, customRender: (text) => { return parseTime(text) } },
        { title: '输入密码错误次数', dataIndex: 'pwdErrorCount', ellipsis: true },
        { title: '输入密码错误时间', dataIndex: 'lastPwdErrorTime', ellipsis: true, customRender: (text) => { if (text === '0') { return '--' } return parseTime(text) } },
        { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: 'operation' }, width: 200, align: 'center' }
      ],
      title: '新增用户'
    }
  },
  created() {
    this.calcTableHeight()
    this.loadData()
  },
  methods: {
    calcTableHeight() {
      this.$nextTick(() => {
        this.tableHeight = window.innerHeight - this.$refs['filter'].clientHeight - 135
      })
    },
    loadData() {
      this.list = []
      this.loading = true
      getUserList().then(res => {
        if (res.code === 200) {
          this.list = res.data
        }
      }).finally(() => {
        this.loading = false
      })
    },
    refreshTable() {
      this.editUserVisible = false
      this.loadData()
    },
  }
}
</script>