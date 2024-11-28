<template>
  <div ref="treeManage" class="treeManage">
    <!-- 头部 -->
    <div class="btn-box">
      <span>
        文件路径：
      </span>
      <a-input-search
        v-model="path"
        class="width-300 mr-10"
        placeholder="请输入软件包名"
        @search="searchFile"
        @pressEnter="searchFile"
      />
      <a-button type="primary searchSetting" icon="rollback" :disabled="currentPath==='/'" @click="backPrevious">
        返回上级
      </a-button>
      <a-button type="primary searchSetting" icon="home" :disabled="currentPath==='/'" @click="backHome">根目录</a-button>
    </div>
    <a-table
      :data-source="fileData"
      bordered
      :columns="columns"
      :pagination="pagination"
      :row-key="(record, index) => index "
      :scroll="{x: 900, y: tableHeight - 50}"
      :loading="loading"
      @change="change"
    >
      <a-tooltip slot="name" slot-scope="text,record" :title="text" placement="topLeft">
        <span v-if="record?.type?.indexOf('text')!==-1"><a-icon type="file-text" /> {{ text }}</span>
        <a v-else-if="record.type ==='directory'" @click="enterNext(record)"><a-icon type="folder" /> {{ text }}</a>
        <span v-else><a-icon type="container" /> {{ text }}</span>

      </a-tooltip>
      <a-tooltip slot="type" slot-scope="text" :title="text" placement="topLeft">
        <a-tag v-if="text?.indexOf('text')!==-1"><a-icon type="file-text" /> {{ text }}</a-tag>
        <a-tag v-else-if="text ==='directory'"><a-icon type="folder" /> 目录</a-tag>
        <a-tag v-else><a-icon type="container" /> {{ text }}</a-tag>
      </a-tooltip>
      <template slot="operation" slot-scope="text, record">
        <a-button :disabled="!record.isRead" type="primary" @click="selectedFile = record;fileQuery.pageNum = 1;showFile(record)">查看</a-button>
        <a-button type="primary" class="ml10" @click="handllPkgModel(record)">所属软件包</a-button>
      </template>
    </a-table>
    <a-drawer
      v-if="isShowDetail"
      title="配置文件详情"
      placement="right"
      :visible="isShowDetail"
      :width="650"
      @close="isShowDetail = false"
    >
      <div class="showFileDetail" :style="{height:tableHeight + 100 + 'px',overflow:'auto'}">
        <div v-for="(item,index) in fileDetail" :key="index">
          {{ item }}
        </div>
      </div>
    </a-drawer>
    <!-- 所属软件包弹窗 -->
    <a-modal v-model="pkgVisible" title="详情信息" :footer="null" :destroy-on-close="true" :width="750">
      <FilePackage :file-name="fileName" />
    </a-modal>
  </div>
</template>

<script>
import { lsFile, catFile } from '@/api/fs'
import FilePackage from '../components/file-package.vue'
export default {
  components: {
    FilePackage
  },
  props: {
    node: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      // 目录树分页
      listQuery: {
        total: 0,
        pageNum: 1,
        pageSize: 10
      },
      // 文件详情分页
      fileQuery: {
        total: 0,
        pageNum: 1,
        pageSize: 10000
      },
      tableHeight: 0,
      fileData: [],
      path: '/',
      // 确定搜索路径
      currentPath: '/',
      columns: [
        { title: '文件名称', dataIndex: 'name', ellipsis: true, scopedSlots: { customRender: 'name' }},
        { title: '文件类型', dataIndex: 'type', ellipsis: true, scopedSlots: { customRender: 'type' }},
        { title: '操作', dataIndex: 'operation', ellipsis: true, width: 200, scopedSlots: { customRender: 'operation' }}
      ],
      loading: true,
      isShowDetail: false,
      // 文件详情
      fileDetail: [],
      // 选中文件
      selectedFile: {},
      pkgVisible: false,
      fileName: ''
    }
  },
  computed: {
    pagination() {
      return {
        total: this.listQuery.total || 0,
        current: this.listQuery.pageNum || 1,
        pageSize: this.listQuery.pageSize || 10,
        pageSizeOptions: ['10', '20', '50'],
        showSizeChanger: true,
        showTotal: (total) => {
          return `共 ${total} 条`
        }
      }
    },
    filePagination() {
      return {
        total: this.fileQuery.total || 0,
        current: this.fileQuery.pageNum || 1,
        pageSize: this.fileQuery.pageSize || 100000
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.tableHeight = this.$refs?.treeManage.clientHeight - 140
    })
    this.lsFile()
  },
  methods: {
    searchFile() {
      this.lsFile()
    },
    lsFile() {
      this.loading = true
      if (this.path[0] !== '/') {
        this.path = '/' + this.path
      }
      if (!this.node || !this.node.id || !this.path) {
        console.error('Invalid input parameters')
        this.loading = false
        return
      }
      lsFile({ nodeId: this.node.id,
        path: this.path,
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize })
        .then((res) => {
          this.currentPath = this.path
          if (res.code === 200) {
            this.fileData = res.data.list
            this.listQuery.total = Number(res.data.total)
          } else {
            this.backPrevious()
          }
        }).catch((error) => {
          this.$notification.error({
            message: error || '文件列表加载失败'
          })
        }).finally(() => {
          this.loading = false
        })
    },
    // 分页、排序、筛选变化时触发
    change(pagination) {
      this.listQuery.pageNum = pagination.current
      this.listQuery.pageSize = pagination.pageSize
      this.lsFile()
    },
    // 进入下一级
    enterNext(record) {
      this.path = record.name
      this.listQuery.pageNum = 1
      this.lsFile()
    },
    // 返回根目录
    backHome() {
      this.path = '/'
      this.listQuery.pageNum = 1
      this.lsFile()
    },
    // 返回上一级
    backPrevious() {
      let tempDir = this.currentPath.split('/')
      this.listQuery.pageNum = 1
      tempDir.pop()
      this.path = tempDir.join('/')
      this.lsFile()
    },
    // 查看文件
    showFile() {
      this.isShowDetail = true
      catFile({
        nodeId: this.node.id,
        path: this.selectedFile.name,
        pageNum: this.fileQuery.pageNum,
        pageSize: this.fileQuery.pageSize }).then(res => {
        if (res.code === 200) {
          this.fileDetail = res.data.list[0]?.split('\n')
          this.fileQuery.total = Math.ceil(res.data.total / res.data.pageSize) || 0
          const tbody = document.querySelector('.showFileDetail')
          tbody.scrollTo(0, 0)
        }
      })
    },
    // 文件详情翻页
    filePaginationChange(current, size) {
      this.fileQuery.pageNum = current
      this.showFile()
    },
    handllPkgModel(row) {
      this.pkgVisible = true
      this.fileName = row.name
    }
  }
}
</script>

<style scoped>
.treeManage{
  height:100%
}
.btn-box{
  padding-bottom:10px;
  border-bottom: 1px solid #377bc9;
}
.searchSetting{
  margin-right: 10px;
}
</style>
