<template>
  <a-table
    :row-selection="{ onChange: onSelectChange, selectedRowKeys: rowKeys }"
    :columns="columns"
    :data-source="dataList"
    bordered
    :row-key="(record, index) => record.nodeId"
  >
    <template slot="code" slot-scope="text">
      <span v-if="text !== 200"><a-icon :style="{ color: '#ff7875', paddingRight: '3px' }" type="close" /> 失败</span>
      <span v-else><a-icon :style="{ color: 'rgb(82, 196, 26)', paddingRight: '3px' }" type="check" /> 成功</span>
    </template>
    <template slot="msg" slot-scope="text, record">
      <span v-if="record.code === 400">
        {{ text }},所配置的源不可用,建议进行回滚
      </span>
      <span v-else>{{ text }}</span>
    </template>
  </a-table>
</template>

<script>
export default {
  props: {
    dataList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      columns: [
        { title: '节点Id', dataIndex: 'nodeId', width: 80 },
        { title: '结果', dataIndex: 'code', width: 120, scopedSlots: { customRender: 'code' }},
        { title: '原因', dataIndex: 'msg', scopedSlots: { customRender: 'msg' }, elipisi: true }
      ],
      rowKeys: [],
      selecList: []
    }
  },
  methods: {
    onSelectChange(rows, select) {
      this.rowKeys = rows
      this.selecList = select
    }
  }
}
</script>
