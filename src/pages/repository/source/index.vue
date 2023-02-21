<template>
  <div>
    <div ref="filter" class="filter">
      <a-button :disabled="planList.length>100" type="primary" icon="plus" @click="addSource">新增</a-button>
    </div>
    <a-table
      :loading="loading"
      :data-source="planList"
      :columns="columns"
      bordered
      :row-key="(record, index) => index"
      :pagination="false"
      :scroll="{x:600}"
    >
      <a-tooltip slot="planName" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <a-tooltip slot="annotation" slot-scope="text" :title="text" placement="topLeft">
        <span>{{ text }}</span>
      </a-tooltip>
      <template slot="option" slot-scope="record">
        <a-tooltip title="详情">
          <a-button type="link" @click="SourceDetail(record)"><a-icon type="file" /></a-button>
        </a-tooltip>
        <a-tooltip title="配置">
          <a-button type="link" @click="batchSet(record)"><a-icon type="setting" /></a-button>
        </a-tooltip>
        <a-tooltip title="编辑">
          <a-button type="link" @click="editSource(record)"><a-icon type="edit" /></a-button>
        </a-tooltip>
        <a-tooltip title="删除">
          <a-button type="link" @click="deleteSource(record.id)"><a-icon type="delete" class="danger" /></a-button>
        </a-tooltip>
      </template>
    </a-table>
    <a-modal v-model="detailVisible" title="软件源模板详情" width="850px" :footer="null">
      <a-form-model
        v-model="selectPlan"
        :label-col="{span: 4}"
        :wrapper-col="{ span: 20 }"
      >
        <a-form-model-item label="模板名">
          <a-input v-model="selectPlan.planName" width="150px" disabled />
        </a-form-model-item>
        <a-form-model-item label="注释">
          <a-input v-model="selectPlan.annotation" width="150px" disabled />
        </a-form-model-item>
        <a-form-model-item label="软件源列表详情">
          <a-table
            :columns="Sourcecolumns"
            :data-source="selectPlan.sourceList"
            bordered
            :row-key="(record, index) => index"
            :pagination="false"
            min-height="400px"
            max-height="400px"
            :scroll="{ y: 480 }"
          >
            <a-tooltip slot="type" slot-scope="text" :title="text" placement="topLeft">
              <span>{{ text }}</span>
            </a-tooltip>
            <a-tooltip slot="url" slot-scope="text" :title="text" placement="topLeft">
              <span>{{ text }}</span>
            </a-tooltip>
            <a-tooltip slot="codename" slot-scope="text" :title="text" placement="topLeft">
              <span>{{ text }}</span>
            </a-tooltip>
            <a-tooltip slot="remarks" slot-scope="text" placement="topLeft" :overlay-style="{'max-width':'200px'}">
              <template slot="title"><span v-html="text.replaceAll(' ','<br/>')" /></template>
              <span>{{ text }}</span>
            </a-tooltip>
          </a-table>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal
      v-model="editVisible"
      v-waiting="{ value: confirmLoading, text: addTitle }"
      :title="title"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      :destroy-on-close="true"
      width="850px"
      @ok="handleSubmit"
    >
      <a-form-model
        ref="planForm"
        :model="formData"
        :wrapper-col="{ span: 22 }"
        :label-col="{ span: 2 }"
        :rules="rules"
      >
        <a-form-model-item label="模板名" prop="planName">
          <a-input v-model="formData.planName" placeholder="请填写软件源模板名称" />
        </a-form-model-item>
        <a-form-model-item label="注释" prop="annotation">
          <a-input v-model="formData.annotation" placeholder="请填写注释信息" />
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{span: 22,offset: 2}">
          <source-setting
            ref="sourceSetting"
            :is-show-mode="false"
            :edit-source-list="selectPlan.sourceList"
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-modal
      v-model="nodeSelectVisible"
      v-waiting="{ value: confirmLoading, text: '软件源配置下发中...' }"
      width="650px"
      title="节点选择"
      :destroy-on-close="true"
      :mask-closable="false"
      :confirm-loading="confirmLoading"
      @ok="handleSetPlan"
    >
      <a-spin :spinning="loading" tip="配置中...">
        <node-select ref="nodeSelect" :plan-info="selectPlan" />
      </a-spin>
      <template slot="" />
    </a-modal>
    <a-modal
      v-model="resultListVisible"
      width="800px"
      :title="resultTitle"
      :destroy-on-close="true"
      :mask-closable="false"
      cancel-text="关闭"
      :ok-text="okText"
      @ok="handleResultOk"
    >
      <result-list ref="resultList" :data-list="resultList" />
    </a-modal>
  </div>
