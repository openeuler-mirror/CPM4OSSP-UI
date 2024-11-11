<template>

  <div ref="listSet" class="listSet">
    <div ref="filter" class="filter">
      <a-button type="primary" icon="plus" @click="penddingAddVisble = true">添加节点</a-button>
    </div>
    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="list"
      max-height="calc(100vh - 145px)"
      row-key="nodeId"
      :pagination="false"
      bordered
    >
      <a-tooltip slot="nodeId" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="createTime" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="节点管理">
          <a-button :disabled="record.status === 0" type="link" @click="handleNode(record)"><a-icon type="desktop" /></a-button>
        </a-tooltip>
        <a-tooltip title="移除">
          <a-button type="link" @click="deletenode(record)"><a-icon type="delete" class="danger" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
    <!-- 展示待添加节点 -->
    <a-modal
      v-model="penddingAddVisble"
      title="待添加节点"
      :width="800"
    >
      <AllNode v-if="penddingAddVisble" :parent-list="list" :parent-msg="parentMsg" @nodelist="nodelist" />
      <template slot="footer">
        <a-button type="primary" @click="penddingAddVisble = false">
          关闭
        </a-button>
      </template>
    </a-modal>
    <!-- 管理节点 -->
    <a-drawer class="nodeManager" :title="drawerTitle" placement="right" width="100%" :visible="drawerVisible" @close="onClose">
      <!-- 节点管理组件 -->
      <node-layout v-if="drawerVisible" :node="temp" />
    </a-drawer>
  </div>
</template>

<script>
import { parseTime } from '@/utils/time'
import NodeLayout from '@/pages/node/list/node-layout'
import { nodelist, deletenode } from '@/api/node_group'
import { getNodeStatus, setNodeLocalIp, getNodeList } from '@/api/node'

import AllNode from './all_node.vue'
export default {
  components: {
    AllNode,
    NodeLayout
  },
  props: {
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
      tableHeight: 0,
      columns: [
        { title: '节点 ID', dataIndex: 'nodeId', key: 'nodeId', width: 100, ellipsis: true },
        { title: '节点名称', dataIndex: 'name', key: 'name', ellipsis: true },
        { title: '添加进组时间', dataIndex: 'createTime', key: 'createTime', ellipsis: true, customRender: (text) => { return parseTime(text) } },
        { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: 'operation' }, width: 120, align: 'center' }
      ],
      nodeMsgs: [],
      drawerTitle: '',
      penddingAddVisble: false,
      drawerVisible: false,
      temp: []
    }
  },
  watch: {
    nodeMsgs: {
      handler(val) {
        if (val.length && this.drawerVisible) {
          const nodeId = this.$route.query.nodeId
          const node = val.find(item => item.id === nodeId)
          if (node.status === 0) {
            this.onClose()
            this.$notification.warning({ message: `节点${node.name}(${node.url})已离线` })
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    setTimeout(() => {
      this.tableHeight = this.$refs.listSet.clientHeight - 140
    })
    this.loadData()
  },
  methods: {
    nodelist() {
      this.loading = true
      nodelist({ groupId: this.parentMsg.id, pageNum: 1, pageSize: 99999 }).then(res => {
        if (res.code === 200) {
          // 对已查询的接口做标记，以减少调取次数
          const originalList = [...this.list]
          this.list = res.data.list
          this.list.forEach(element => {
            originalList.forEach(param => {
              if (element.nodeId === param.nodeId) {
                element.checked = param?.checked
                if (param?.checked)element.status = param?.status
              }
            })
          })
          // 赋值基本属性
          this.list.forEach(element => {
            this.nodeMsgs.forEach(param => {
              if (element.nodeId === param.id) {
                element.url = param.url
                element.name = param.name
                element.cycle = param.cycle
                element.id = param.id
              }
            })
          })
          this.getAllNodeStatus()
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 删除节点
    deletenode(record) {
      this.$confirm({
        title: '系统提示',
        content: '确定要移除 ' + record.nodeId + ' 出组吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          deletenode({ groupId: this.parentMsg.id, nodeId: record.nodeId }).then(res => {
            if (res.code === 200) {
              this.nodelist()
            }
          })
        }
      })
    },
    // 判断当前主机列表中所有主机状态
    getAllNodeStatus() {
      let promiseList = []
      this.list.forEach(item => {
        if (!item.checked) {
          const p = getNodeStatus(item.nodeId).then(res => {
            if (res.code === 200) {
            // 主机在线
              item['status'] = 1
              this.list = [...this.list]
              // 获取到节点调用一次编辑接口
              const query = JSON.parse(JSON.stringify(item))
              query.type = ''
            } else {
              item['status'] = 0
              item.system = '--'
              item.kernel = '--'
            }
          }).catch(() => {
            item['status'] = 0
            item.system = '--'
            item.kernel = '--'
          }).finally(() => {
            item.checked = true
          })
          promiseList.push(p)
        }
      })
      Promise.all(promiseList).then(() => {
        this.list = [...this.list]
      })
    },
    // 管理节点
    handleNode(record) {
      setNodeLocalIp({ nodeId: record.nodeId, nodeIp: record.url.split(':')[0] }).then(() => {
        this.temp = Object.assign(record)
        this.drawerTitle = `${this.temp.name} (${this.temp.url})`
        this.drawerVisible = true
        let nodeId = this.$route.query.nodeId
        if (nodeId !== record.id) {
          this.$router.push({
            query: { nodeId: record.id }
          })
        }
      })
    },
    // 加载数据
    loadData() {
      this.loading = true
      this.nodeMsgs = []
      getNodeList().then((res) => {
        if (res.code === 200) {
          this.nodeMsgs = res.data || []
          this.nodelist()
        }
      }).finally(() => {

      })
    },
    // 关闭抽屉层
    onClose() {
      this.drawerVisible = false
      this.$router.push({
        query: { nodeId: null }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
//  .listSet{
//   height:calc(100vh - 210px)
//  }
</style>
