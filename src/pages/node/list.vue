<template>
  <div>
    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="list"
      :style="{ 'max-height': tableHeight + 'px' }"
      :scroll="{x:900, y: tableHeight}"
      row-key="id"
      :pagination="false"
      bordered
    >
      <a-tooltip slot="name" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="status" slot-scope="text">
        <a-icon v-if="text===undefined" type="loading" />
        <span v-if="text == 1"><a-icon class="success" :style="{ paddingRight: '3px' }" type="check" /> 在线</span>
        <span v-if="text == 0"><a-icon class="danger" :style="{ paddingRight: '3px' }" type="close" /> 离线</span>
      </template>
      <a-tooltip slot="system" slot-scope="text" placement="topLeft" :title="text">
        <a-icon v-if="text===undefined" type="loading" />
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="kernel" slot-scope="text" placement="topLeft" :title="text">
        <a-icon v-if="text===undefined" type="loading" />
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="删除">
          <a-button type="link" @click="handleDelete(record)"><a-icon type="delete" class="danger" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
    <a-modal
      v-model="editNodeVisible"
      :title="temp.title"
      :mask-closable="false"
      :destroy-on-close="true"
      width="700px"
      @keyup.native.enter="handleEditNodeOk"
      @ok="handleEditNodeOk"
    >
      <node-operation ref="operationForm" :temp="temp" />
    </a-modal>
    <a-drawer class="nodeManager" :title="drawerTitle" placement="right" width="100%" :visible="drawerVisible" @close="onClose">
      <node-layout v-if="drawerVisible" :node="temp" />
    </a-drawer>
  </div>
</template>

<script>
import { getNodeList, deleteNode, getNodeStatus, getOsVersion, editNode } from '@/api/node'
import { isIpAndPort } from '@/utils/validate'
import NodeOperation from './components/node_operation.vue'
import NodeLayout from './node-layout'

export default {
  components: {
    NodeOperation,
    NodeLayout
  },
  data() {
    return {
      loading: false,
      listQuery: {},
      tableHeight: '70vh',
      list: [],
      temp: {
        formData: {}
      },
      drawerTitle: '',
      columns: [
        { title: '节点 ID', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
        { title: '节点名称', dataIndex: 'name', key: 'name', ellipsis: true, scopedSlots: { customRender: 'name' }},
        { title: '节点地址', dataIndex: 'url', key: 'url', width: 150, ellipsis: true },
        { title: '状态', dataIndex: 'status', key: 'status', width: 100, ellipsis: true, scopedSlots: { customRender: 'status' }},
        { title: '系统版本', dataIndex: 'system', key: 'system', ellipsis: true, scopedSlots: { customRender: 'system' }},
        { title: '内核版本', dataIndex: 'kernel', key: 'kernel', ellipsis: true, scopedSlots: { customRender: 'kernel' }},
        { title: '超时时间', dataIndex: 'timeOut', key: 'timeOut', width: 100, ellipsis: true },
        { title: '操作', dataIndex: 'operation', key: 'operation', scopedSlots: { customRender: 'operation' }, width: 200, align: 'center' }
      ],
      timer: null,
      editNodeVisible: false,
      drawerVisible: false    
    }
  },
  watch: {
    list: {
      handler(val) {
        if (val.length && this.drawerVisible) {
          const nodeId = this.$route.query.nodeId
          const node = val.find(item => item.id === nodeId)
          if (node.status === 0) {
            this.onClose()
            this.$notification.warning({ message: `节点${node.name}(${node.url})已离线，节点管理抽屉关闭` })
          }
        }
      },
      deep: true
    }
  },
  created() {
    // 计算表格高度
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - this.$refs['filter'].clientHeight - 135
    })
    this.loadData()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    loadData() {
      if (this.timer != null) clearInterval(this.timer)
      this.list = []
      this.loading = true
      getNodeList(this.listQuery).then((res) => {
        if (res.code === 200) {
          this.list = res.data || []
          this.getAllNodeStatus()
          this.timer = setInterval(this.getAllNodeStatus, 60 * 1000)
          let nodeId = this.$route.query.nodeId
          this.list.forEach((item) => {
            if (nodeId === item.id) {
              this.handleNode(item)
            }
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },
    getAllNodeStatus() {
      let promiseList = []
      this.list.forEach(item => {
        const p = getNodeStatus(item.id).then(res => {
          if (res.code === 200) {
            item['status'] = 1
            this.list = [...this.list]
            const query = JSON.parse(JSON.stringify(item))
            query.type = ''
            editNode(query)
            getOsVersion({ nodeId: item.id }).then(res => {
              if (res.code === 200) {
                item.system = res.data.system
                item.kernel = res.data.kernel
                this.list = [...this.list]
              } else {
                getOsVersion({ nodeId: item.id }).then(res => {
                  if (res.code === 200) {
                    item.system = res.data.system
                    item.kernel = res.data.kernel
                    this.list = [...this.list]
                  } else {
                    getOsVersion({ nodeId: item.id }).then(res => {
                      if (res.code === 200) {
                        item.system = res.data.system
                        item.kernel = res.data.kernel
                      } else {
                        item.system = '--'
                        item.kernel = '--'
                      }
                      this.list = [...this.list]
                    })
                  }
                })
              }
            }).catch(() => {
              item.system = '--'
              item.kernel = '--'
              this.list = [...this.list]
            })
          } else {
            item['status'] = 0
            item.system = '--'
            item.kernel = '--'
          }
        }).catch(() => {
          item['status'] = 0
          item.system = '--'
          item.kernel = '--'
        })
        promiseList.push(p)
      })
      Promise.all(promiseList).then(() => {
        this.list = [...this.list]
      })
    },
    handleDelete(record) {
      this.$confirm({
        title: '系统提示',
        content: '真的要删除节点么？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          // 删除
          deleteNode(record.id).then((res) => {
            if (res.code === 200) {
              this.$notification.success({
                message: res.msg,
                duration: 2
              })
              this.loadData()
            }
          })
        }
      })
    },
    // 自定义检验url
    checkUrl(rule, value, callback) {
      if (!isIpAndPort(value)) {
        return callback(new Error('请填写正确的ip地址+端口号'))
      }
      callback()
    },
    handleAdd() {
      this.temp.formData = {}
      this.temp = {
        type: 'add',
        title: '注册节点',
        formData: {
          cycle: 0,
          protocol: 'http',
          openStatus: true,
          timeOut: 0,
          loginName: 'mpmsProxy'
        }
      }
      this.editNodeVisible = true
    },
    handleEdit(record) {
      this.temp = {
        type: 'edit',
        title: '编辑节点',
        formData: {
          ...record
        }
      }
      this.editNodeVisible = true
    },
    handleEditNodeOk() {
      this.$refs['operationForm'].handleSubmit().then(() => {
        // 节点信息处理
        this.editNodeVisible = false
        this.loadData()
      })
    },
    handleNode(record) {
      setNodeLocalIp({ nodeId: record.id, nodeIp: record.url.split(':')[0] }).then(() => {
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
    onClose() {
      this.drawerVisible = false
      this.$router.push({
        query: { nodeId: null }
      })
    }
  }
}
</script>

<style scoped>
.filter {
  margin-bottom: 10px;
}

.ant-btn {
  margin-right: 10px;
}

.filter-item {
  width: 150px;
  margin-right: 10px;
}

.btn-add {
  margin-left: 10px;
  margin-right: 0;
}
</style>
