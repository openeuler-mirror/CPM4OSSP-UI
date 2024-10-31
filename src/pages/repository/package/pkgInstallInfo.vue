<template>
  <div>
    <a-table
      bordered
      :loading="loading"
      :data-source="packageList"
      :columns="columns"
      :row-key="(record, index) => record.id"
      :pagination="false"
    >
      <template slot="action" slot-scope="record">
        <a-button type="link" :disabled="record.disabled" @click="handleRedirect(record)">{{ record.disabled ? '节点不在线' : '进入节点' }}</a-button>
      </template>
    </a-table>
  </div>
</template>

<script>
import { getNodeByPkgName } from '@/api/node_package'
import { getNodeStatus } from '@/api/node'
export default {
  props: {
    row: {
      type: Object,
      default() {
        return { }
      }
    }
  },
  data() {
    return {
      loading: false,
      packageList: [],
      columns: [
        { title: '软件包名', dataIndex: 'name', ellipsis: true, width: 150 },
        { title: '节点地址', dataIndex: 'url', ellipsis: true, width: 150, align: 'center' },
        { title: '系统版本', dataIndex: 'system', ellipsis: true },
        { title: '内核版本', dataIndex: 'kernel', ellipsis: true },
        { title: '操作', scopedSlots: { customRender: 'action' }, width: 110, align: 'center' }
      ]
    }
  },
  async mounted() {
    await this.getPkgInstallInfo()
    this.getAllNodeStatus()
  },
  methods: {
    getPkgInstallInfo() {
      this.loading = true
      return new Promise((resolve, reject) => {
        getNodeByPkgName({
          name: this.row?.package,
          version: this.row?.version
        })
          .then(res => {
            this.packageList = res?.data?.nodeInfoList
            resolve()
          })
          .catch((err) => { reject(err) })
          .finally(() => { this.loading = false })
      })
    },
    handleRedirect(row) {
      // 打开对应的节点管理页面，若节点不在线则只跳转到节点列表
      this.$store.commit('SET_OPEN_NODE', row)
      this.$router.push('/node/list')
    },
    // 查询对应节点状态，设置能否跳转
    getAllNodeStatus() {
      let promiseList = []
      this.packageList.forEach(item => {
        const p = getNodeStatus(item.id).then(res => {
          if (res.code === 200) {
            // 主机在线
            item.disabled = false
          } else {
            item.disabled = true
          }
        })
        promiseList.push(p)
      })
      Promise.all(promiseList).then(() => {
        this.packageList = [...this.packageList]
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
