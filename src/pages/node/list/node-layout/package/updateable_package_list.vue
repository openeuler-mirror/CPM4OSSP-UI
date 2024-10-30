<template>
  <div>
    <a-table
      :row-selection="{ onChange: onSelectChange, selectedRowKeys: rowKeys }"
      :data-source="list"
      :columns="columns"
      :row-key="record => record.name"
      :loading="loading"
      ok-text="升级"
      :style="{ 'max-height': '600px', 'min-height': '250px' }"
      :scroll="{ y: 480 }"
      bordered
    />
  </div>
</template>

<script>
import { getUpdateablePackage } from '@/api/node_package'
export default {
  props: {
    nodeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      list: [],
      columns: [
        { title: '软件包名', dataIndex: 'name', ellipsis: true },
        { title: '当前版本', dataIndex: 'nowVersion', ellipsis: true },
        { title: '可升级版本', dataIndex: 'newVersion', ellipsis: true }
      ],
      rowKeys: [],
      selectList: [],
      loading: true
    }
  },
  created() {
    this.getUpdateablePackage()
  },
  methods: {
    getUpdateablePackage() {
      this.loading = true
      getUpdateablePackage(this.nodeId).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data
        }
      }).catch(() => {
        this.loading = false
      })
    },
    onSelectChange(row, selectList) {
      this.rowKeys = row
      this.selectList = selectList
    },
    handleSubmit() {
      return new Promise((resolve, reject) => {
        if (this.selectList.length === 0) {
          this.$notification.error({ message: '请选择要升级的软件包' })
          reject()
        }
        resolve(this.selectList)
      })
    }
  }
}
</script>
