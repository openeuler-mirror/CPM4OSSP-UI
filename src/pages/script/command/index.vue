<template>
  <div ref="tableBox" style="height: 100%;">
    <div ref="filter" class="filter">
      <a-button type="primary" icon="plus" @click="handleAddCommand">添加命令</a-button>
      <a-button type="primary" @click="handleExecRes">下发结果</a-button>
    </div>

    <a-table
      ref="table"
      :loading="loading"
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      :scroll="{x: 900, y: tableHeight - 50}"
      @change="change"
    >
      <a slot="param" slot-scope="text">{{ text }}</a>
      <a slot="path" slot-scope="text">{{ text }}</a>
      <a slot="createTime" slot-scope="text">{{ text }}</a>
      <template slot="operation" slot-scope="text, record">
        <a-tooltip title="下发">
          <a-button type="link" @click="handleExecCommand(record)"><a-icon type="export" /></a-button>
        </a-tooltip>
      </template>
    </a-table>

    <!-- 添加命令 -->
    <a-modal
      v-model="addCommandVisible"
      title="添加命令"
      width="700px"
      :mask-closable="false"
      :destroy-on-close="true"
      @ok="addCommand"
    >
      <Commandform ref="commandform" />
    </a-modal>

    <!-- 下发命令 -->
    <a-modal
      v-model="execCommandVisible"
      title="下发命令"
      width="700px"
      :footer="execScriptFooter ? null : undefined"
      :mask-closable="false"
      :destroy-on-close="true"
      @ok="execCommand"
      @cancel="cancelExecCommand"
    >
      <ExecScriptRes v-if="isShowExecRes" :result-data="execRes" />
      <ExecScript v-else ref="execScriptForm" :script-item="selectedRow" type="command" />

      <template slot="footer">
        <div>
          <a-button type="white" @click="cancelExecCommand">取消</a-button>
          <a-button type="primary" :loading="buttonLoading" @click="execCommand">确定</a-button>
        </div>
      </template>

    </a-modal>

    <!-- 下发结果 -->
    <a-drawer
      title="执行结果"
      width="700"
      :visible="execResVisible"
      :destroy-on-close="true"
      :mask-closable="false"
      @close="onCloseEexecRes"
    >
      <ExecResult :type="1" />
    </a-drawer>

  </div>
</template>

<script>
import { getCmommandListApi } from '@/api/script'
import Commandform from './components/commandform.vue'
import ExecScript from '@/pages/script/script/components/execScript.vue'
import ExecScriptRes from '@/pages/script/script/components/execScriptRes.vue'
import ExecResult from '../components/execResult.vue'

export default {
  components: {
    Commandform,
    ExecScript,
    ExecScriptRes,
    ExecResult
  },
  data() {
    return {
      loading: false,
      addCommandVisible: false,
      execCommandVisible: false,
      isShowExecRes: false,
      execResVisible: false,
      execScriptFooter: false,
      tableHeight: 0,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      selectedRow: null,
      columns: [
        { title: '命令名称', dataIndex: 'param', key: 'param', width: 100, ellipsis: true },
        { title: '执行路径', dataIndex: 'path', key: 'path', width: 100, ellipsis: true },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 100, ellipsis: true },
        { title: '操作', dataIndex: 'operation', key: 'operation', width: 60, ellipsis: true, scopedSlots: { customRender: 'operation' }, align: 'center' }
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
  watch: {
    isShowExecRes: {
      handler(val) {
        if (val) {
          this.execScriptFooter = true
        } else {
          this.execScriptFooter = false
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
      getCmommandListApi({
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize
      })
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data?.list
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

    // 添加命令
    handleAddCommand() {
      this.addCommandVisible = true
    },
    // 添加命令-确认
    addCommand() {
      this.$refs['commandform'].addCommand().then(() => {
        this.addCommandVisible = false
        this.loadData()
      })
    },

    // 下发命令-按钮
    handleExecCommand(record) {
      this.selectedRow = record
      this.execCommandVisible = true
    },

    // 下发命令-确认
    execCommand() {
      this.buttonLoading = true
      this.$refs['execScriptForm'].execCommand().then((res) => {
        this.isShowExecRes = true
        this.execRes = res.data
      }).finally(() => {
        this.buttonLoading = false
      })
    },

    // 关闭下发弹窗
    cancelExecCommand() {
      this.isShowExecRes = false
      this.execCommandVisible = false
    },

    // 下发结果-按钮
    handleExecRes() {
      this.execResVisible = true
    },

    onCloseEexecRes() {
      this.execResVisible = false
    }

  }
}

</script>

<style scoped>
.ant-btn{
  margin-right: 10px;
}
</style>
