import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const children = [
  {
    path: '/node/list',
    name: 'node-list',
    meta: { title: '节点列表' },
    component: () => import('../pages/node/list')
  },
  {
    path: '/user/list',
    name: 'user-list',
    meta: { title: '用户列表' },
    component: () => import('../pages/user')
  },
  {
    path: '/audit/list',
    name: 'audit-list',
    meta: { title: '审计日志' },
    component: () => import('@/pages/audit')
  },
  {
    path: '/repository/package',
    name: 'repository-package',
    meta: { title: '软件包列表' },
    component: () => import('@/pages/repository/package')
  },
  {
    path: '/repository/source',
    name: 'repository-source',
    meta: { title: '软件源模板列表' },
    component: () => import('@/pages/repository/source')
  }
]

const router = new Router({
  mode: 'hash',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/login')
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/layout'),
      redirect: '/node/list',
      children: children
    },
    {
      path: '/install',
      name: 'install',
      component: () => import('../pages/install')
    },
    {
      path: '*',
      name: '404',
      component: () => import('../pages/404')
    },
    {
      path: '/system/ipAccess',
      name: 'ipAccess',
      component: () => import('../pages/system/ipAccess')
    }
  ]
})

export default router
