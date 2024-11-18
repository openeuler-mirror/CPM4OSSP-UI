<template>
  <div style="max-height:500px;overflow:auto">
    <a-table
      ref="allNodeTable"
      :loading="loading"
      :columns="columns"
      :data-source="list"
      :pagination="false"
      row-key="id"
      bordered
    >
      <a-tooltip slot="name" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="createTime" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="group" slot-scope="text" placement="topLeft" :title="text">
        <span v-if="text">{{ text }}</span>
        <span v-else style="color:gray">暂无分组</span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="添加节点">
          <a-button type="link" :disabled="record.disabled" @click="addnode(record)"><a-icon type="plus-circle" /></a-button>
        </a-tooltip>

      </template>
    </a-table>
  </div>
</template>

<script>
import { getNodeList } from '@/api/node'
import { addnode } from '@/api/node_group'
export default {
  props: {
    parentList: {
      type: Array,
      default: () => []
    },
    parentMsg: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      columns: [
        { title: '节点 ID', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
        { title: '节点名称', dataIndex: 'name', key: 'name', width: 200, ellipsis: true, scopedSlots: { customRender: 'name' }},
        { title: '节点地址', dataIndex: 'url', key: 'url', width: 150, ellipsis: true },
        { title: '节点所属分组', dataIndex: 'group', key: 'group', ellipsis: true, scopedSlots: { customRender: 'group' }},
        { title: '操作', dataIndex: 'operation', key: 'operation', width: 80, scopedSlots: { customRender: 'operation' }, align: 'center' }
      ]
    }
  },
  watch: {
    'parentList.length': {
      handler(val) {
        this.banedNode()
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    // 加载数据
    loadData() {
      this.list = []
      this.loading = true
      getNodeList().then((res) => {
        if (res.code === 200) {
          const nodeList = res.data || []
          this.list = nodeList.filter((element) => {
            if (element.checkStatus) return element
          })
          this.banedNode()
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 遍历数据，对重复节点添加进行限制
    banedNode() {
      this.list.forEach(element => {
        // 有分组节点无法再分组
        if (element.group)element.disabled = true
        this.parentList.forEach(param => {
          if (element.id === param.nodeId)element.disabled = true
        })
      })
      this.list = [...this.list]
    },
    // 添加节点入组
    addnode(record) {
      this.$confirm({
        title: '系统提示',
        content: '确定要添加 ' + record.name + ' 入组吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          addnode({
            nodeId: record.id,
            groupId: this.parentMsg.id
          }).then(res => {
            if (res.code === 200) {
              this.$emit('nodelist')
              this.list.forEach(element => {
                // 手动置灰
                if (element.id === record.id) {
                  element.disabled = true
                  element.group = this.parentMsg.name
                }
              })
              // this.loadData()
            }
          })
        }
      })
    }
  }
}
</script>

<style>

</style>
