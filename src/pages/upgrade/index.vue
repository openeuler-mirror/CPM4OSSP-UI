<template>
    <div ref="tableWrapper" style="height: 100%;">
      <div ref="filter" class="filter">
        <a-button type="primary" icon="search" class="mr10" @click="openSearch">条件搜索</a-button>
        <a-button type="primary" icon="sync" class="mr10" @click="resetSearch">重置</a-button>
      </div>
      <a-table
        :row-key="(record, index) => index"
        :loading="loading"
        :columns="columns"
        :data-source="upgradeList"
        :pagination="pagination"
        :scroll="{x: 900, y: tableHeight }"
        @change="onShowSizeChange"
      >
        <a slot="nodeName" slot-scope="text">{{ text }}</a>
        <a slot="pkgName" slot-scope="text">{{ text }}</a>
        <template slot="oldVersion" slot-scope="text, record">
          <span v-if="record?.opType === 1">
            {{ record?.toVer || '-' }}
          </span>
          <span v-if="record?.opType === 2">
            {{ record?.fromVer }} <a-icon type="swap-right" class="primary" style="font-size: 18px;" /> {{ record?.toVer || '-' }}
          </span>
          <span v-if="record?.opType === 3">
            {{ record?.fromVer || '-' }}
          </span>
        </template>
        <a slot="time" slot-scope="text">{{ text }}</a>
        <template slot="opType" slot-scope="text">
          <span v-if="text===1">安装</span>
          <span v-if="text===2">升级</span>
          <span v-if="text===3">卸载</span>
        </template>
        <template slot="status" slot-scope="text">
          <a-tag v-if="text" class="success">成功</a-tag>
          <a-tag v-else class="danger">失败</a-tag>
        </template>
      </a-table>
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
        :model="tableQuery"
        :wrapper-col="{ span: 20 }"
        :label-col="{ span: 4 }"
      >
        <a-form-model-item label="软件包名" prop="packageName">
          <a-input v-model="tableQuery.packageName" placeholder="请输入软件包名,按回车(Enter)查找" allow-clear />
        </a-form-model-item>
        <a-form-model-item label="节点名" prop="nodeName">
          <a-input v-model="tableQuery.nodeName" placeholder="请输入节点名,按回车(Enter)查找" allow-clear />
        </a-form-model-item>
        <a-form-model-item label="时间" prop="timeRange">
          <a-range-picker
            :disabled-date="disabledDate"
            style="width: 100%;"
            :value="tableQuery.timeRange"
            :show-time="{format: 'HH:mm:ss'}"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="onchangeTime"
          >
            <template slot="renderExtraFooter">
              <a-button size="small" :class="{isActive: isActive === 1}" @click="computedTime(1)">昨天</a-button>
              <a-button size="small" :class="{isActive: isActive === 3}" @click="computedTime(3)">近三天</a-button>
              <a-button size="small" :class="{isActive: isActive === 5}" @click="computedTime(5)">近五天</a-button>
              <a-button size="small" :class="{isActive: isActive === 7}" @click="computedTime(7)">近一周</a-button>
            </template>
          </a-range-picker>
        </a-form-model-item>
        <a-form-model-item label="状态" prop="upgradeRes">
          <a-select
            v-model="tableQuery.upgradeRes"
            placeholder="请选择操作结果"
            class="filter-item"
          >
            <a-select-option v-for="item in resOption" :key="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="类型" prop="opType">
          <a-select
            v-model="tableQuery.opType"
            placeholder="请选择操作类型"
            class="filter-item"
          >
            <a-select-option v-for="item in typeOption" :key="item.value">
              {{ item.label }}
            </a-select-option>
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
import { nodePkgOp } from '@/api/upgrade'

  export default {
    data() {
      return {
        loading: false,
        tableHeight: 0,
        total: 0,
        listQuery: {
          pageNum: 1,
          pageSize: 10
        },
        columns: [
          { title: '节点名称', dataIndex: 'nodeName', key: 'nodeName', ellipsis: true },
          { title: '升级软件包名', dataIndex: 'pkgName', key: 'pkgName', ellipsis: true },
          { title: '版本变化', dataIndex: 'oldVersion', key: 'oldVersion', ellipsis: true, scopedSlots: { customRender: 'oldVersion' }},
          { title: '时间', dataIndex: 'opTime', key: 'opTime' },
          { title: '类型', dataIndex: 'opType', key: 'opType', width: 100, scopedSlots: { customRender: 'opType' }},
          { title: '状态', dataIndex: 'success', key: 'success', width: 100, ellipsis: true, scopedSlots: { customRender: 'status' }},
          { title: '操作', dataIndex: 'operation', key: 'operation', align: 'center', width: 100, scopedSlots: { customRender: 'operation' }}
        ],
        upgradeList: [],
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
      }
    },
    mounted() {
      this.fetchTable()
      setTimeout(() => {
        this.tableHeight = this.$refs.tableWrapper.clientHeight - 140 - 50
      })
    },
    methods: {
      // 刷新表格
      fetchTable() {
      this.loading = true
      return new Promise((resolve, reject) => {
        nodePkgOp({
          pkgName: this.tableQuery.packageName,
          nodeName: this.tableQuery.nodeName,
          startTime: this.tableQuery.timeRange?.[0],
          endTime: this.tableQuery.timeRange?.[1],
          success: this.tableQuery.upgradeRes === '' ? '' : Boolean(this.tableQuery.upgradeRes),
          opType: this.tableQuery.opType,
          ...this.listQuery
        })
          .then(res => {
            this.upgradeList = res?.data?.list || []
            this.total = +res?.data?.total || 0
            resolve(res)
          })
          .catch(err => reject(err))
          .finally(() => {
            this.loading = false
          })
      })
    },
      // 分页
      onShowSizeChange(pagination) {
        this.listQuery.pageNum = pagination.current
        this.listQuery.pageSize = pagination.pageSize
        this.fetchTable()
      },
      openSearch() {
        this.searchVisible = true
      },
      resetSearch() {
        this.tableQuery.packageName = ''
        this.tableQuery.nodeName = ''
        this.tableQuery.timeRange = null
        this.tableQuery.upgradeRes = ''
        this.tableQuery.opType = ''
        this.sumbitSearch()
      },
      sumbitSearch() {
        this.listQuery.pageNum = 1
        this.listQuery.pageSize = 10
        this.searchVisible = false
        this.fetchTable()
      }
    }
  }
  </script>
  