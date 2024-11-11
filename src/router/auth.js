import { notification } from 'ant-design-vue'
import router from './index'
import store from '../store/index'

const whiteList = [
  '/login', '/install', '/system/ipAccess'
]

router.beforeEach((to, from, next) => {
  if (to?.meta?.title) {
    document.title = to.meta.title + '-系统软件安装管理平台'
  } else {
    document.title = '系统软件安装管理平台'
  }
  if (whiteList.indexOf(to.path) !== -1) {
    next()
    return
  }
  if (!store.getters.getToken) {
    if (from.path !== '/') {
      notification.error({
        message: '未登录，无法访问！',
        description: `from: ${from.path} ==> to: ${to.path}`,
        duration: 2
      })
    }
    next('/login')
    return
  }
  if (store.getters.getToken && from.path === '/') {
    store.dispatch('loadSystemMenus')
  }
  store.dispatch('addTab', { key: to.name, path: to.path }).then(() => {
    next()
  })
})
