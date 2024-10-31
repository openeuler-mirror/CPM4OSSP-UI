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
    }
  }
}
</script>

<style lang="scss" scoped></style>
