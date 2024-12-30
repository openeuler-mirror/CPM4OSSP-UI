<template>
  <div class="user">
    <div ref="filter" class="filter">
      <a-button type="primary" icon="plus" @click="handleAdd">新增</a-button>
    </div>
    <!-- 用户数据表格 -->
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
    <!-- 新增和编辑区 -->
    <a-modal v-model="editUserVisible" :title="title" :mask-closable="false" @keyup.native.enter="handleEditUserOk" @ok="handleEditUserOk">
      <user-add ref="userAdd" :row-data="rowData" @on-refresh="refreshTable" />
    </a-modal>
  </div>
</template>
<script>
import { getUserList, deleteUser, unlockUser } from '../../api/user'
import { parseTime } from '../../utils/time'
import userAdd from './components/user_add.vue'
export default {
  components: {
    userAdd
  },
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
    // 计算表格高度
    calcTableHeight() {
      this.$nextTick(() => {
        this.tableHeight = window.innerHeight - this.$refs['filter'].clientHeight - 135
      })
    },
    // 加载数据
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
    // 新增用户
    handleAdd() {
      this.title = '新增用户'
      this.rowData = {}
      this.editUserVisible = true
    },
    // 修改用户
    handleEdit(record) {
      this.title = '编辑用户'
      this.rowData = Object.assign(record)
      this.editUserVisible = true
    },
    // 提交用户数据
    handleEditUserOk() {
      this.$refs.userAdd.formSubmit()
    },
    // 刷新表格
    refreshTable() {
      this.editUserVisible = false
      this.loadData()
    },
    // 删除用户
    handleDelete(record) {
      this.$confirm({
        title: '系统提示',
        content: '真的要删除用户么？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          // 删除
          deleteUser(record.id).then((res) => {
            if (res.code === 200) {
              this.$notification.success({
                message: res.msg,
                duration: 2
              })
              this.loadData()
            }
          })
        }
      })
    },
    // 解锁
    handleUnlock(record) {
      this.$confirm({
        title: '系统提示',
        content: '真的要解锁用户么？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          // 解锁用户
          unlockUser(record.id).then(res => {
            if (res.code === 200) {
              this.$notification.success({
                message: res.msg,
                duration: 2
              })
              this.loadData()
            }
          })
        }
      })
    }
  }
}
</script>
<style scoped>
.filter {
  margin-bottom: 10px;
}
.ant-btn {
  margin-right: 10px;
}
</style>
