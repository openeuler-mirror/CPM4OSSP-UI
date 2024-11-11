<template>
  <div ref="groupManage" class="groupManage">
    <div ref="filter" class="filter">
      <a-button type="primary" icon="search" @click="openGroupSearch()">条件搜索</a-button>
      <a-button type="primary" icon="sync" class="ml10" @click="resetSearch">重置</a-button>
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
        <a-tooltip title="组内节点">
          <a-button type="link" @click="handleNode(record)"><a-icon type="snippets" /></a-button>
        </a-tooltip>
        <a-tooltip title="编辑">
          <a-button type="link" @click="handleEdit(record)"><a-icon type="edit" /></a-button>
        </a-tooltip>
        <a-tooltip title="删除">
          <a-button type="link" @click="handleDelete(record)"><a-icon type="delete" class="danger" /></a-button>
        </a-tooltip>
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
    <!-- 控制组内节点 -->
    <a-drawer
      :title="'组内节点( '+parentMsg.name+' )'"
      placement="right"
      :mask-closable="false"
      :width="700"
      height="100%"
      :visible="nodelistVisible"
      @close="closeShowNodeList"
    >
      <NodeList v-if="nodelistVisible" :parent-msg="parentMsg" />
    </a-drawer>
    <!-- 条件搜索 -->
    <a-drawer
      title="条件搜索"
      placement="right"
      :mask-closable="false"
      :width="500"
      height="100%"
      :visible="groupSearch"
      @close="groupSearch = false"
      @keyup.native.enter="sumbitGroupSearch"
    >
      <div>
        <a-form-model
          ref="searchForm"
          :model="listQuery"
          :wrapper-col="{ span: 20 }"
          :label-col="{ span: 4 }"
        >
          <a-form-model-item label="分组ID" prop="id">
            <a-input v-model="listQuery.id" placeholder="请输入分组ID,按回车(Enter)查找" />
          </a-form-model-item>
          <a-form-model-item label="分组名称" prop="name">
            <a-input v-model="listQuery.name" placeholder="请输入分组名称,按回车(Enter)查找" />
          </a-form-model-item>
        </a-form-model>
      </div>
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
        <!-- <a-button :style="{ marginRight: '8px' }" type="primary" @click="resetSearch">
          重置
        </a-button> -->
        <a-button :style="{ marginRight: '8px' }" @click="groupSearch = false">
          取消
        </a-button>
        <a-button type="primary" @click="sumbitGroupSearch">
          确定
        </a-button>
      </div>
    </a-drawer>
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
    },
    // 编辑分组
    handleEdit(record) {
      this.groupForm.name = record.name
      this.groupId = record.id
      this.controlGroupVisible = true
      this.isGroupAdd = false
    },
    // 删除分组
    handleDelete(record) {
      this.$confirm({
        title: '系统提示',
        content: '确定要删除 ' + record.name + ' 分组吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          deleteGroup({
            id: record.id
          }).then(res => {
            if (res.code === 200) {
              this.listQuery.pageNum = 1
              this.listGroup()
            }
          })
        }
      })
    },
    // 组内节点
    handleNode(record) {
      this.parentMsg = record
      this.nodelistVisible = true
    },
    closeShowNodeList() {
      this.nodelistVisible = false
    },
    // 打开条件搜索框
    openGroupSearch() {
      this.groupSearch = true
    },
    // 条件搜索
    sumbitGroupSearch() {
      this.listQuery.pageNum = 1
      this.listGroup()
      this.groupSearch = false
    },
    // 重置
    resetSearch() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 10,
        id: '',
        name: ''
      }
      this.listGroup()
      this.groupSearch = false
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
