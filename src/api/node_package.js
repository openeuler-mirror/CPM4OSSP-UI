import request from './config'
// import qs from 'qs'

export function addPackageTask(data) {
  return request({
    url: '/node/putToTaskQueue',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}

export function getTaskStatus(data) {
  return request({
    url: '/node/getTaskStatus',
    method: 'post',
    data
  })
}

export function startThread(data) {
  return request({
    url: '/node/threadServiceRunner',
    method: 'post',
    data
  })
}

export function getPackageList(data) {
  return request({
    url: '/node/getPackageInfo',
    method: 'post',
    data
  })
}

export function delTaskById(data) {
  return request({
    url: '/node/delTaskById',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function setTaskViewed(data) {
  return request({
    url: '/node/setTaskViewed',
    method: 'post',
    data
  })
}

export function getInstallablePackage(data) {
  return request({
    timeout: 0,
    url: '/node/getSourcePackageInfo',
    method: 'post',
    data: data
  })
}

export function getInstallablePackageByKeyword(data) {
  return request({
    url: '/node/searchSourcePackageInfo',
    method: 'post',
    data,
    headers: {
      tip: 'no'
    }
  })
}

export function getUpdateablePackage(nodeId) {
  return request({
    headers: {
      tip: 'no'
    },
    url: '/node/getUpgradeable',
    method: 'post',
    data: { nodeId }
  })
}

export function queryDependency(data) {
  return request({
    headers: {
      tip: 'no',
      'Content-Type': 'application/json; charset=UTF-8'
    },
    url: '/pkg/queryDependency?nodeId=' + data.nodeId,
    method: 'post',
    data: { packageName: data.packageName }
  })
}
