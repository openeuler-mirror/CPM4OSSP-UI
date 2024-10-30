<template>
  <div ref="package" class="package">
    <div ref="filter" class="filter">
      <span>软件源模板：</span>
      <a-select
        v-model="planName"
        placeholder="请选择软件源模板,按回车(Enter)查找"
        class="filter-item"
        :disabled="loading"
        @dropdownVisibleChange="getPlanList"
        @change="search"
      >
        <a-select-option v-for="item in planList" :key="item.planName">
          {{ item.planName }}
        </a-select-option>
      </a-select>
      <a-button type="primary" icon="search" class="mr10" @click="openSearch">条件搜索</a-button>
      <a-button type="primary" icon="sync" class="mr10" @click="resetSearch">重置</a-button>
      <a-button type="primary" :disabled="selectedRows.length===0" @click="batchEditPakClass">批量修改软件包类别</a-button>
    </div>
    <!-- 软件源模板表格数据 -->
    <a-table
      bordered
      :loading="loading"
      :data-source="packageList"
      :columns="columns"
      :row-key="(record, index) => record.id"
      :pagination="pagination"
      :scroll="{x:900,y:tableHeight-50}"
      :row-selection="rowSelection"
      @change="onShowSizeChange"
    >
      <a-tooltip slot="package" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="version" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="architecture" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="classification" slot-scope="text">
        <a-tag v-if="text === 'necessary'" class="danger">必要</a-tag>
        <a-tag v-if="text === 'important'" class="warning">重要</a-tag>
        <a-tag v-if="text === 'normal'" class="info">普通</a-tag>
      </template>
      <template slot="option" slot-scope="text, record">
        <div style="display:flex">
          <a-tooltip title="节点安装情况">
            <a-button type="link" @click="handlePkgInfo(record)"><a-icon type="profile" /></a-button>
          </a-tooltip>
          <a-tooltip title="编辑">
            <a-button type="link" :disabled="record.classification === 'necessary'" @click="editPakClass(record)"><a-icon type="edit" /></a-button>
          </a-tooltip>
          <a-tooltip title="下发">
            <a-button type="link" :disabled="record.classification === 'necessary'" @click="putPakClass(record)"><a-icon type="arrow-down" /></a-button>
          </a-tooltip>
        </div>
      </template>
    </a-table>
    <a-drawer
      :visible="pkgInfoDrawerVisible"
      :title="pkgInfoDrawerTitle"
      destroy-on-close
      placement="right"
      width="50%"
      :footer="null"
      @close="onClosePkgDrawer"
    >
      <pkg-install-info :row="selectRow" />
    </a-drawer>
    <!-- 编辑包类别的弹框 -->
    <a-modal
      v-model="editVisible"
      :title="(isBatchEdit?'批量':'')+'修改软件包级别'"
      :destroy-on-close="true"
      width="700px"
      @ok="handleEditClass"
    >
      <a-form-model :wrapper-col="{ span: 20 }" :label-col="{ span: 4 }">
        <a-form-model-item v-if="!isBatchEdit" label="软件包名">
          <a-input v-model="selectRow.package" :disabled="true" />
        </a-form-model-item>
        <a-form-model-item label="软件包级别">
          <a-select v-model="pkgClass" placeholder="请选择软件包类级别">
            <a-select-option
              v-for="item in selectClassList"
              :key="item.value"
              :disabled="!isBatchEdit&&item.value === selectRow.classification"
            >{{ item.label }}</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <!-- 下发包类别的弹框 -->
    <a-modal
      v-model="putVisible"
      :title="(isBatchEdit?'批量':'')+'下发软件包'"
      :destroy-on-close="true"
      width="700px"
      @ok="handlePutClass"
    >
      <a-form-model :wrapper-col="{ span: 20 }" :label-col="{ span: 4 }">
        <a-form-model-item v-if="!isBatchEdit" label="软件包名">
          <a-input v-model="selectRow.package" :disabled="true" />
        </a-form-model-item>
        <a-form-model-item label="节点选择">
          <a-select
            placeholder="请选择节点"
            mode="multiple"
            @change="handleNodeChange"
          >
            <a-select-option v-for="item in nodeData" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="分组选择">
          <a-select
            placeholder="请选择节点分组"
            mode="multiple"
            @change="handleSelectChange"
          >
            <a-select-option v-for="item in list" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
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
        :model="listQuery"
        :wrapper-col="{ span: 20 }"
        :label-col="{ span: 4 }"
      >
        <a-form-model-item label="级别">
          <a-select
            v-model="classification"
            class="filter-item"
            :disabled="loading"
          >
            <a-select-option v-for="item in classificationList" :key="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="类别">
          <a-select
            v-model="section"
            allow-clear
            show-search
            placeholder="请选择软件包类别,按回车(Enter)查找"
            class="filter-item"
          >
            <a-select-option v-for="item in sectionsList" :key="item.section">
              {{ item.section }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="软件包名">
          <a-input v-model="packageName" placeholder="请输入软件包名,按回车(Enter)查找" allow-clear />
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
import { getPlanSourceList, getSourcePackagePage, insertUserPkgPlan, putToTaskGroupQueue, getPkgSectionsList } from '@/api/repository'
import { listGroup } from '@/api/node_group'
import { getNodeList } from '@/api/node'
import PkgInstallInfo from './pkgInstallInfo.vue'
export default {
  components: {
    PkgInstallInfo
  },
  data() {
    return {
      tableHeight: 0,
      columns: [
        { title: '软件包名', dataIndex: 'package', ellipsis: true, scopedSlots: { customRender: 'package' }},
        { title: '节点数量', dataIndex: 'nodeCount', ellipsis: true, width: 100, align: 'center' },
        { title: '软件包版本', dataIndex: 'version', ellipsis: true, width: 200, scopedSlots: { customRender: 'version' }},
        { title: '类别', dataIndex: 'section', width: 100, ellipsis: true, scopedSlots: { customRender: 'section' }},
        { title: '体系架构', dataIndex: 'architecture', ellipsis: true, width: 150, scopedSlots: { customRender: 'architecture' }},
        { title: '软件包级别', dataIndex: 'classification', ellipsis: true, width: 150, scopedSlots: { customRender: 'classification' }},
        { title: '操作', width: 150, scopedSlots: { customRender: 'option' }, align: 'center' }
      ],
      planList: [],
      planName: null,
      packageName: '',
      packageList: [],
      listQuery: {
        page: 1,
        limit: 10
      },
      total: 0,
      loading: false,
      rowKeys: [],
      selectList: [],
      editVisible: false,
      classification: 'all',
      classificationList: [
        { label: '全部', value: 'all' },
        { label: '必要', value: 'necessary' },
        { label: '重要', value: 'important' },
        { label: '普通', value: 'normal' }
      ],
      selectClassList: [
        { label: '重要', value: 'important' },
        { label: '普通', value: 'normal' }
      ],
      selectRow: {},
      pkgClass: '',
      selectedRowKeys: [],
      selectedRows: [],
      isBatchEdit: true,
      putVisible: false,
      // 节点组分组
      list: [],
      // 节点分组
      nodeData: [],
      // 所选节点组Id
      selectGroup: [],
      // 所选节点Id
      selectNode: [],
      pkgInfoDrawerTitle: '',
      pkgInfoDrawerVisible: false,
      // 软件包类别
      section: undefined,
      sectionsList: [],
      searchVisible: false
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.classification === 'necessary'
          }
        })
      }
    },
    pagination() {
      return {
        total: this.total,
        current: this.listQuery.page || 1,
        pageSize: this.listQuery.limit || 10,
        pageSizeOptions: ['10', '20', '30', '50'],
        showSizeChanger: true,
        showTotal: (total) => {
          return `共 ${total} 条`
        },
        showSizeChange: this.onShowSizeChange
      }
    }
  },
  created() {
    this.initData()
    this.listGroup()
    this.getNodeList()
    this.getPkgSectionsList()
  },
  mounted() {
    setTimeout(() => {
      this.tableHeight = this.$refs.package.clientHeight - 140
    })
  },
  methods: {
    getPkgSectionsList() {
      getPkgSectionsList().then(res => {
        this.sectionsList = res.data || []
      })
    },
    getPlanList() {
      getPlanSourceList().then(res => {
        this.planList = res.data
      })
    },
    initData() {
      getPlanSourceList().then(res => {
        this.planList = res.data || []
        if (this.planList.length > 0) {
          this.planName = this.planList[0].planName
          this.getPackageByPage()
        }
      })
    },
    freshenList() {
      this.listQuery.page = 1
      this.listQuery.limit = 10
      this.classification = 'all'
      this.getPackageByPage()
    },
    changeClassification() {
      this.listQuery.page = 1
      this.listQuery.limit = 10
      this.getPackageByPage()
    },
    changePackage() {
      if (this.packageName === '') {
        this.changeClassification()
      }
    },
    getPackageByPage() {
      const params = {
        page: this.listQuery.page,
        limit: this.listQuery.limit,
        pkgClass: this.classification,
        modelName: this.planName,
        packageName: this.packageName,
        section: this.section
      }
      this.loading = true
      getSourcePackagePage(params).then(res => {
        if (res.code === 200) {
          this.total = Number(res.data?.total) || 0
          this.packageList = res.data?.list || []
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 页数或者每页个数发生变化
    onShowSizeChange(pagination) {
      this.listQuery.page = pagination.current
      this.listQuery.limit = pagination.pageSize
      this.getPackageByPage()
    },
    // 多选包
    onSelectChange(rows, select) {
      this.rowKeys = rows
      this.selectList = select
    },
    editPakClass(row) {
      this.pkgClass = ''
      this.isBatchEdit = false
      this.editVisible = true
      this.selectRow = row
    },
    batchEditPakClass() {
      this.isBatchEdit = true
      this.editVisible = true
    },
    // 下发
    putPakClass(row) {
      this.selectGroup = []
      this.selectNode = []
      this.isBatchEdit = false
      this.putVisible = true
      this.selectRow = row
    },
    // 确定编辑
    handleEditClass() {
      if (this.pkgClass === '') {
        this.$notification.error({ message: '请选择软件包类别' })
        return
      }
      let changePkgIds = []
      if (this.isBatchEdit) {
        // 过滤不用改变的软件包类别
        changePkgIds = this.selectedRows.filter(item => item.classification !== this.pkgClass).map(item => item.id)
      } else {
        changePkgIds.push(this.selectRow.id)
      }
      if (changePkgIds.length === 0) {
        this.selectedRowKeys = []
        this.selectedRows = []
        this.editVisible = false
        this.$notification.success({ message: '修改软件包类别成功' })
        return
      }
      const params = {
        pkgClass: this.pkgClass,
        pkgIds: JSON.stringify(changePkgIds)
      }
      insertUserPkgPlan(params).then(res => {
        if (res.code === 200) {
          this.selectedRowKeys = []
          this.selectedRows = []
          this.changeClassification()
          this.$notification.success({ message: '修改软件包类别成功' })
          this.editVisible = false
        }
      })
    },
    // 确定下发
    handlePutClass() {
      if (this.selectGroup.length === 0 && this.selectNode.length === 0) {
        this.$notification.error({ message: '请选择需下发的节点或分组' })
        return
      }
      let changePkgIds = []
      if (this.isBatchEdit) {
        changePkgIds = this.selectedRows.filter(item => item.classification !== this.pkgClass)
      } else {
        changePkgIds.push(this.selectRow)
      }

      const taskList = changePkgIds.map(item => ({
        nodeId: item.id,
        version: item.version,
        Architecture: item.architecture,
        taskTarget: item.package,
        taskAction: 'install'
      }))
      this.selectedRows = []
      this.selectedRowKeys = []
      this.putVisible = false
      putToTaskGroupQueue({ groupIds: this.selectGroup, nodeIds: this.selectNode, taskList }).then(res => {
        if (res.code === 200) {
          this.$notification.success({ message: '下发成功' })
          this.changeClassification()
        }
      })
    },
    // 节点组分组查询
    listGroup() {
      listGroup({ pageNum: 1, pageSize: 99999 }).then(res => {
        if (res.code === 200) {
          this.list = res.data.list
        }
      })
    },
    // 节点分组查询
    getNodeList() {
      getNodeList().then(res => {
        if (res.code === 200) {
          const nodeList = res.data || []
          this.nodeData = nodeList.filter((element) => {
            if (element.checkStatus && element.openStatus) return element
          })
        }
      })
    },
    handleSelectChange(value) {
      this.selectGroup = value
    },
    handleNodeChange(value) {
      this.selectNode = value
    },

    handlePkgInfo(row) {
      this.selectRow = row
      this.pkgInfoDrawerTitle = `软件包 ${row.package} 安装情况`
      this.pkgInfoDrawerVisible = true
    },

    onClosePkgDrawer() {
      this.pkgInfoDrawerVisible = false
    },

    openSearch() {
      this.searchVisible = true
      // this.getNodeGroup('')
    },
    sumbitSearch() {
      this.search()
      this.searchVisible = false
    },
    search() {
      this.listQuery.page = 1
      this.listQuery.limit = 10
      this.getPackageByPage()
    },
    resetSearch() {
      this.planName = this.planList[0]?.planName
      this.classification = 'all'
      this.section = undefined
      this.packageName = ''
      this.search()
    }
  }
}
</script>

<style scoped lang="scss">
  .package{
    height: 100%;
  }
  ::v-deep.ant-pagination{
    margin-top: 15px;
  }
  ::v-deep .ant-table-wrapper{
  height: 100%;
  .ant-spin-nested-loading{
    height: 100%;
    .ant-spin-container{
      height: 100%;
      .ant-table{
        height: calc(100% - 130px);
      }
    }
  }
}
</style>
