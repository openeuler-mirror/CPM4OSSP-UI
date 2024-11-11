<template>
  <a-layout>
    <!-- 节点管理侧边栏菜单 -->
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
    <!-- 节点管理组件展示内容 -->
    <a-layout-content class="layout-content jpom-node-content">
      <components :is="nodeMenuMap[currentId]" :node="node" />
      <!-- <welcome v-if="currentId === 'welcome'" :node="node" />
      <package-list v-if="currentId === 'package'" :node="node" />
      <source-list v-if="currentId === 'source'" :node="node" />
      <DictionaryTree v-if="currentId === 'dictionaryTree'" :node="node" /> -->
    </a-layout-content>
  </a-layout>
</template>

<script>
import { getNodeMenu } from '@/api/menu'
import Welcome from './welcome'
import PackageList from './package/package-list.vue'
import SourceList from './source/source_list.vue'
import DictionaryTree from './dictionaryTree'
export default {
  components: {
    Welcome,
    PackageList,
    SourceList,
    DictionaryTree
  },
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
      nodeMenuMap: {
        welcome: Welcome,
        package: PackageList,
        source: SourceList,
        dictionaryTree: DictionaryTree
      },
      selectedKeys: [this.$route.query.id || 'welcome']
    }
  },
  computed: {
    currentId() {
      return this.selectedKeys[0]
    },
    defaultOpenKey() {
      let keyList = []
      if (this.$route.query.pId) {
        keyList = [this.$route.query.pId]
      }
      return keyList
    }
  },
  created() {
    this.loadNodeMenu()
  },
  methods: {
    // 加载菜单
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
    // 点击菜单
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
