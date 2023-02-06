<template>
  <div class="user-header">
    <div v-if="!isMenuShow" class="select-wrap">
      <a-dropdown>
        <a class="ant-dropdown-link"><a-icon type="menu" style="font-size:18px" /></a>
        <a-menu slot="overlay" @click="handleMenu">
          <a-menu-item v-for="item in menuList" :key="item.title">{{ item.title }}</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <div v-if="isMenuShow" class="menu-wrap">
      <a-tooltip class="header-item" placement="top" title="只保留当前标签页" @click="closeTabs">
        <span class="header-text"><a-icon type="close-circle" />关闭标签页</span>
      </a-tooltip>
      <a-tooltip class="header-item" placement="top" title="修改密码" @click="handleUpdatePwd">
        <span class="header-text"><a-icon type="user" />{{ getUserInfo.name }}</span>
      </a-tooltip>
      <a-tooltip class="header-item last" placement="top" title="退出登录" @click="logOut">
        <span class="header-text"><a-icon type="logout" />注销</span>
      </a-tooltip>
    </div>
    <a-modal v-model="updateNameVisible" title="修改密码" :mask-closable="false" @keyup.native.enter="handleUpdatePwdOk" @ok="handleUpdatePwdOk">
      <a-form-model ref="pwdForm" :rules="rules" :model="temp" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-model-item label="原密码" prop="oldPwd">
          <a-input-password v-model="temp.oldPwd" placeholder="请输入原密码" />
        </a-form-model-item>
        <a-form-model-item label="新密码" prop="newPwd">
          <a-input-password v-model="temp.newPwd" placeholder="请输入新密码" />
        </a-form-model-item>
        <a-form-model-item label="确认密码" prop="confirmPwd" class="mb0">
          <a-input-password v-model="temp.confirmPwd" placeholder="请输入确认密码" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { updatePwd } from '../../api/user'
import sha1 from 'sha1'
export default {
  data() {
    const pwdValidate = (rule, value, callback) => {
      const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*])[\da-zA-Z~!@#$%^&*]{9,50}$/
      if (!reg.test(value)) {
        callback(new Error('密码至少包含大小写字母、数字、特殊字符，长度为9~50'))
      }
      callback()
    }
    const confirmValidate = (rule, value, callback) => {
      if (value !== this.temp.newPwd) {
        callback(new Error('两次密码不一致'))
      }
      callback()
    }
    return {
      collapsed: false,
      updateNameVisible: false,
      updateUserVisible: false,
      temp: {},
      rules: {
        oldPwd: [{ required: true, message: '原密码不能为空', trigger: 'blur' }],
        newPwd: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { validator: pwdValidate, trigger: 'blur' }
        ],
        confirmPwd: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { validator: confirmValidate, trigger: 'blur' }
        ]
      },
      isMenuShow: true,
      menuList: [
        { title: '关闭标签页', handle: this.closeTabs },
        { title: '修改密码', handle: this.handleUpdatePwd },
        { title: '注销', handle: this.logOut }
      ]
    }
  },
  computed: {
    ...mapGetters(['getToken', 'getUserInfo', 'getTabList'])
  },
  watch: {
    updateNameVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.pwdForm.clearValidate()
        })
      }
    }
  },
  mounted() {
    this.isMenuShow = window.innerWidth > 768
    window.addEventListener('resize', this.handleResize)
  },
  beforeMount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize(e) {
      const width = e.target.innerWidth
      if (width <= 768) {
        this.isMenuShow = false
      } else {
        this.isMenuShow = true
      }
    },
    logOut() {
      this.$confirm({
        title: '系统提示',
        content: '真的要退出系统么？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          return new Promise((resolve) => {
            this.$store.dispatch('logOut').then(() => {
              this.$notification.success({
                message: '退出登录成功',
                duration: 2
              })
            }).finally(() => {
              this.$router.push('/login')
              resolve()
            })
          })
        }
      })
    },
    handleUpdatePwd() {
      this.temp = {}
      this.updateNameVisible = true
    },
    handleUpdatePwdOk() {
      this.$refs['pwdForm'].validate((valid) => {
        if (!valid) return false
        const params = {
          oldPwd: sha1(this.temp.oldPwd),
          newPwd: sha1(this.temp.newPwd)
        }
        updatePwd(params).then((res) => {
          if (res.code === 200) {
            this.$store.dispatch('logOut').then(() => {
              this.$notification.success({
                message: res.msg,
                duration: 2
              })
              this.$refs['pwdForm'].resetFields()
              this.updateNameVisible = false
              this.$router.push('/login')
            })
          }
        })
      })
    },
    closeTabs() {
      this.$notification.success({
        message: '操作成功',
        top: '100px',
        duration: 1
      })
      this.$store.dispatch('clearTabs')
    },
    handleMenu(e) {
      this.menuList.forEach((item, index) => {
        if (e.key === item.title) {
          this.menuList[index].handle()
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.user-header {
  display: inline-table;
  text-align: right;
  margin-right: 20px;
  cursor: pointer;
}
.header-item{
  margin-right:15px;
}
.header-item.last{
  margin: 0;
}
.header-text{
  font-size: 14px;
}
.header-text i {
  font-size: 16px;
  margin-right: 1px;
}
.header-text:hover{
  color: #1890ff;
}
.menu-wrap{
  display: inline-block;
  transition: all 1s;
}
.select-wrap{
  display: inline-block;
  transition: all 1s;
}
.menu-trigger{
  font-size: 17px;
  :hover{
    color: #1890ff;
  }
}
</style>
