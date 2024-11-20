<template>
    <div ref="tableWrapper" style="height: 100%;">
      <div ref="filter" class="filter">
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
    </div>
  </template>
  
  <script>
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
        upgradeList: []
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
        this.upgradeList = [
            {

            }
        ]
      },
      // 分页
      onShowSizeChange(pagination) {
        this.listQuery.pageNum = pagination.current
        this.listQuery.pageSize = pagination.pageSize
        this.fetchTable()
      }
    }
  }
  </script>
  