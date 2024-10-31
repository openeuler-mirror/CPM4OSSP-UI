<template>
  <div ref="tableBox" style="height: 100%;">
    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      :scroll="{ y: tableHeight - 50}"
      @change="change"
    >
      <a slot="id" slot-scope="text">{{ text }}</a>
      <a slot="ip" slot-scope="text">{{ text }}</a>
      <a slot="path" slot-scope="text">{{ text }}</a>
      <a slot="result" slot-scope="text">{{ text }}</a>
      <a slot="exitValue" slot-scope="text">{{ text }}</a>
    </a-table>
  </div>
</template>

<script>
import { getExecResApi } from '@/api/script'

export default {
  props: {
    type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tableHeight: 0,
      loading: false,
      tableData: [],
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      columns: [
        { title: 'id', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
        { title: 'ip', dataIndex: 'ip', key: 'ip', width: 100, ellipsis: true },
        { title: '路径', dataIndex: 'path', key: 'path', width: 100, ellipsis: true },
        { title: '信息', dataIndex: 'result', key: 'result', width: 100, ellipsis: true },
        { title: '结果', dataIndex: 'exitValue', key: 'exitValue', width: 100, ellipsis: true, align: 'center' }
      ]
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
    this.getRes()
    setTimeout(() => {
      this.tableHeight = this.$refs.tableBox?.clientHeight ? this.$refs.tableBox?.clientHeight - 140 : 600
    })
  },
  methods: {
    getRes() {
      this.loading = true
      getExecResApi({
        type: this.type,
        ...this.listQuery
      })
        .then(res => {
          if (res.code === 200) {
            this.total = Number(res.data?.total) || 0
            this.tableData = res.data?.list || []
          }
        })
        .finally(() => { this.loading = false })
    },

    // 分页、排序、筛选变化时触发
    change(pagination) {
      this.listQuery.pageNum = pagination.current
      this.listQuery.pageSize = pagination.pageSize
      this.getRes()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
