<template>
  <div ref="tableBox" style="height: 100%;">
    <div ref="filter" class="filter">
      <a-button type="primary" icon="plus" @click="handleAddCommand">添加命令</a-button>
      <a-button type="primary" @click="handleExecRes">下发结果</a-button>
    </div>

    <a-table
      ref="table"
      :loading="loading"
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      :scroll="{x: 900, y: tableHeight - 50}"
      @change="change"
    >
      <a slot="param" slot-scope="text">{{ text }}</a>
      <a slot="path" slot-scope="text">{{ text }}</a>
      <a slot="createTime" slot-scope="text">{{ text }}</a>
      <template slot="operation" slot-scope="text, record">
      </template>
    </a-table>

  </div>
</template>

<script>
import { getCmommandListApi } from '@/api/script'

export default {
  components: {
    Commandform,
    ExecScript,
    ExecScriptRes,
    ExecResult
  },
  data() {
    return {
      loading: false,
      tableHeight: 0,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      selectedRow: null,
      columns: [
        { title: '命令名称', dataIndex: 'param', key: 'param', width: 100, ellipsis: true },
        { title: '执行路径', dataIndex: 'path', key: 'path', width: 100, ellipsis: true },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 100, ellipsis: true },
        { title: '操作', dataIndex: 'operation', key: 'operation', width: 60, ellipsis: true, scopedSlots: { customRender: 'operation' }, align: 'center' }
      ],
      buttonLoading: false
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
  created() {
    this.loadData()
  },
  mounted() {
    setTimeout(() => {
      this.tableHeight = this.$refs.tableBox.clientHeight - 140
    })
  },
  methods: {
    loadData() {
      this.loading = true
      getCmommandListApi({
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize
      })
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data?.list
            this.total = Number(res.data?.total || 0)
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },

    // 分页、排序、筛选变化时触发
    change(pagination) {
      this.listQuery.pageNum = pagination.current
      this.listQuery.pageSize = pagination.pageSize
      this.loadData()
    }

  }
}

</script>

<style scoped>
.ant-btn{
  margin-right: 10px;
}
</style>
