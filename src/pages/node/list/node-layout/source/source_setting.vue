<template>
  <div>
    <a-form-model :model="sourceInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item v-if="isShowMode" ref="filter" label="设置模式">
        <a-select v-model="sourceInfo.mode">
          <a-select-option v-for="item in modeList" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="源文件内容">
        <a-tooltip title="新增一行">
          <a-button type="link" icon="plus" @click="addRow" />
        </a-tooltip>
        <a-tooltip title="示例">
          <a-button type="link" icon="question-circle" @click="exVisibile = true" />
        </a-tooltip>
        <a-tooltip title="预览">
          <a-button type="link" icon="eye" :disabled="!fileText" @click="reVisibile = true" />
        </a-tooltip>
        <a-form-model class="table-form">
          <a-table
            :columns="columns"
            :data-source="fileList"
            bordered
            :pagination="false"
            :row-key="(record, index) => index"
            :style="{'max-height': tableHeight - 250 + 'px', 'min-height': tableHeight - 250 + 'px' }"
            :scroll="{y: tableHeight - 310}"
            :locale="{ emptyText: '点击+号添加源配置' }"
          >
            <template slot="type" slot-scope="text, record">
              <a-form-model-item v-validator="record.type">
                <a-input v-model="record.type" />
              </a-form-model-item>
            </template>
            <template slot="url" slot-scope="text, record">
              <a-form-model-item v-validator="record.url">
                <a-input v-model="record.url" />
              </a-form-model-item>
            </template>
            <template slot="codename" slot-scope="text, record">
              <a-form-model-item v-validator="record.codename">
                <a-input v-model="record.codename" />
              </a-form-model-item>
            </template>
            <template slot="remarks" slot-scope="text, record">
              <a-form-model-item v-validator="record.remarks">
                <a-input v-model="record.remarks" />
              </a-form-model-item>
            </template>
            <template slot="option" slot-scope="text, record, index">
              <a-icon :style="{ fontSize: '20px' }" type="delete" class="danger" @click="deleteRow(index)" />
            </template>
          </a-table>
        </a-form-model>
      </a-form-model-item>
    </a-form-model>
    <a-modal v-model="exVisibile" width="50%" :destroy-on-close="true" :footer="null" title="软件源配置示例" @ok="exVisibile=false">
      <a-table
        :columns="exColumns"
        :data-source="exFileList"
        bordered
        :pagination="false"
      >
        <template slot="type" slot-scope="text, record">
          <a-input v-model="record.type" :disabled="true" />
        </template>
        <template slot="url" slot-scope="text, record">
          <a-input v-model="record.url" :disabled="true" />
        </template>
        <template slot="codename" slot-scope="text, record">
          <a-input v-model="record.codename" :disabled="true" />
        </template>
        <template slot="remarks" slot-scope="text, record">
          <a-input v-model="record.remarks" :disabled="true" />
        </template>
      </a-table>
    </a-modal>
    <a-modal v-model="reVisibile" width="600px" title="预览效果" :destroy-on-close="true" :footer="null" @ok="reVisibile=false">
      <div class="text-wrapper" v-html="fileTextHtml" />
    </a-modal>
  </div>
</template>

<script>
// import { setSource } from '@/api/node_source'
export default {
  props: {
    nodeId: {
      type: String,
      default: ''
    },
    isShowMode: {
      type: Boolean,
      default: true
    },
    editSourceList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      sourceInfo: {
        mode: 'cover'
      },
      modeList: [
        { label: '覆盖', value: 'cover' },
        { label: '追加', value: 'append' }
      ],
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
      columns: [
        { title: '软件源类型', dataIndex: 'type', key: 'type', width: 100, scopedSlots: { customRender: 'type' }},
        { title: '软件源地址', dataIndex: 'url', key: 'url', width: 100, scopedSlots: { customRender: 'url' }},
        { title: '版本代码', dataIndex: 'codename', key: 'codename', width: 100, scopedSlots: { customRender: 'codename' }},
        { title: '其它信息', dataIndex: 'remarks', key: 'remarks', width: 100, scopedSlots: { customRender: 'remarks' }},
        { title: '操作', dataIndex: 'option', width: 50, scopedSlots: { customRender: 'option' }, align: 'center' }
      ],
      exColumns: [
        { title: '软件源类型', dataIndex: 'type', key: 'type', width: 50, scopedSlots: { customRender: 'type' }},
        { title: '软件源地址', dataIndex: 'url', key: 'url', width: 100, scopedSlots: { customRender: 'url' }},
        { title: '版本代码', dataIndex: 'codename', key: 'codename', width: 100, scopedSlots: { customRender: 'codename' }},
        { title: '其它信息', dataIndex: 'remarks', key: 'remarks', width: 100, scopedSlots: { customRender: 'remarks' }}
      ],
      fileList: [],
      exVisibile: false,
      reVisibile: false,
      exFileList: [
        { type: 'deb', url: 'http://mirrors.aliyun.com/ubuntu/', codename: 'bionic', remarks: 'main restricted' }
      ],
      tableHeight: '60vh'
    }
  },
  computed: {
    fileText() {
      let str = ''
      this.fileList.forEach(item => {
        if (!item.type || !item.url || !item.codename || !item.remarks) {
          return
        } else {
          str += item.type + ' ' + item.url + ' ' + item.codename + ' ' + item.remarks + '\n'
        }
      })
      return str
    },
    fileTextHtml() {
      return this.fileText.replaceAll('\n', '<br/>')
    }
  },
  created() {
    this.calcTableHeight()
    this.initData()
  },
  methods: {
    initData() {
      if (this.editSourceList.length === 0) {
        return
      }
      this.fileList = this.editSourceList
    },
    calcTableHeight() {
      this.$nextTick(() => {
        this.tableHeight = window.innerHeight - 300
      })
    },
    handleSet() {
      let valid = false
      if (document.getElementsByClassName('customize').length === 0 && document.getElementsByClassName('table-form')[0].validate()) {
        valid = true
      }
      if (!valid) {
        this.$notification.error({ message: '请正确完成软件源配置文件的书写' })
        return Promise.reject()
      }
      return Promise.resolve()
    },
    addRow() {
      this.fileList.push({})
    },
    deleteRow(index) {
      this.fileList.splice(index, 1)
    },
    showEx() {
      this.exVisibile = true
    }
  }
}
</script>

<style lang="scss" scoped>
.table-form {
  ::v-deep .ant-form-item{
    margin-bottom: 21px;
  }
  ::v-deep .ant-table {
    td{
      padding: 0px 10px;
      padding-top: 5px;
      .ant-col {
        height: 32px;
      }
      .ant-btn{
        margin-top: -10px;
      }
      .ant-input{
        padding: 0 5px!important;
        height: 28px;
      }
    }
  }
}
.text-wrapper {
  overflow: auto;
  white-space: nowrap;
}
</style>
