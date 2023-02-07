<template>
  <a-form-model ref="editNodeForm" :rules="rules" :model="formData" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
    <a-form-model-item label="节点 ID" prop="id">
      <a-input v-model="formData.id" placeholder="创建之后不能修改" :disabled="temp.type!=='add'" />
    </a-form-model-item>
    <a-form-model-item label="节点名称" prop="name">
      <a-input v-model="formData.name" placeholder="节点名称" />
    </a-form-model-item>
    <a-form-model-item label="节点地址" prop="url">
      <a-input v-model="formData.url" placeholder="节点地址 (127.0.0.1:2123)">
        <a-select v-if="false" slot="addonBefore" v-model="formData.protocol" default-value="Http://" style="width: 80px">
          <a-select-option value="Http"> Http:// </a-select-option>
          <a-select-option value="Https"> Https:// </a-select-option>
        </a-select>
      </a-input>
    </a-form-model-item>
    <div class="node-config">
      <a-form-model-item label="节点账号" prop="loginName">
        <a-input v-model="formData.loginName" placeholder="节点账号,请查看节点启动输出的信息" />
      </a-form-model-item>
      <a-form-model-item label="节点密码" prop="loginPwd">
        <a-input-password v-model="formData.loginPwd" placeholder="节点密码,请查看节点启动输出的信息" />
      </a-form-model-item>
    </div>
    <a-form-model-item label="超时时间(s)" prop="timeOut">
      <a-input-number v-model="formData.timeOut" placeholder="秒 (值太小可能会取不到节点状态)" style="width: 100%" />
    </a-form-model-item>
    <a-form-model-item label="监控周期" prop="cycle">
      <a-select v-model="formData.cycle" :disabled="isDisableInput" default-value="0" placeholder="监控周期">
        <a-select-option :key="0">不开启</a-select-option>
        <a-select-option :key="-5">5 秒</a-select-option>
        <a-select-option :key="-30">30 秒</a-select-option>
        <a-select-option :key="1">1 分钟</a-select-option>
        <a-select-option :key="5">5 分钟</a-select-option>
        <a-select-option :key="10">10 分钟</a-select-option>
        <a-select-option :key="30">30 分钟</a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item label="启用节点" prop="openStatus" class="mb0">
      <a-switch v-model="formData.openStatus" checked-children="是" un-checked-children="否" default-checked />
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import { editNode } from '@/api/node'
import { isIpAndPort } from '@/utils/validate'
export default {
  props: {
    temp: {
      type: Object,
      default: () => {
        return {}
      }
    },
    groupList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    const timeoutValidate = (rule, value, callback) => {
      if (value < 10 || value > 180) {
        callback(new Error('请输入10~180之间的数'))
      }
      callback()
    }
    return {
      formData: this.temp.formData,
      rules: {
        id: [{ required: true, message: '请输入节点 ID', trigger: 'blur' }],
        name: [{ required: true, message: '请输入节点名字', trigger: 'blur' }],
        url: [{ required: true, validator: this.checkUrl, trigger: 'blur' }],
        loginName: [{ required: true, message: '请输入登录名字', trigger: 'blur' }],
        loginPwd: [{ required: true, message: '请输入登录密码', trigger: 'blur' }],
        timeOut: [
          { required: true, message: '请输入超时时间', trigger: 'blur' },
          { validator: timeoutValidate, trigger: 'blur' }
        ]
      },
      isDisableInput: false
    }
  },
  watch: {
    'formData.openStatus': {
      immediate: true,
      handler: function(val) {
        if (!val) {
          this.isDisableInput = true
        } else {
          this.isDisableInput = false
        }
      }
    }
  },
  methods: {
    handleSubmit() {
      return new Promise((resolve, reject) => {
        this.$refs['editNodeForm'].validate(valid => {
          if (!valid) {
            return false
          }
          let query = { ...this.formData }
          this.temp.type === 'add' ? query.type = 'add' : query.type = 'edit'
          editNode(query).then(res => {
            if (res.code === 200) {
              this.$notification.success({
                message: res.msg
              })
              this.$refs['editNodeForm'].resetFields()
              resolve()
            }
          }).catch(() => {
            reject()
          })
        })
      })
    },
    checkUrl(rule, value, callback) {
      if (!isIpAndPort(value)) {
        return callback(new Error('请填写正确的节点IP+端口'))
      }
      callback()
    }
  }

}
</script>
