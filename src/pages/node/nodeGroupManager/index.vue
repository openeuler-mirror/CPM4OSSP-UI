<template>
  <div ref="groupManage" class="groupManage">
    <div ref="filter" class="filter">
      <a-button type="primary" style="margin-left:10px" icon="plus" @click="openGroupAdd()">新增分组</a-button>
    </div>
    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="list"
      :scroll="{x: 900, y: tableHeight - 50}"
      row-key="id"
      :pagination="pagination"
      bordered
      @change="change"
    >
      <a-tooltip slot="name" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="createTime" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
      </template>
    </a-table>
    <!-- 控制节点分组 -->
    <a-modal
      v-model="controlGroupVisible"
      :title="isGroupAdd?'新增节点分组':'编辑节点分组'"
      :destroy-on-close="true"
      width="700px"
      @ok="controlGroup"
      @keyup.native.enter="controlGroup"
      @cancel="groupForm.name='';groupId=null"
    >
      <a-form-model
        ref="groupForm"
        :rules="rules"
        :model="groupForm"
        :wrapper-col="{ span: 20 }"
        :label-col="{ span: 4 }"
      >
        <a-form-model-item label="分组名称" prop="name">
          <a-input v-model="groupForm.name" placeholder="请输入分组名称" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { parseTime } from '@/utils/time'
import { listGroup, addGroup, updateGroup, deleteGroup } from '@/api/node_group'
import NodeList from './components/node_list.vue'
export default {
  components: {
    NodeList
  },
  data() {
    return {
      loading: false,
      tableHeight: 0,
      list: [],
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        id: '',
        name: ''
      },
      columns: [
        { title: '分组 ID', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
        { title: '分组名称', dataIndex: 'name', key: 'name', ellipsis: true, scopedSlots: { customRender: 'name' }},
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime', ellipsis: true, customRender: (text) => { return parseTime(text) } },
        { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: 'operation' }, width: 200, align: 'center' }
      ],
      // 新增分组弹框
      controlGroupVisible: false,
      // 判断为分组新增或编辑
      isGroupAdd: true,
      // 表单数据
      groupForm: {
        name: null
      },
      groupId: null,
      // 表单校验规则
      rules: {
        name: [
          { required: true, message: '分组名称不能为空', trigger: 'blur' }
        ]
      },
      nodelistVisible: false,
      // 进入组内节点
      parentMsg: {},
      // 条件搜索框
      groupSearch: false
    }
  },
  computed: {
    pagination() {
      return {
        total: this.total,
        current: this.listQuery.pageNum || 1,
        pageSize: this.listQuery.pageSize || 10,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: true,
        showTotal: (total) => {
          return `共 ${total} 条`
        }
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.tableHeight = this.$refs.groupManage.clientHeight - 140
    })
    this.listGroup()
  },
  methods: {
    // 节点分组查询
    listGroup() {
      this.loading = true
      listGroup({ ...this.listQuery }).then(res => {
        if (res.code === 200) {
          this.list = res.data.list
          this.total = Number(res.data.total)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 分页、排序、筛选变化时触发
    change(pagination) {
      this.listQuery.pageNum = pagination.current
      this.listQuery.pageSize = pagination.pageSize
      this.listGroup()
    },
    openGroupAdd() {
      this.controlGroupVisible = true
      this.isGroupAdd = true
      this.groupForm.name = ''
      this.groupId = null
    },
    // 控制分组
    controlGroup() {
      this.$refs['groupForm'].validate((valid) => {
        if (!valid) return false
        if (this.isGroupAdd) {
          // 新增
          addGroup({
            name: this.groupForm.name
          }).then((res) => {
            if (res.code === 200) {
              this.controlGroupVisible = false
              this.groupForm.name = ''
              this.groupId = null
              this.listQuery.pageNum = 1
              this.listGroup()
            }
          })
        } else {
          // 编辑
          updateGroup({
            name: this.groupForm.name,
            id: this.groupId
          }).then((res) => {
            if (res.code === 200) {
              this.controlGroupVisible = false
              this.groupForm.name = ''
              this.groupId = null
              this.listQuery.pageNum = 1
              this.listGroup()
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.groupManage{
  height:100%
}
/* 分页嵌入表格中时固定分页到底部 */
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
