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

// 获取软件包列表数据
export function getPackageList(data) {
  return request({
    url: '/getPackageInfo',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  })
}
// 软件包列表刷新
export function refreshPackageList(data) {
  return request({
    url: '/packageRefresh',
    method: 'post',
    data
  })
}

// 删除任务记录
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

// 修改任务为已读状态
export function setTaskViewed(data) {
  return request({
    url: '/node/setTaskViewed',
    method: 'post',
    data
  })
}

// 获取当前节点可安装的软件包列表
export function getInstallablePackage(data) {
  return request({
    timeout: 0,
    url: '/node/getSourcePackageInfo',
    method: 'post',
    data: data
  })
}

// 根据关键字获取节点可安装的软件包
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

// 获取可升级软件包列表
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

// 获取安装软件依赖包
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

// 查询软件包下服务器
export function getNodeByPkgName(data) {
  return request({
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    url: '/getNodeByPkgName',
    method: 'post',
    data
  })
}

// 查询系统内软件包总数量
export function getAllPkgCount(data) {
  return request({
    url: '/getAllPkgCount',
    method: 'get',
    data
  })
}
