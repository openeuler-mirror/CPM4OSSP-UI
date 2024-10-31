/**
 * 路由菜单
 * key 对应后台接口返回的菜单中的 id
 * value 表示该路由的 path
 */
const routeMenuMap = {
  'nodeList': '/node/list',
  'nodeGroupManager': '/node/nodeGroupManager',
  'audit': '/audit/list',
  'user': '/user/list',
  'repository_source': '/repository/source',
  'repository_package': '/repository/package',
  'manageScript': '/script/script'
}

export default routeMenuMap
