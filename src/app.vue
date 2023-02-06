<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
      <Waiting />
    </div>
  </a-config-provider>
</template>

<script>

import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import Waiting from '@/components/waiting'
export default {
  name: 'App',
  components: {
    Waiting
  },
  data() {
    return {
      locale: zhCN
    }
  },
  created() {
    this.$notification.config({
      top: '100px',
      duration: 2
    })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}
</style>
