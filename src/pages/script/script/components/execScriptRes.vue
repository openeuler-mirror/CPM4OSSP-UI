<template>
  <div>
    <!-- :scroll="{ y: tableHeight - 50}" -->
    <a-table
      ref="table"
      :loading="loading"
      :columns="columns"
      :pagination="false"
      :scroll="{ y: 700}"
      :data-source="tableData"
    >
      <a slot="nodeName" slot-scope="text">{{ text }}</a>

      <a slot="result" slot-scope="text">{{ text }}</a>

      <template slot="exitValue" slot-scope="text, record">
        <a-icon v-if="record.exitValue === 200" type="check-circle" class="success" />
        <a-icon v-else type="close-circle" class="danger" />
      </template>
    </a-table>
  </div>
</template>

<script>
export default {
  props: {
    resultData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      loading: true,
      tableData: [],
      columns: [
        { title: '脚本名称', dataIndex: 'nodeName', key: 'nodeName', width: 100, ellipsis: true },
        { title: '信息', dataIndex: 'result', key: 'result', width: 100, ellipsis: true },
        { title: '结果', dataIndex: 'exitValue', key: 'exitValue', scopedSlots: { customRender: 'exitValue' }, width: 100, ellipsis: true, align: 'center' }
      ]
    }
  },
  watch: {
    tableData: {
      handler(val) {
        if (this.tableData.length > 0) this.loading = false
      }
    }
  },
  created() {
    this.tableData = this.resultData
  }

}
</script>

<style>

</style>
