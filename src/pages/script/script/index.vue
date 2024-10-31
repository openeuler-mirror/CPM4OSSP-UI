<template>
  <div ref="tableBox" style="height: 100%;">
    <div ref="filter" class="filter">
      <a-button type="primary" icon="plus" @click="handleUploadScript">上传脚本</a-button>
    </div>

    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="scriptTable"
      :pagination="pagination"
      :scroll="{x: 900, y: tableHeight - 50}"
      @change="change"
    >
      <a slot="name" slot-scope="text">{{ text }}</a>
      <a slot="path" slot-scope="text">{{ text }}</a>
      <a slot="md5" slot-scope="text">{{ text }}</a>
      <a slot="createTime" slot-scope="text">{{ text }}</a>

      <template slot="operation" slot-scope="text, record">
      </template>
    </a-table>

    <!-- 上传脚本弹框 -->
    <a-modal
      v-model="uploadVisible"
      title="上传脚本"
      width="700px"
      :footer="null"
      :mask-closable="false"
      :destroy-on-close="true"
    >
      <FileUpload :url="'/script/upload'" @on-success="uploadSuccess" />
    </a-modal>

  </div>
</template>

<script>
import { getScriptListApi } from '@/api/script'
import FileUpload from '@/components/file-upload'

export default {
  components: {
    FileUpload,
  },
  data() {
    return {
      tableHeight: 0,
      uploadVisible: false,
      loading: false,
      selectedRow: null,
      scriptTable: [],
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      columns: [
        { title: '脚本名称', dataIndex: 'name', key: 'name', width: 100, ellipsis: true },
        { title: '脚本路径', dataIndex: 'path', key: 'path', width: 100, ellipsis: true },
        { title: 'MD5', dataIndex: 'md5', key: 'md5', width: 100, ellipsis: true },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 100, ellipsis: true },
        { title: '操作', dataIndex: 'operation', key: 'operation', scopedSlots: { customRender: 'operation' }, width: 60, ellipsis: true, align: 'center' }
      ],
      buttonLoading: false
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
    }
  },
  created() {
    this.loadData()
  },
  mounted() {
    setTimeout(() => {
      this.tableHeight = this.$refs.tableBox.clientHeight - 140
    })
  },
  methods: {
    loadData() {
      this.loading = true
      getScriptListApi({
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize
      })
        .then((res) => {
          if (res.code === 200) {
            this.scriptTable = res.data?.list
            this.total = Number(res.data?.total || 0)
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },

    // 分页、排序、筛选变化时触发
    change(pagination) {
      this.listQuery.pageNum = pagination.current
      this.listQuery.pageSize = pagination.pageSize
      this.loadData()
    },

    handleUploadScript() {
      this.uploadVisible = true
    },

    uploadSuccess(res) {
      this.$notification.success({
        message: `上传脚本${res.data.name || ''}成功`,
        duration: 2
      })
      this.uploadVisible = false
      this.loadData()
    }
  }
}

</script>

<style scoped>
.ant-btn{
  margin-right: 10px;
}
</style>
