<template>
  <div>
    <a-form-model ref="editUserForm" :rules="rules" :model="temp" :label-col="{ span: 4}" :wrapper-col="{ span: 20 }">
      <a-form-model-item label="用户名称" prop="id">
        <a-input v-model="temp.id" placeholder="创建之后不能修改" :disabled="createOption == false" />
      </a-form-model-item>
      <a-form-model-item label="登录密码" prop="password">
        <a-input-password v-model="temp.password" placeholder="请输入登录密码" />
      </a-form-model-item>
      <a-form-model-item label="确认密码" prop="confirmPassword" class="mb0">
        <a-input-password v-model="temp.confirmPassword" placeholder="请输入确认密码" />
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { addUser, updateUser } from '@/api/user'
import sha1 from 'sha1'
export	default	{
  props: {
    rowData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data()	{
    const pwdValidate = (rule, value, callback) => {
      const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*])[\da-zA-Z~!@#$%^&*]{9,50}$/
      if (!reg.test(value)) {
        callback(new Error('密码至少包含大小写字母、数字、特殊字符，长度为9~50'))
      }
      callback()
    }
    const confirmValidate = (rule, value, callback) => {
      if (value !== this.temp.password) {
        callback(new Error('两次密码不一致'))
      }
      callback()
    }
    return	{
      rules: {
        id: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名称长度为3~20位', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '登录密码不能为空', trigger: 'blur' },
          { validator: pwdValidate, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { validator: confirmValidate, trigger: 'blur' }
        ]
      },
      temp: {},
      createOption: true
    }
  },
  watch: {
    rowData: {
      handler(val) {
        this.$nextTick(() => {
          this.$refs['editUserForm'].clearValidate()
        })
        this.temp = JSON.parse(JSON.stringify(val))
        const keys = Object.keys(val)
        if (keys.length === 0) { // 新增用户
          this.createOption = true
        } else {
          this.createOption = false
        }
      },
      immediate: true
    }
  },
  methods:	{
    formSubmit() {
      this.$refs['editUserForm'].validate((valid) => {
        if (!valid) return false
        if (this.createOption) this.temp.name = this.temp.id
        const paramsTemp = Object.assign({}, this.temp)
        if (paramsTemp.password) {
          paramsTemp.password = sha1(this.temp.password)
        }
        delete paramsTemp.confirmPassword
        if (this.createOption) {
          addUser(paramsTemp).then(res => {
            if (res.code === 200) {
              this.$notification.success({
                message: res.msg,
                duration: 2
              })
              this.$refs['editUserForm'].resetFields()
              this.$emit('on-refresh')
            }
          })
        } else {
          updateUser(paramsTemp).then(res => {
            if (res.code === 200) {
              this.$notification.success({
                message: res.msg,
                duration: 2
              })
              this.$refs['editUserForm'].resetFields()
              this.$emit('on-refresh')
            }
          })
        }
      })
    }
  }
}
</script>
<style scoped>

</style>
