<template>
  <div>
    <!-- :scroll="{x: 900, y: tableHeight - 50}" -->
    <!-- :key="tableKey" -->
    <a-table
      :key="defaultTableKey"
      :data-source="tableData"
      bordered
      :columns="columns"
      :pagination="pagination"
      children-column-name="nodeInfoList"
      default-expand-all-rows
      :scroll="{x: 900, y: 500}"
      :loading="loading"
      @change="change"
    >
      <span slot="system" slot-scope="text" placement="topLeft" :title="text">{{ text }}</span>
    </a-table>
  </div>
</template>

<script>
import { getPkgByFile } from '@/api/fs'
export default {
  props: {
    fileName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultTableKey: 1,
      tableData: [],
      listQuery: {
        total: 0,
        pageNum: 1,
        pageSize: 10
      },
      loading: false,
      columns: [
        { title: '软件包名', dataIndex: 'name', key: 'name', width: 200, ellipsis: true },
        { title: '节点地址', dataIndex: 'url', key: 'url', width: 150, ellipsis: true },
        { title: '系统版本', dataIndex: 'system', key: 'system', ellipsis: true, scopedSlots: { customRender: 'system' }},
        { title: '内核版本', dataIndex: 'kernel', key: 'kernel', ellipsis: true, scopedSlots: { customRender: 'kernel' }}
      ]
    }
  },
  computed: {
    pagination() {
      return {
        total: this.listQuery.total || 0,
        current: this.listQuery.pageNum || 1,
        pageSize: this.listQuery.pageSize || 10,
        pageSizeOptions: ['10', '20', '50'],
        showSizeChanger: true,
        showTotal: (total) => {
          return `共 ${total} 条`
        }
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      return new Promise((resolve, reject) => {
        getPkgByFile({
          pkgFile: this.fileName
        })
          .then(res => {
            res.data.nodePkgVoList.forEach((item, index) => {
              item.key = index
              item?.nodeInfoList && item?.nodeInfoList?.forEach((nodeInfo, jIndex) => {
                nodeInfo.key = nodeInfo.name + jIndex
              })
            })
            this.tableData = res.data.nodePkgVoList
            // 更新defaultTableKey，使default-expand-all-rows生效，默认展开
            this.defaultTableKey = this.tableKey(this.defaultTableKey)
            resolve(res)
          })
          .catch((err) => { reject(err) })
          .finally(() => { this.loading = false })
      })
    },

    tableKey(defaultNum) {
      let randNumber
      do {
        randNumber = Math.floor(Math.random() * 10)
      } while (randNumber === defaultNum)

      return randNumber
    },

    // 分页、排序、筛选变化时触发
    change(pagination) {
      this.listQuery.pageNum = pagination.current
      this.listQuery.pageSize = pagination.pageSize
      this.defaultTableKey = this.tableKey(this.defaultTableKey)
    }
  }
}
</script>

<style lang="scss" scoped></style>
