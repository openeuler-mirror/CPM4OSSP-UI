import request from './config'

export function getPlanSourceList() {
  return request({
    url: '/querySource',
    method: 'post'
  })
}

// 分页时需要先调用一下这个接口
export function getSourcePackageByPlan(data) {
  return request({
    url: '/querySourceByPlan',
    method: 'post',
    timeout: 0,
    data
  })
}

// 分页时传页码和每页数据条数
export function getSourcePackagePage(data) {
  return request({
    url: '/queryPage',
    method: 'post',
    timeout: 0,
    data
  })
}

// 新增一条软件源方案
export function insertSource(data) {
  return request({
    url: '/insertSource',
    method: 'post',
    data,
    timeout: 0
  })
}

// 删除一条软件源方案
export function deleteSource(data) {
  return request({
    url: '/delSource',
    method: 'post',
    data
  })
}

// 修改源方案
export function updateSourcePlan(data) {
  return request({
    url: '/updateSource',
    method: 'post',
    data
  })
}

// 创建批量任务
export function batchProcessing(data, isTip) {
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    tip: 'no'
  }
  if (isTip) delete headers.tip
  return request({
    timeout: 0,
    url: '/node/BatchProcessing',
    method: 'post',
    headers,
    data
  })
}

// 新增用户分类
export function insertUserPkgPlan(data) {
  return request({
    url: '/updatePkgClass',
    method: 'post',
    data
  })
}

// 批量下发
export function putToTaskGroupQueue(data) {
  return request({
    url: '/node/putToTaskGroupQueue',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}

export function getPkgSectionsList() {
  return request({
    url: 'pkgSectionsList',
    method: 'post'
  })
}
