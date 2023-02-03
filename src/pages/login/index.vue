<template>
  <div class="login-wrapper">
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
  </div>
</template>

<script>
import { login } from '../../api/user'
import { checkSystem } from '../../api/install'
import sha1 from 'sha1'
export default {
  data() {
    return {
      loading: false,
      loginForm: this.$form.createForm(this, { name: 'login-form' }),
      setServerIpVisible: false,
      isDevelopment: process.env.NODE_ENV === 'development',
    }
  },
  created() {
    this.checkSystem()
  },
  methods: {
    // 检查是否需要初始化
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
    // 登录
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
              // 调用 store action 存储当前登录的用户名和 token
              this.$store.dispatch('login', { token: res.data.token, longTermToken: res.data.longTermToken }).then(() => {
                // 跳转主页面
                this.$router.push({ path: '/' })
              })
            }
          }).finally(() => {
            this.loading = false
          })
        }
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
