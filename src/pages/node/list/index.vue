<template>
  <div>
    <div ref="filter" class="filter">
      <a-button type="primary" icon="search" @click="openSearch">条件搜索</a-button>
      <a-button type="primary" icon="sync" @click="resetSearch">重置</a-button>
      <span style="float: right;line-height: 32px;">软件包总数： {{ allPkgCount }}</span>
    </div>
    <!-- 节点表格数据 -->
    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="list"
      :pagination="pagination"
      :style="{ 'max-height': tableHeight + 'px' }"
      :scroll="{x:900, y: tableHeight}"
      row-key="id"
      bordered
      @change="change"
    >
      <a-tooltip slot="name" slot-scope="text" placement="topLeft" :title="text">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="status" slot-scope="text,record">
        <a-icon v-if="text===undefined" type="loading" />
        <span v-if="record.checkStatus === false" class="danger" style="cursor:pointer;border-bottom:1px solid" @click="registerNode(record)">
          <span> <a-icon :style="{ paddingRight: '3px' }" type="api" /> 未注册</span>
        </span>
        <span v-else>
          <span v-if="text == 1"><a-icon class="success" :style="{ paddingRight: '3px' }" type="check" /> 在线</span>
          <span v-if="text == 0"><a-icon class="danger" :style="{ paddingRight: '3px' }" type="close" /> 离线</span>
        </span>
      </template>
      <a-tooltip slot="system" slot-scope="text" placement="topLeft" :title="text">
        <!-- <a-icon v-if="text===undefined" type="loading" /> -->
        <span>{{ text || '--' }}</span>
      </a-tooltip>
      <a-tooltip slot="kernel" slot-scope="text" placement="topLeft" :title="text">
        <!-- <a-icon v-if="text===undefined" type="loading" /> -->
        <span>{{ text || '--' }}</span>
      </a-tooltip>
      <a-tooltip slot="linxSerial" slot-scope="text" placement="topLeft" :title="text">
        <span v-if="!text">--</span>
        <span v-else>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="linxType" slot-scope="text, record" placement="topLeft">
        <a-tooltip v-if="record.snType ==='time'||record.snType ==='mac'">
          <template slot="title">
            <span v-if="record.snType ==='time'">
              有效期:
            </span>
            <span v-else-if="record.snType ==='mac'">
              网卡MAC:
            </span>
            <span>
              {{ record.snText }}
            </span>
          </template>

          <a-tag v-if="record.snType ==='time'" color="blue">
            时间序列号
          </a-tag>
          <a-tag v-else-if="record.snType ==='mac'" color="cyan">
            永久序列号
          </a-tag>
          <span v-else>
            --
          </span>
        </a-tooltip>
        <span v-else>
          --
        </span>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="节点管理">
          <a-button :disabled="record.status === 0||record.checkStatus === false" type="link" @click="handleNode(record)"><a-icon type="desktop" /></a-button>
        </a-tooltip>
        <a-tooltip title="编辑">
          <a-button type="link" @click="handleEdit(record)"><a-icon type="edit" /></a-button>
        </a-tooltip>
        <a-tooltip title="删除">
          <a-button type="link" @click="handleDelete(record)"><a-icon type="delete" class="danger" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
    <!-- 编辑区 -->
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
    <!-- 管理节点 -->
    <a-drawer
      class="nodeManager"
      :title="drawerTitle"
      placement="right"
      width="100%"
      :visible="drawerVisible"
      :mask-closable="false"
      @close="onClose"
    >
      <!-- 节点管理组件 -->
      <node-layout v-if="drawerVisible" :node="temp" />
    </a-drawer>
    <a-drawer
      title="条件搜索"
      placement="right"
      :mask-closable="false"
      :width="500"
      height="100%"
      :visible="searchVisible"
      @close="searchVisible = false"
      @keyup.native.enter="sumbitSearch"
    >
      <a-form-model
        ref="searchForm"
        :model="listQuery"
        :wrapper-col="{ span: 20 }"
        :label-col="{ span: 4 }"
      >
        <a-form-model-item label="节点名称" prop="id">
          <a-input v-model="listQuery.name" allow-clear placeholder="请输入节点名称,按回车(Enter)查找" />
        </a-form-model-item>
        <a-form-model-item label="节点IP" prop="id">
          <a-input v-model="listQuery.url" allow-clear placeholder="请输入节点IP,按回车(Enter)查找" />
        </a-form-model-item>
        <a-form-model-item label="节点分组" prop="id">
          <a-select
            :value="listQuery.groupId"
            placeholder="请输入分组名,按回车(Enter)查找"
            :default-active-first-option="false"
            :show-arrow="false"
            :filter-option="false"
            :not-found-content="null"
            show-search
            allow-clear
            @search="groupSearch"
            @change="groupChange"
          >
            <a-select-option v-for="item in groupList" :key="item.value" :value="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>

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
        <a-button :style="{ marginRight: '8px' }" @click="searchVisible = false">
          取消
        </a-button>
        <a-button type="primary" @click="sumbitSearch">
          确定
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { getNodeListSearch, deleteNode, setNodeLocalIp, getNodeStatus, editNode } from '@/api/node'
import { getAllPkgCount } from '@/api/node_package'
import { listGroup } from '@/api/node_group'
import NodeLayout from './node-layout'
import NodeOperation from './components/node_operation.vue'
import { isIpAndPort } from '@/utils/validate'
import { mapState } from 'vuex'
import { deepClone } from '@/utils/obj'
export default {
  components: {
    NodeLayout,
    NodeOperation
  },
  data() {
    return {
      loading: false,
      total: 0,
      listQuery: {
        url: '',
        name: '',
        groupId: undefined,
        pageNum: 1,
        pageSize: 10
      },
      groupList: [],
      tableHeight: '70vh',
      list: [],
      temp: {
        formData: {}
      },
      editNodeVisible: false,
      drawerVisible: false,
      drawerTitle: '',
      columns: [
        { title: '节点 ID', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
        { title: '节点名称', dataIndex: 'name', key: 'name', ellipsis: true, scopedSlots: { customRender: 'name' }},
        { title: '节点地址', dataIndex: 'url', key: 'url', width: 150, ellipsis: true },
        { title: '状态', dataIndex: 'status', key: 'status', width: 100, ellipsis: true, scopedSlots: { customRender: 'status' }},
        { title: '系统版本', dataIndex: 'system', key: 'system', ellipsis: true, scopedSlots: { customRender: 'system' }},
        { title: '内核版本', dataIndex: 'kernel', key: 'kernel', ellipsis: true, scopedSlots: { customRender: 'kernel' }},
        { title: '超时时间', dataIndex: 'timeout', key: 'timeout', width: 100, ellipsis: true },
        { title: '当前序列号', dataIndex: 'linxSerial', key: 'linxSerial', ellipsis: true, scopedSlots: { customRender: 'linxSerial' }},
        { title: '序列号类型', dataIndex: 'linxType', key: 'linxType', width: 120, ellipsis: true, align: 'center', scopedSlots: { customRender: 'linxType' }},
        { title: '操作', dataIndex: 'operation', key: 'operation', scopedSlots: { customRender: 'operation' }, width: 200, align: 'center' }
      ],
      timer: null,
      allPkgCount: 0,
      searchVisible: false
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
    },
    ...mapState({
      openNode: state => state.node.openNode,
      openNodeFlag: state => state.node.openNodeFlag
    })
  },
  watch: {
    list: {
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
  created() {
    // 计算表格高度
    this.$nextTick(() => {
      // this.tableHeight = window.innerHeight - this.$refs['filter'].clientHeight - 135
      this.tableHeight = window.innerHeight - 135
    })
    this.loadData()

    // 系统软件包总数
    getAllPkgCount()
      .then(res => {
        this.allPkgCount = res?.data || 0
      })
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    // 加载数据
    loadData() {
      // 刷新节点列表节点状态清除定时器
      if (this.timer != null) clearInterval(this.timer)
      this.list = []
      this.loading = true
      getNodeListSearch(this.listQuery).then((res) => {
        if (res.code === 200) {
          this.list = res.data.list || []
          this.getAllNodeStatus()
          // 初次加载或刷新节点列表开启节点状态定时器
          this.timer = setInterval(this.getAllNodeStatus, 60 * 1000)
          let nodeId = this.$route.query.nodeId
          // 展示节点抽屉
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
    search() {
      this.listQuery.pageNum = 1
      this.listQuery.pageSize = 10
      this.loadData()
    },
    // 分页
    change(pagination) {
      this.listQuery.pageNum = pagination.current
      this.listQuery.pageSize = pagination.pageSize
      this.loadData()
    },
    // 获取取节点分组
    getNodeGroup(searchName) {
      listGroup({
        name: searchName,
        pageNum: 1,
        pageSize: 999
      })
        .then(res => {
          this.groupList = res?.data?.list || []
        })
        .catch(() => {})
    },
    // 分组搜索
    groupSearch(val) {
      this.getNodeGroup(val)
    },
    groupChange(val) {
      this.listQuery.groupId = val
      this.getNodeGroup(val)
      // this.search()
    },
    // 判断当前主机列表中所有主机状态
    getAllNodeStatus() {
      let promiseList = []
      this.list.forEach(item => {
        const p = getNodeStatus(item.id).then(res => {
          if (res.code === 200) {
            // 主机在线
            item['status'] = 1
            this.list = [...this.list]
            // 获取到节点调用一次编辑接口
            const query = deepClone(item)
            query.type = ''
            editNode(query)
          } else {
            item['status'] = 0
          }
        }).catch(() => {
          item['status'] = 0
        })
        promiseList.push(p)
      })
      Promise.all(promiseList).then(() => {
        this.list = [...this.list]
        // 查询标志 是否要打开对应的节点管理页面
        this.openNodeMange()
      })
    },
    // 添加
    handleAdd() {
      // 清空用户上次填写记录
      this.temp.formData = {}
      this.temp = {
        type: 'add',
        title: '注册节点',
        formData: {
          cycle: 0,
          protocol: 'http',
          openStatus: true,
          timeout: 0,
          loginName: 'mpmsProxy'
        }
      }
      this.editNodeVisible = true
    },
    // 修改
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
    // 提交节点数据
    handleEditNodeOk() {
      this.$refs['operationForm'].handleSubmit().then(() => {
        // 节点信息处理
        this.editNodeVisible = false
        this.loadData()
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
    // 管理节点
    handleNode(record) {
      if (!record.status) {
        this.$notification.warning({ message: `节点${record.name}(${record.url})已离线` })
        return
      }
      setNodeLocalIp({ nodeId: record.id, nodeIp: record.url.split(':')[0] }).then(() => {
        this.temp = Object.assign(record)
        this.drawerTitle = record.flag ? `${this.temp.url} (${this.temp.url})` : `${this.temp.name} (${this.temp.url})`
        this.drawerVisible = true
        let nodeId = this.$route.query.nodeId
        if (nodeId !== record.id) {
          this.$router.push({
            query: { nodeId: record.id }
          })
        }
      })
    },
    // 注册节点
    registerNode(record) {
      this.$confirm({
        title: '系统提示',
        content: '确定要注册 ' + record.name + ' 节点么？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          // 注册
          let query = deepClone(record)
          query.checkStatus = true
          query.type = 'edit'
          editNode(query).then((res) => {
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
    // 关闭抽屉层
    onClose() {
      this.drawerVisible = false
      this.$router.push({
        query: { nodeId: null }
      })
    },
    // 自定义检验url
    checkUrl(rule, value, callback) {
      if (!isIpAndPort(value)) {
        return callback(new Error('请填写正确的ip地址+端口号'))
      }
      callback()
    },
    openNodeMange() {
      if (this.openNodeFlag) {
        let openNodeInfo = {}
        this.list.forEach(item => {
          // eslint-disable-next-line eqeqeq
          if (item.id == this.openNode.id) { openNodeInfo = item }
        })
        openNodeInfo && this.handleNode(openNodeInfo)
        this.$store.commit('CLEAR_OPEN_NODE')
      }
    },
    openSearch() {
      this.searchVisible = true
      this.getNodeGroup('')
    },
    sumbitSearch() {
      this.search()
      this.searchVisible = false
    },
    resetSearch() {
      this.listQuery.name = ''
      this.listQuery.url = ''
      this.listQuery.groupId = ''
      this.search()
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