</template>

<script>
import { getPlanSourceList, deleteSource, insertSource, updateSourcePlan, batchProcessing, getSourcePackageByPlan } from '@/api/repository'
import NodeSelect from './node-select.vue'
import SourceSetting from '@/pages/node/node-layout/source/source_setting.vue'
import ResultList from './result-list.vue'
export default {
  components: {
    NodeSelect,
    SourceSetting,
    ResultList
  },
  data() {
    const validator = (rule, value, callback) => {
      const val = value.trim()
      switch (rule.field) {
        case 'planName':
          if (val.length === 0) {
            new Error(callback('请输入模板名称'))
          } else if (val.length > 10) {
            new Error(callback('模板名称长度不能超过10位'))
          } else {
            callback()
          }
          break
        case 'annotation':
          if (val.length > 50) {
            new Error(callback('注释长度不能超过50位'))
          } else {
            callback()
          }
          break
        default:callback()
      }
    }
    return{
      addTitle: '',
      loading: false,
      confirmLoading: false,
      keyValueMap: {
        '0': 'type',
        '1': 'url',
        '2': 'codename',
        '3': 'remarks'
      },
      planList: [],
      sourceList: [],
      columns: [
        { title: '软件源模板名称', dataIndex: 'planName', ellipsis: true, scopedSlots: { customRender: 'planName' }},
        { title: '注释', dataIndex: 'annotation', ellipsis: true, scopedSlots: { customRender: 'annotation' }},
        { title: '操作', width: '250px', scopedSlots: { customRender: 'option' }, align: 'center' }
      ],
      Sourcecolumns: [
        { title: '软件源类型', dataIndex: 'type', ellipsis: true, scopedSlots: { customRender: 'type' }},
        { title: '软件源地址', dataIndex: 'url', ellipsis: true, scopedSlots: { customRender: 'url' }},
        { title: '版本代码', dataIndex: 'codename', ellipsis: true, scopedSlots: { customRender: 'codename' }},
        { title: '其它信息', dataIndex: 'remarks', ellipsis: true, scopedSlots: { customRender: 'remarks' }}
      ],
      detailVisible: false,
      editVisible: false,
      formData: {
        planName: '',
        annotation: ''
      },
      rules: {
        planName: [
          { required: true, message: '请输入模板名称', trigger: 'blur' },
          { validator, trigger: ['blur', 'change'] }
        ],
        annotation: [{ validator, trigger: ['blur', 'change'] }]
      },
      title: '新增软件源模板',
      selectPlan: {
        planName: '',
        sourceList: []
      },
      operateType: 'add',
      planId: null,
      nodeSelectVisible: false,
      resultList: [],
      resultListVisible: false,
      resultTitle: '',
      // 当前操作标识符(配置、回滚)
      step: '',
      rollbackList: [],
      okText: '确定'   
    }
  },
  created() {
    this.getPlanList()
  },
  methods: {
    getPlanList() {
      this.loading = true
      this.planList = []
      getPlanSourceList().then(res => {
        this.planList = res.data
      }).finally(() => {
        this.loading = false
      })
    },
  }
}
</script>