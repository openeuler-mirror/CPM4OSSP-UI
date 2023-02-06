<template>
  <a-tabs v-model="activeKey" class="my-tabs" hide-add type="editable-card" @edit="onEdit" @change="changeTab">
    <a-tab-pane v-for="tab in getTabList" :key="tab.key" :closeable="tab.closeable">
      <div slot="tab">
        <a-tooltip title="刷新页面">
          <a-button v-if="activeKey===tab.key" type="link" size="small" style="margin:0 0 0 10px;" @click="refreshPage"><a-icon type="sync" /></a-button>
        </a-tooltip>
        <span>{{ tab.title }}</span>
      </div>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  inject: ['reload'],
  computed: {
    ...mapGetters([
      'getActiveTabKey',
      'getTabList'
    ]),
    activeKey: {
      get() {
        return this.getActiveTabKey
      },
      set(value) {
        const index = this.getTabList.findIndex(ele => ele.key === value)
        const activeTab = this.getTabList[index]
        this.$router.push(activeTab.path)
      }
    }
  },
  methods: {
    onEdit(key, action) {
      if (action === 'remove') {
        if (this.getTabList.length === 1) {
          this.$notification.warn({
            message: '不能关闭了',
            duration: 2
          })
          return
        }
        this.$store.dispatch('removeTab', key).then(() => {
          const index = this.getTabList.findIndex(ele => ele.key === this.activeKey)
          const activeTab = this.getTabList[index]
          this.$router.push(activeTab.path)
        })
      }
    },
    changeTab(activekey) {
      const index = this.getTabList.findIndex(ele => ele.key === activekey)
      const currentTab = this.getTabList[index]
      this.$store.dispatch('activeMenu', currentTab.id)
    },
    refreshPage() {
      this.reload()
    }
  }
}
</script>

<style scoped>
.my-tabs {
  flex: 1;
  margin-right: 20px;
  align-self: center;
  height: 40px;
}
</style>
