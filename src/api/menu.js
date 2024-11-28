import request from './config'

export function getSystemMenu() {
  return request({
    url: '/menus_data.json',
    method: 'post'
  })
}

export function getNodeMenu(nodeId) {
  return request({
    url: '/menus_data.json',
    method: 'post',
    data: { nodeId }
  })
}
