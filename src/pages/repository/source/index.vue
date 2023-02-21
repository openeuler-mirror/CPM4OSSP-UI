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
    addSource() {
      this.editVisible = true
      this.operateType = 'add'
      this.formData.planName = ''
      this.formData.annotation = ''
      this.selectPlan.sourceList = []
      this.title = '新增软件源模板'
    },
    handleSubmit() {
      this.$refs['planForm'].validate(valid => {
        if (!valid) {
          return
        }
        if (this.$refs.sourceSetting.fileText.length === 0) {
          this.$notification.error({ message: '新增模板的软件源列表为空' })
          return
        }
        this.$refs['sourceSetting'].handleSet().then(() => {
          const params = {
            ...this.formData,
            sourceList: this.$refs.sourceSetting.fileText
          }
          this.confirmLoading = true
          if (this.operateType === 'add') {
            this.addTitle = '新增软件源模板中...'
            insertSource(params).then(res => {
              if (res.code === 200) {
                this.$notification.success({ message: '新增软件源模板成功' })
                // 调用指定软件源获取软件包总数
                this.addTitle = '更新源模板的软件包中...'
                getSourcePackageByPlan({ planName: this.formData.planName }).then((res) => {
                  if (res.code === 200) {
                    this.$notification.success({ message: '更新源模板的软件包成功' })
                  }
                }).finally(() => {
                  this.editVisible = false
                  this.confirmLoading = false
                })
                this.formData.planName = ''
                this.formData.annotation = ''
                this.getPlanList()
              } else {
                this.confirmLoading = false
              }
            }).catch(() => {
              this.confirmLoading = false
            })
            return
          }
          params.id = this.planId
          this.addTitle = '编辑软件源模板中...'
          updateSourcePlan(params).then(res => {
            if (res.code === 200) {
              this.$notification.success({ message: '编辑软件源模板成功' })
              // 调用指定软件源获取软件包总数
              this.addTitle = '更新源模板的软件包中...'
              getSourcePackageByPlan({ planName: this.formData.planName }).then((res) => {
                if (res.code === 200) {
                  this.$notification.success({ message: '更新源模板的软件包成功' })
                }
              }).finally(() => {
                this.editVisible = false
                this.confirmLoading = false
              })
              this.formData.planName = ''
              this.formData.annotation = ''
              this.getPlanList()
            } else {
              this.confirmLoading = false
            }
          }).catch(() => {
            this.confirmLoading = false
          })
        })
      })
    },
    analysisData(data) {
      return data.split('\n').map(item => {
        let obj = {}
        let urlPre = true
        const reg = /^(http|ssh|ftp):\/\//
        item.split(' ').forEach((item, index) => {
          if (item) {
            if (reg.test(item)) {
              obj[this.keyValueMap[1]] = item
              urlPre = false
            } else {
              if (urlPre) {
                obj[this.keyValueMap[0]] = obj[this.keyValueMap[0]] ? obj[this.keyValueMap[0]] + ' ' + item : item
              } else {
                if (!obj[this.keyValueMap[2]]) {
                  obj[this.keyValueMap[2]] = item
                } else {
                  obj[this.keyValueMap[3]] = obj[this.keyValueMap[3]] ? obj[this.keyValueMap[3]] + ' ' + item : item
                }
              }
            }
          }
        })
        return obj
      })
    },
    editSource(row) {
      this.title = '编辑软件源模板'
      this.planId = row.id
      this.operateType = 'edit'
      this.formData.planName = row.planName
      this.formData.annotation = row.annotation
      this.selectPlan.sourceList = this.analysisData(row.sourceList)
      this.editVisible = true
    },
    deleteSource(id) {
      this.$confirm({
        title: '系统提示',
        content: '确定删除该条软件源模板?',
        onOk: () => {
          deleteSource({ id }).then(res => {
            if (res.code === 200) {
              this.$notification.success({ message: '删除成功' })
              this.getPlanList()
            }
          })
        }
      })
    },
    SourceDetail(row) {
      this.detailVisible = true
      this.selectPlan.planName = row.planName
      this.selectPlan.annotation = row.annotation
      this.selectPlan.sourceList = this.analysisData(row.sourceList)
    },
    batchSet(row) {
      this.selectPlan.planName = row.planName
      this.selectPlan.sourceList = this.analysisData(row.sourceList)
      this.nodeSelectVisible = true
    },
    handleSetPlan() {
      this.confirmLoading = true
      this.$refs.nodeSelect.handleSubmit().then(() => {
        this.$notification.success({ message: '配置软件源成功' })
        this.nodeSelectVisible = false
      }).catch((err) => {
        if (err === 'validate') return
        this.resultList = err
        this.resultTitle = '节点软件源配置结果'
        this.step = '配置'
        this.okText = '回滚'
        this.resultListVisible = true
      }).finally(() => {
        this.confirmLoading = false
      })
    },
    handleResultOk() {
      this.rollbackList = this.$refs.resultList.selecList
      if (this.step === '配置' && this.rollbackList.length > 0) {
        let list = []
        this.rollbackList.forEach(item => {
          list.push(item.nodeId)
        })
        this.$confirm({
          title: '系统提示',
          content: '确定回滚所选节点的软件源配置?',
          okText: '确定',
          cancelText: '取消',
          keyboard: false,
          onOk: () => {
            const params = {
              nodeIds: list,
              data: '',
              interface: 'RollbackSourceList'
            }
            batchProcessing(params).then(res => {
              this.resultList = res
              this.resultListVisible = true
              this.nodeSelectVisible = false
              this.okText = '确定'
              this.step = '回滚'
              this.resultTitle = '节点软件源回滚结果'
              for (let item of res) {
                if (item.code === 200) {
                  this.$notification.success({ message: item.msg })
                } else {
                  this.$notification.error({ message: item.msg })
                }
              }
            }).catch((error) => {
              this.$notification.error({ message: error || '软件源回滚失败' })
            })
          },
          onCancel: () => {
            this.nodeSelectVisible = false
          }
        })
      } else if (this.step === '配置' && this.rollbackList.length === 0) {
        this.$notification.error({ message: '请选择需要回滚的节点' })
      } else {
        this.resultListVisible = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ant-btn {
  margin-right: 15px;
}
</style>