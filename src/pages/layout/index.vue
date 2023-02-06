<template>
  <a-layout id="app-layout">
    <a-layout-sider v-model="collapsed" :trigger="null" collapsible class="sider" breakpoint="md" collapsed-width="80">
      <div class="logo" :style="{textAlign:collapsed?'center':'left'}">
        <span v-if="!collapsed">系统软件安装管理平台</span>
      </div>
      <side-menu class="side-menu" />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="app-header">
        <a-icon
          class="trigger"
          :type="collapsed ? 'menu-unfold' : 'menu-fold'"
          @click="() => (collapsed = !collapsed)"
        />
        <content-tab />
        <user-header />
      </a-layout-header>
      <a-layout-content class="layout-content">
        <keep-alive>
          <div class="wrap">
            <router-view v-if="isRouterAlive" />
          </div>
        </keep-alive>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import SideMenu from './side-menu'
import UserHeader from './user-header'
import ContentTab from './content-tab'
import { checkSystem } from '../../api/install'
export default {
  components: {
    SideMenu,
    UserHeader,
    ContentTab
  },
  provide() {
    return {
      reload: this.reload
    }
  },
  data() {
    return {
      collapsed: false,
      isRouterAlive: true
    }
  },

  mounted() {
    this.checkSystem()
  },
  methods: {
    // 检查是否需要初始化
    checkSystem() {
      checkSystem().then(res => {
        if (res.data) {
          window.routerBase = res.data.routerBase || ''
        }
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
    // 刷新当前页面
    reload() {
      this.isRouterAlive = false
      this.$nextTick(() => {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

<style lang="scss">
#app-layout {
  height: 100vh;
}
#app-layout .trigger {
  float: left;
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}
#app-layout .trigger:hover {
  color: #1890ff;
}
#app-layout .logo {
  width: 100%;
  cursor: pointer;
  height: 32px;
  margin: 20px 0 12px;
  font-size: 14px;
  color: #fff;
  font-weight: bold;
  overflow: hidden;
  padding: 0 0 0 5px;
  span{
    font-size: 13px;
  }
}
#app-layout .logo img {
  height: 26px;
  vertical-align: sub;
  margin-right: 6px;
}
.app-header {
  display: flex;
  background: #fff;
  padding: 0;
  justify-content: space-between;
}
.sider {
  max-height: 100vh;
  /* overflow-y: auto; */
}
.layout-content {
  padding: 15px;
  min-height: 280px;
}
.edition{
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translate(-50%);
  color: #fff;
}
</style>
