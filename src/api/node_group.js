import axios from './config'

// 节点分组查询
export function listGroup(data) {
  return axios({
    url: '/nodeGroup/list',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}

// 节点分组新增
export function addGroup(data) {
  return axios({
    url: '/nodeGroup/add',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}

// 节点分组修改
export function updateGroup(data) {
  return axios({
    url: '/nodeGroup/update',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}

// 节点分组删除
export function deleteGroup(data) {
  return axios({
    url: '/nodeGroup/delete',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}

// 查询分组节点列表
export function nodelist(data) {
  return axios({
    url: '/nodegroupinfo/nodelist',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}
