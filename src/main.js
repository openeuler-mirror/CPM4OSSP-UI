import Vue from 'vue'
import App from './App.vue'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import './assets/reset.css'
import './assets/index.scss'
import { Tree, Progress, Loading } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import router from './router'
import store from './store'
import './router/auth'
import { validator, waiting } from '@/directive/directive'
import VueDraggableResizable from 'vue-draggable-resizable'
import CustomTable from '@/components/custom-table'

// debug routerBase
window.routerBase = window.routerBase === '<routerBase>' ? '' : window.routerBase

Vue.config.productionTip = false
Vue.prototype.$loading = Loading
Vue.directive('validator', validator)
Vue.use(Antd)
Vue.use(Tree)
Vue.use(Progress)
Vue.component('VueDraggableResizable', VueDraggableResizable)
Vue.directive('waiting', waiting)
// 全局注册二次封装的表格
Vue.component('CustomTable', CustomTable)

new Vue({
  router,
  store,
  data: {
    eventHub: new Vue()
  },
  render: (h) => h(App)
}).$mount('#app')
