<template>
  <a-menu v-model="selectedKeys" theme="dark" mode="inline" :open-keys="openKeys" @openChange="onOpenChange">
    <template v-for="menu in getMenus">
      <a-sub-menu v-if="menu.childs&&menu.childs.length>0" :key="menu.icon_v3">
        <span slot="title">
          <a-icon :type="menu.icon_v3" :style="{ fontSize: '18px'}" />
          <span>{{ menu.title }}</span>
        </span>
        <a-menu-item v-for="subMenu in menu.childs" :key="subMenu.id" @click="handleClick(subMenu)">
          <span>{{ subMenu.title }}</span>
        </a-menu-item>
      </a-sub-menu>
      <a-menu-item v-else :key="menu.id" @click="handleClick(menu)">
        <a-icon :type="menu.icon_v3" :style="{ fontSize: '18px'}" />
        <span>{{ menu.title }}</span>
      </a-menu-item>
    </template>
  </a-menu>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      selectedKeys: [],
      timer: null,
      rootSubmenuKeys: [],
      openKeys: []
    }
  },
  computed: {
    ...mapGetters([
      'getMenus',
      'getActiveMenuKey'
    ])
  },
  watch: {
    '$route'(val) {
      for (let i = 0; i < this.getMenus.length; i++) {
        if (this.getMenus[i].childs && this.getMenus[i].childs.length > 0) {
          const paths = this.getMenus[i].childs.map(item => item.path)
          if (paths.includes(val.path)) {
            this.openKeys = [this.getMenus[i].icon_v3]
            break
          }
        } else {
          if (this.getMenus[i].path === val.path) {
            this.openKeys = [this.getMenus[i].icon_v3]
          }
        }
      }
    }
  },
  created() {
    for (let item of this.getMenus) {
      this.rootSubmenuKeys.push(item.icon_v3)
      if (item.childs && item.childs.length > 0) {
        const paths = item.childs.map(item => item.path)
        if (paths.includes(this.$route.path)) {
          this.openKeys = [item.icon_v3]
        }
      }
    }
    this.activeMenu()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    handleClick(menu) {
      if (!menu.path) {
        this.$notification.error({
          message: '路由无效，无法跳转',
          duration: 2
        })
        return false
      }
      if (this.$route.path === menu.path) return
      // 跳转路由
      this.$router.push(menu.path)
    },
    activeMenu() {
      this.timer = setInterval(() => {
        if (this.getActiveMenuKey) {
          this.selectedKeys = [this.getActiveMenuKey]
        }
      }, 1000)
    },
    onOpenChange(openKeys) {
      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1)
      if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.openKeys = openKeys
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      }
    }
  }
}
</script>
