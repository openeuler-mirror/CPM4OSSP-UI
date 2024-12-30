<template>
  <div ref="package" class="package">
    <!-- 搜索头 -->
    <div ref="filter" class="filter">
      <a-button type="primary" icon="search" @click="openSearch">条件搜索</a-button>
      <a-button type="primary" icon="sync" @click="handleRefreshPackageList">重置</a-button>
      <a-button type="primary" icon="tool" @click="batchInstall">软件包安装</a-button>
      <a-badge :count="upgradeNum" :title="'可升级软件数'+upgradeNum">
        <a-button class="task-list-btn" type="primary" icon="rise" @click="updatePackageVisible = true">软件包升级</a-button>
      </a-badge>
      <a-button class="ml-15" type="danger" :disabled="BtnIsDisabled" icon="delete" @click="batchDelete">批量卸载</a-button>
      <a-badge :count="taskNumNot"><a-button class="task-list-btn" type="primary" icon="file-text" @click="showTaskList">任务列表</a-button></a-badge>
      <lock-status class="ml-15" :node-id="node.id" />
    </div>
    <!-- 数据表格 -->
    <a-table
      ref="package_table"
      class="packageTable"
      :row-selection="{ onChange: onSelectChange, selectedRowKeys: rowKeys,getCheckboxProps:checkboxProps }"
      :data-source="packageList"
      :loading="loading"
      :columns="columns"
      :pagination="pagination"
      :style="{'max-height': tableHeight + 'px' }"
      :scroll="{x: 900, y: tableHeight - 120}"
      row-key="name"
      bordered
      @change="change"
    >
      <a-tooltip slot="name" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="version" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="structure" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="path" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="classification" slot-scope="text">
        <a-tag v-if="text === 'normal'" class="info">普通</a-tag>
        <a-tag v-if="text === 'important'" class="warning">重要</a-tag>
        <a-tag v-if="text === 'necessary'" class="danger">必要</a-tag>
      </a-tooltip>
      <a-tooltip slot="content" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="卸载">
          <a-button
            type="link"
            :disabled="record.status !== 'ii' || record.classification === 'important' || record.classification === 'necessary'"
            @click="handleDelete(record)"
          >
            <a-icon type="delete" class="danger" />
          </a-button>
        </a-tooltip>
      </template>
    </a-table>

    <!-- 批量操作模态框 -->
    <a-modal
      v-model="batchInstallVisible"
      width="800px"
      :mask-closable="false"
      :centered="true"
      title="软件包安装"
      ok-text="安装"
      :destroy-on-close="true"
      @ok="toInstall"
    >
      <package-batch-install ref="packageForm" :node-id="node.id" />
    </a-modal>

    <!-- 包任务列表模态框 -->
    <a-modal
      v-model="packageTaskListVisible"
      title="任务列表"
      :mask-closable="false"
      :destroy-on-close="true"
      width="900px"
      @cancel="getTaskList"
    >
      <package-task-list ref="packageFrom" :node-id="node.id" />
      <template slot="footer">
        <a-button @click="packageTaskListVisible=false">取消</a-button>
        <a-button type="primary" @click="setViewedAll">全部已读</a-button>
      </template>
    </a-modal>
    <!-- 可升级软件包列表 -->
    <a-modal
      v-model="updatePackageVisible"
      title="可升级软件包列表"
      :destroy-on-close="true"
      width="800px"
      @ok="handleUpdate"
    >
      <updateable-package-list ref="updateModal" :node-id="node.id" />
    </a-modal>

    <a-drawer
      title="条件搜索"
      placement="right"
      :mask-closable="false"
      :width="500"
      height="100%"
      :visible="searchVisible"
      @close="searchVisible = false"
      @keyup.native.enter="sumbitSearch"
    >
      <a-form-model
        ref="searchForm"
        :model="queryParams"
        :wrapper-col="{ span: 20 }"
        :label-col="{ span: 4 }"
      >
        <a-form-model-item label="软件包名" prop="name">
          <a-input v-model="queryParams.name" allow-clear placeholder="请输入软件包名,按回车(Enter)查找" />
        </a-form-model-item>
        <a-form-model-item label="软件包状态" prop="status">
          <a-select v-model="queryParams.status">
            <a-select-option v-for="item in packageStatus" :key="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="软件包类别" prop="section">
          <a-select
            v-model="queryParams.section"
            allow-clear
            show-search
            mode="tags"
            placeholder="请选择软件包类别,按回车(Enter)查找"
            class="filter-item"
            @change="handleChangeSection"
          >
            <a-select-option v-for="item in sectionsList" :key="item.section">{{ item.section }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="软件包级别" prop="classification">
          <a-select v-model="queryParams.classification" @change="classificationChange">
            <a-select-option v-for="item in classificationList" :key="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>

      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #377bc9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 1,
        }"
      >
        <a-button :style="{ marginRight: '8px' }" @click="searchVisible = false">
          取消
        </a-button>
        <a-button type="primary" @click="sumbitSearch">
          确定
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { getPackageList, setTaskViewed, getInstallablePackage, getUpdateablePackage, refreshPackageList } from '@/api/node_package'
import { getPkgSectionsList } from '@/api/repository'
import { addPackageTask, startThread } from '@/api/node_package'
import PackageBatchInstall from './package_batch_install.vue'
import PackageTaskList from './package_task_list.vue'
import { mapGetters } from 'vuex'
import UpdateablePackageList from './updateable_package_list.vue'
import lockStatus from '../components/lock-status.vue'
export default {
  components: {
    PackageBatchInstall,
    PackageTaskList,
    UpdateablePackageList,
    lockStatus
  },
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
      loading: false,
      tableHeight: '70vh',
      batchInstallVisible: false,
      list: [],
      // 操作类型
      listQuery: {
        page: 1,
        limit: 10
      },
      total: 0,
      temp: {},
      columns: [
        { title: '软件包名称', dataIndex: 'name', width: 150, ellipsis: true, scopedSlots: { customRender: 'name' }},
        { title: '状态', dataIndex: 'status', width: 100, ellipsis: true, scopedSlots: { customRender: 'status' }},
        { title: '版本', dataIndex: 'version', width: 150, ellipsis: true, scopedSlots: { customRender: 'version' }},
        { title: '类别', dataIndex: 'section', width: 100, ellipsis: true, scopedSlots: { customRender: 'section' }},
        { title: '体系架构', dataIndex: 'structure', width: 150, ellipsis: true, scopedSlots: { customRender: 'structure' }},
        { title: '级别', dataIndex: 'classification', width: 100, ellipsis: true, scopedSlots: { customRender: 'classification' }},
        { title: '描述', dataIndex: 'content', ellipsis: true, scopedSlots: { customRender: 'content' }},
        { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: 'operation' }, width: 100, align: 'center', fixed: 'right' }
      ],
      rules: {
        name: [
          { required: true, message: 'Please input package name', trigger: 'blur' }
        ],
        path: [
          { required: true, message: 'Please input package version', trigger: 'blur' }
        ]
      },
      selectedPackageList: [],
      BtnIsDisabled: true,
      packageTaskListVisible: false,
      timer: null,
      rowKeys: [],
      queryParams: {
        name: '',
        classification: '',
        status: '',
        section: undefined
      },
      packageList: [],
      isShowInstallableList: false,
      installableList: [],
      updatePackageVisible: false,
      selectPackages: [],
      packageKeys: [0],
      timeOut: null,
      classificationList: [
        { label: '全部', value: '' },
        { label: '重要', value: 'important' },
        { label: '普通', value: 'normal' },
        { label: '必要', value: 'necessary' }
      ],
      upgradeNum: 0,
      upgradeTimer: null,
      packageStatus: [
        { label: '全部', value: '' },
        { label: '正常', value: 'normal' },
        { label: '异常', value: 'error' }
      ],
      sectionsList: [],
      searchVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'taskNumNot'
    ]),
    // 分页
    pagination() {
      return {
        total: this.total,
        current: this.listQuery.page || 1,
        pageSize: this.listQuery.limit || 20,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: true,
        showTotal: (total) => {
          return `共 ${total} 项`
        }
      }
    }
  },
  watch: {
    selectedPackageList(val) {
      if (val.length === 0) {
        this.BtnIsDisabled = true
      } else {
        this.BtnIsDisabled = false
      }
    }
  },
  created() {
    // 更新安装软件包检索库
    getInstallablePackage({ nodeId: this.node.id })
    this.getTaskList()
    this.loadData()
    this.getUpgradeNum()
    this.calcTableHeight()
    // 启动线程
    startThread({ nodeId: this.node.id })
    // 创建定时任务,更新任务数
    this.timer = setInterval(this.getTaskList, 10000)
    this.upgradeTimer = setInterval(this.getUpgradeNum, 30 * 60 * 1000)
    this.getPkgSectionsList()
  },
  beforeDestroy() {
    clearInterval(this.timer)
    clearInterval(this.upgradeTimer)
  },
  methods: {
    getPkgSectionsList() {
      getPkgSectionsList().then(res => {
        this.sectionsList = res.data || []
      })
    },
    // 计算表格高度
    calcTableHeight() {
      setTimeout(() => {
        this.tableHeight = this.$refs.package.clientHeight - 45
      })
    },
    // 获取可升级软件数
    getUpgradeNum() {
      getUpdateablePackage(this.node.id).then(res => {
        if (res.code === 200) {
          this.upgradeNum = (Array.isArray(res.data) && res.data.length) || 0
        }
      })
    },
    // 加载数据
    loadData() {
      this.loading = true
      let params = {
        nodeId: this.node.id,
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit
      }
      for (let key in this.queryParams) {
        if (this.queryParams[key]) {
          params[key] = this.queryParams[key]
        }
        params.section = this.queryParams.section?.[0] || undefined
      }
      getPackageList(params).then(res => {
        if (res.code === 200) {
          this.packageList = res.data.list
          this.total = res.data.total * 1
        }
        this.loading = false
      })
    },
    // 刷新软件包列表
    handleRefreshPackageList() {
      this.queryParams = {
        name: '',
        status: '',
        classification: ''
      }
      this.selectPackages = []
      this.loading = true
      refreshPackageList({ nodeId: this.node.id }).then(res => {
        if (res.code === 200) {
          this.loadData()
        }
      })
    },
    // 分页、排序、筛选变化时触发
    change(pagination) {
      this.listQuery.page = pagination.current
      this.listQuery.limit = pagination.pageSize
      this.loadData()
    },
    // 卸载软件包
    handleDelete(record) {
      this.$confirm({
        title: '系统提示',
        content: '确定卸载该软件包么？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          // 组装参数
          const param = {
            nodeId: this.node.id,
            taskList: [
              {
                taskTarget: record.name,
                nodeId: this.node.id,
                taskAction: 'uninstall'
              }
            ]
          }
          addPackageTask(param).then(res => {
            if (res.code === 200) {
              this.$notification.success({ message: '添加软件包卸载任务成功' })
              this.getTaskList()
            } else {
              this.$notification.warning({
                message: '添加软件包卸载任务失败' + res.msg
              })
            }
          })
        }
      })
    },
    // 批量安装
    batchInstall() {
      this.batchInstallVisible = true
    },
    // 确定安装
    toInstall() {
      this.$refs['packageForm'].handleInstall().then((res) => {
        if (res.code === 200) {
          this.batchInstallVisible = false
          this.$notification.success({
            message: '添加软件包安装任务成功'
          })
          this.getTaskList()
        } else {
          this.$notification.warning({
            message: '添加软件包安装任务失败' + res.msg
          })
        }
      })
    },
    // 包选择
    onSelectChange(row, packageRow) {
      this.rowKeys = row
      this.selectedPackageList = packageRow
    },
    // 是否禁用复选框
    checkboxProps(record) {
      return {
        props: {
          disabled: record.status !== 'ii' || record.classification === 'important' || record.classification === 'necessary'
        }
      }
    },
    // 批量卸载
    batchDelete() {
      this.$confirm({
        title: '提示',
        content: '确定卸载所选中的软件包吗?',
        onOk: () => {
          let list = []
          let message = ''
          list = this.selectedPackageList.map((item, index) => {
            if (item.status !== 'ii' || item.classification === 'important' || item.classification === 'necessary') {
              message = item.name + ':该软件包不可卸载'
            }
            const tem = {
              nodeId: this.node.id,
              taskAction: 'uninstall',
              taskTarget: item.name
            }
            return tem
          })
          if (message !== '') {
            this.$notification.error({ message })
            return
          }
          const param = {
            nodeId: this.node.id,
            taskList: list
          }
          addPackageTask(param).then(res => {
            if (res.code === 200) {
              this.$notification.success({
                message: '添加软件包卸载任务成功'
              })
              this.getTaskList()
              this.rowKeys = []
              this.selectedPackageList = []
            } else {
              this.$notification.warning({
                message: '添加软件包卸载任务失败' + res.msg
              })
            }
          })
        },
        onCancel: function() {
        }
      })
    },
    showTaskList() {
      this.packageTaskListVisible = true
    },
    // 获取任务列表
    getTaskList() {
      this.$store.dispatch('getTaskList', { nodeId: this.node.id })
    },
    // 设置未读消息全部已读
    setViewedAll() {
      let notViewedList = this.$refs.packageFrom.taskList.filter(item => {
        return item.taskViewTimes === 0
      })

      let list = []
      notViewedList.forEach(task => {
        const param = { nodeId: this.node.id, taskId: task.id }
        list.push(setTaskViewed(param))
      })
      Promise.all(list).then((res) => {
        res.every(item => item.code === 200) &&
        this.$store.dispatch('getTaskList', { nodeId: this.node.id }).then(() => {
          this.packageTaskListVisible = false
        })
      })
    },
    // 点击软件包
    handleClick(packageName) {
      this.selectPackages = []
      this.temp.name = packageName
      this.isShowInstallableList = false
      this.installableList.forEach(item => {
        if (item.Package === packageName) {
          this.selectPackages.push(item)
        }
      })
    },
    // 确定升级
    handleUpdate() {
      this.$refs['updateModal'].handleSubmit().then(res => {
        let taskList = []
        res.forEach(item => {
          taskList.push(
            { taskTarget: item.name, nodeId: this.node.id, taskAction: 'update' }
          )
        })
        const param = {
          nodeId: this.node.id,
          taskList: taskList
        }
        addPackageTask(param).then(res => {
          if (res.code === 200) {
            this.$notification.success({
              message: '添加更新软件包任务成功'
            })
            this.updatePackageVisible = false
            this.getTaskList()
          } else {
            this.$notification.warning({
              message: '添加更新软件包任务失败'
            })
          }
        })
      }).catch()
    },
    // 选择安装包版本
    InstallPackageSelectChange(row) {
      this.packageKeys = row
    },
    // 软件包类型变化
    classificationChange(data) {
      this.classification = data
      // this.loadData()
    },

    openSearch() {
      this.searchVisible = true
    },
    sumbitSearch() {
      this.listQuery.page = 1
      this.listQuery.limit = 10
      this.searchVisible = false
      this.loadData()
    },
    handleChangeSection(val) {
      // 设置为只能输入一个
      if (this.queryParams.section.length > 1) {
        this.queryParams.section.splice(1)
        this.queryParams.section = val
      }
    }
  }
}
</script>

<style scoped lang="scss">
.package{
  height: 100%;
}
.filter {
  margin-bottom: 15px;
}
.ant-btn {
  margin-right: 10px;
}
.ant-btn.task-list-btn{
  margin-right: 0;
}
::v-deep.ant-pagination{
  margin-top: 15px;
}
::v-deep .packageTable.ant-table-wrapper{
  height: 100%;
  .ant-spin-nested-loading{
    height: 100%;
    .ant-spin-container{
      height: 100%;
      .ant-table{
        height: calc(100% - 65px);
        overflow: hidden;
      }
    }
  }
}
</style>
