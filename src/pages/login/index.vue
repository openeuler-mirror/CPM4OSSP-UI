<template>
  <div class="login-wrapper">
    <span v-if="isDevelopment || useEnvironment === 'dev'" class="server-ip" @click="setServerIpVisible = true"><a-icon type="desktop" />服务器IP: {{ serverIp }}</span>
    <a-card class="login-card" hoverable>
      <a-card-meta title="欢迎登录" style="text-align: center" description="" />
      <br>
      <a-form :form="loginForm" :label-col="{ span: 0 }" @submit="handleLogin">
        <a-form-item :wrapper-col="{span: 24}">
          <a-input v-decorator="['userName', { rules: [{ required: true, message: '请输入用户名' }] }]" placeholder="用户名" />
        </a-form-item>
        <a-form-item :wrapper-col="{span: 24}">
          <a-input-password v-decorator="['userPwd', { rules: [{ required: true, message: '请输入密码' }] }]" placeholder="密码" />
        </a-form-item>
        <a-button :loading="loading" icon="login" type="primary" html-type="submit" class="btn-login">登 录</a-button>
      </a-form>
    </a-card>
    <a-modal v-model="setServerIpVisible" title="IP设置" @ok="handleIpSet" @keyup.native.enter="handleIpSet">
      <server-ip-set ref="serverIpSet" />
    </a-modal>
  </div>
</template>

<script>
import { login } from '../../api/user'
import { checkSystem } from '../../api/install'
import sha1 from 'sha1'
import ServerIpSet from '@/components/serverIp/index.vue'
import { useEnvironment } from '../../../settings'
export default {
  components: {
    ServerIpSet
  },
  data() {
    return {
      loading: false,
      loginForm: this.$form.createForm(this, { name: 'login-form' }),
      setServerIpVisible: false,
      isDevelopment: process.env.NODE_ENV === 'development',
      serverIp: '',
      useEnvironment
    }
  },
  created() {
    this.checkSystem()
    this.serverIp = localStorage.getItem('mini_serverIp')
  },
  methods: {
    checkSystem() {
      checkSystem().then(res => {
        if (res.code === 900) {
          this.$router.push('/system/ipAccess')
        } else if (res.code !== 200) {
          this.$notification.warn({
            message: res.msg,
            duration: 2
          })
          this.$router.push('/install')
        }
      })
    },
    handleLogin(e) {
      e.preventDefault()
      this.loginForm.validateFields((err, values) => {
        if (!err) {
          const params = {
            ...values,
            userPwd: sha1(values.userPwd)
          }
          this.loading = true
          login(params).then(res => {
            if (res.code === 200) {
              this.$notification.success({
                message: res.msg,
                duration: 2
              })
              this.$store.dispatch('login', { token: res.data.token, longTermToken: res.data.longTermToken }).then(() => {
                this.$router.push({ path: '/' })
              })
            }
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    handleIpSet() {
      this.$refs.serverIpSet.handleSubmit().then(() => {
        this.$notification.success({ message: '修改服务器IP成功' })
        this.setServerIpVisible = false
        location.reload()
      }).catch(() => {
        this.$notification.error({ message: '请输入正确的IP' })
      })
    }
  }
}
</script>

<style lang='scss' scoped>
.login-wrapper {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  .server-ip{
    cursor: pointer;
    color: #303030;
    position: absolute;
    top: 10px;
    left: 20px;
    i{
      margin-right: 5px;
    }
  }
}
.login-card {
  min-width: 380px;
  border-radius: 8px;
  border: none;
}
.btn-login {
  width: 100%;
  margin: 10px 0;
}
</style>
<style>

.login-wrapper .login-card .ant-card-meta-title {
  font-size: 30px;
  color: #fff;
}
.ant-card-body {
  padding: 30px;
}
</style>
