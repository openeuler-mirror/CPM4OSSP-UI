<template>
  <a-layout>
    <a-layout-sider theme="light" class="sider jpom-node-sider">
      <a-menu theme="light" mode="inline" :default-selected-keys="selectedKeys" :default-open-keys="defaultOpenKey">
        <template v-for="menu in nodeMenuList">
          <a-sub-menu v-if="Array.isArray(menu.childs)" :key="menu.pid" :class="menu.id">
            <span slot="title">
              <a-icon v-if="menu.icon_v3" :type="menu.icon_v3" />
              <span>{{ menu.title }}</span>
            </span>
            <a-menu-item v-for="subMenu in menu.childs" :key="subMenu.id" :class="subMenu.id" @click="handleMenuClick(subMenu.id, subMenu.pId)">
              <span>{{ subMenu.title }}</span>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else :key="menu.id" @click="handleMenuClick(menu.id)">
            <a-icon v-if="menu.icon_v3" :type="menu.icon_v3" />
            <span>{{ menu.title }}</span>
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
</template>

<script>
import { mapGetters } from 'vuex'
import { getNodeMenu } from '../../../api/menu'
export default {
  props: {
    node: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      nodeMenuList: [],
      selectedKeys: [this.$route.query.id || 'welcome']
    }
  },
  computed: {
    ...mapGetters([
      'getGuideFlag'
    ]),
    currentId() {
      return this.selectedKeys[0]
    },
    defaultOpenKey() {
      let keyList = []
      if (this.getGuideFlag && !this.$route.query.pId) {
        keyList = ['systemConfig']
      } else if (this.$route.query.pId) {
        keyList = [this.$route.query.pId]
      }
      return keyList
    }
  },
  created() {
    this.loadNodeMenu()
  },
  methods: {
    loadNodeMenu() {
      getNodeMenu(this.node.id).then(res => {
        if (res.code === 200) {
          const data = res.data.map(item => {
            const childs = item.childs && item.childs.map(sub => {
              return { ...sub, pId: item.id }
            })
            return { ...item, childs }
          })
          this.nodeMenuList = data
        }
      })
    },
    handleMenuClick(id, pId) {
      this.selectedKeys = [id]
      this.$router.push({
        query: {
          ...this.$route.query,
          pId: pId,
          id: id
        }
      })
    }
  }
}
</script>

<style scoped>
.sider {
  height: calc(100vh - 75px);
  overflow-y: auto;
}
.layout-content {
  height: calc(100vh - 95px);
  overflow-y: auto;
  margin: 10px 10px 0 10px;
}
</style>
