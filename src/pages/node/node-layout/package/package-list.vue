<template>
  <div ref="package" class="package">
    <div ref="filter" class="filter">
      <a-input-search
        v-model="keyWord"
        class="width-150 mr-10"
        allow-clear
        placeholder="请输入软件包名"
        @search="filterData"
        @pressEnter="filterData"
      />
      软件包类型：
      <a-select v-model="classification" class="width-100 mr-10" @change="classificationChange">
        <a-select-option v-for="item in classificationList" :key="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-popover placement="bottom" :overlay-style="{width:'720px'}">
        <template slot="content">
          期望状态：未知(u)/安装(i)/删除(r)/清除(p)/保持(h)<br>
          状态：未安装(n)/已安装(i)/仅存配置(c)/仅解压缩(U)/配置失败(F)/不完全安装(H)/触发器等待(W)/触发器未决(T)<br>
          示例：ii表示软件包期望状态为安装并且安装成功
        </template>
        <a-icon type="exclamation-circle" class="warning help-icon" />
        软件包状态：
      </a-popover>
      <a-select v-model="onlyInstalled" class="width-100 mr-10" @change="loadData">
        <a-select-option v-for="item in packageStatus" :key="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-badge :count="upgradeNum" :title="'可升级软件数'+upgradeNum">
        <a-button class="task-list-btn" type="primary" icon="rise" @click="updatePackageVisible = true">软件包升级</a-button>
      </a-badge>
      <a-button class="ml-15" type="danger" :disabled="BtnIsDisabled" icon="delete" @click="batchDelete">批量卸载</a-button>
      <a-badge :count="taskNumNot"><a-button class="task-list-btn" type="primary" icon="file-text" @click="showTaskList">任务列表</a-button></a-badge>
      <lock-status class="ml-15" :node-id="node.id" />
      <a-button type="primary" icon="sync" @click="freshenList">刷新</a-button>
    </div>
    <a-table
      ref="package_table"
      class="packageTable"
      :row-selection="{ onChange: onSelectChange, selectedRowKeys: rowKeys,getCheckboxProps:checkboxProps }"
      :data-source="showDataList"
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
  </div>
</template>

<script>
import { getPackageList, setTaskViewed, getInstallablePackage, getUpdateablePackage } from '@/api/node_package'
import { addPackageTask, startThread } from '@/api/node_package'
import PackageTaskList from './package_task_list.vue'
import PackageBatchInstall from './package_batch_install.vue'
import { mapGetters } from 'vuex'
import lockStatus from '../components/lock-status.vue'
export default {
  components: {
    lockStatus,
    PackageTaskList,
    PackageBatchInstall
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
      listQuery: {
        page: 1,
        limit: 20
      },
      total: 0,
      temp: {},
      columns: [
        { title: '软件包名称', dataIndex: 'name', width: 150, ellipsis: true, scopedSlots: { customRender: 'name' }},
        { title: '状态', dataIndex: 'status', width: 100, ellipsis: true, scopedSlots: { customRender: 'status' }},
        { title: '版本', dataIndex: 'version', width: 150, ellipsis: true, scopedSlots: { customRender: 'version' }},
        { title: '体系架构', dataIndex: 'structure', width: 150, ellipsis: true, scopedSlots: { customRender: 'structure' }},
        { title: '类型', dataIndex: 'classification', width: 100, ellipsis: true, scopedSlots: { customRender: 'classification' }},
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
      keyWord: '',
      showDataList: [],
      isShowInstallableList: false,
      installableList: [],
      updatePackageVisible: false,
      onlyInstalled: 0,
      selectPackages: [],
      packageKeys: [0],
      timeOut: null,
      classification: '',
      classificationList: [
        { label: '全部', value: '' },
        { label: '重要', value: 'important' },
        { label: '普通', value: 'normal' },
        { label: '必要', value: 'necessary' }
      ],
      upgradeNum: 0,
      upgradeTimer: null,
      packageStatus: [
        { label: '全部', value: 0 },
        { label: '正常', value: 1 },
        { label: '异常', value: 2 }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'taskNumNot'
    ]),
    pagination() {
      return {
        total: this.total,
        current: this.listQuery.page || 1,
        pageSize: this.listQuery.limit || 10,
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
    getInstallablePackage({ nodeId: this.node.id })
    this.getTaskList()
    this.loadData()
    this.getUpgradeNum()
    this.calcTableHeight()
    startThread({ nodeId: this.node.id })
    this.timer = setInterval(this.getTaskList, 10000)
    this.upgradeTimer = setInterval(this.getUpgradeNum, 30 * 60 * 1000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    clearInterval(this.upgradeTimer)
  },
  methods: {
    calcTableHeight() {
      setTimeout(() => {
        this.tableHeight = this.$refs.package.clientHeight - 45
      })
    },
    getUpgradeNum() {
      getUpdateablePackage(this.node.id).then(res => {
        if (res.code === 200) {
          this.upgradeNum = (Array.isArray(res.data) && res.data.length) || 0
        }
      })
    },
    loadData() {
      this.loading = true
      const params = {
        nodeId: this.node.id,
        onlyInstalled: this.onlyInstalled
      }
      getPackageList(params).then(res => {
        if (res.code === 200) {
          this.list = res.data
          this.filterData()
        }
        this.loading = false
      })
    },
    change(pagination) {
      this.listQuery.page = pagination.current
      this.listQuery.limit = pagination.pageSize
      this.loadData()
    },
    onSelectChange(row, packageRow) {
      this.rowKeys = row
      this.selectedPackageList = packageRow
    },
    checkboxProps(record) {
      return {
        props: {
          disabled: record.status !== 'ii' || record.classification === 'important' || record.classification === 'necessary'
        }
      }
    },
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
    getTaskList() {
      this.$store.dispatch('getTaskList', { nodeId: this.node.id })
    },
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
    filterData() {
      this.showDataList = this.list.filter(item => {
        return item.name && item.name.match(this.keyWord) && item.classification && item.classification.match(this.classification)
      })
    },
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
    freshenList() {
      this.keyWord = ''
      this.onlyInstalled = 0
      this.classification = ''
      this.rowKeys = []
      this.selectedPackageList = []
      this.loadData()
    },
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
    InstallPackageSelectChange(row) {
      this.packageKeys = row
    },
    classificationChange() {
      this.filterData()
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
