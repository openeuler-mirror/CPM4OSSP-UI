<template>
  <div ref="package" class="package">
    <div ref="filter" class="filter">
      <a-select
        v-model="planName"
        placeholder="请选择软件源模板"
        class="filter-item"
        :disabled="loading"
        @dropdownVisibleChange="getPlanList"
        @change="freshenList"
      >
        <a-select-option v-for="item in planList" :key="item.planName">
          {{ item.planName }}
        </a-select-option>
      </a-select>
      <a-select
        v-model="classification"
        class="filter-item"
        :disabled="loading"
        @change="changeClassification"
      >
        <a-select-option v-for="item in classificationList" :key="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-input v-model="packageName" class="width-300 mr-10" placeholder="请输入软件包名,按回车(Enter)查找" allow-clear @pressEnter="changeClassification" @change="changePackage" />
      <a-button type="primary" :disabled="selectedRows.length===0" @click="batchEditPakClass">批量修改软件包类别</a-button>
    </div>
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
        <a-tooltip title="编辑">
          <a-button type="link" :disabled="record.classification === 'necessary'" @click="editPakClass(record)"><a-icon type="edit" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
    <a-modal
      v-model="editVisible"
      :title="(isBatchEdit?'批量':'')+'修改软件包类别'"
      :destroy-on-close="true"
      width="700px"
      @ok="handleEditClass"
    >
      <a-form-model :wrapper-col="{ span: 20 }" :label-col="{ span: 4 }">
        <a-form-model-item v-if="!isBatchEdit" label="软件包名">
          <a-input v-model="selectRow.package" :disabled="true" />
        </a-form-model-item>
        <a-form-model-item label="类别">
          <a-select v-model="pkgClass" placeholder="请选择软件包类别">
            <a-select-option
              v-for="item in selectClassList"
              :key="item.value"
              :disabled="!isBatchEdit&&item.value === selectRow.classification"
            >{{ item.label }}</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { getPlanSourceList, getSourcePackagePage, insertUserPkgPlan } from '@/api/repository'
export default {
  data() {
    return {
      tableHeight: 0,
      columns: [
        { title: '软件包名', dataIndex: 'package', ellipsis: true, scopedSlots: { customRender: 'package' }},
        { title: '软件包版本', dataIndex: 'version', ellipsis: true, width: 200, scopedSlots: { customRender: 'version' }},
        { title: '体系架构', dataIndex: 'architecture', ellipsis: true, width: 150, scopedSlots: { customRender: 'architecture' }},
        { title: '软件包类别', dataIndex: 'classification', ellipsis: true, width: 150, scopedSlots: { customRender: 'classification' }},
        { title: '操作', width: 100, scopedSlots: { customRender: 'option' }, align: 'center' }
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
      isBatchEdit: true
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
  },
  mounted() {
    setTimeout(() => {
      this.tableHeight = this.$refs.package.clientHeight - 140
    })
  },
  methods: {
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
        packageName: this.packageName
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
    onShowSizeChange(pagination) {
      this.listQuery.page = pagination.current
      this.listQuery.limit = pagination.pageSize
      this.getPackageByPage()
    },
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