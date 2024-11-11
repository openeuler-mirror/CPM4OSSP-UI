import request from '@/utils/request'

export function getPlanSourceList() {
  return request({
    url: '/querySource',
    method: 'post'
  })
}

export function getSourcePackageByPlan(data) {
  return request({
    url: '/querySourceByPlan',
    method: 'post',
    timeout: 0,
    data
  })
}

export function getSourcePackagePage(data) {
  return request({
    url: '/queryPage',
    method: 'post',
    timeout: 0,
    data
  })
}

export function insertSource(data) {
  return request({
    url: '/insertSource',
    method: 'post',
    data,
    timeout: 0
  })
}

export function deleteSource(data) {
  return request({
    url: '/delSource',
    method: 'post',
    data
  })
}

export function updateSourcePlan(data) {
  return request({
    url: '/updateSource',
    method: 'post',
    data
  })
}

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

export function updateUserPkgPlan(data) {
  return request({
    url: '/updateUserPkgPlan',
    method: 'post',
    data
  })
}

export function queryUserPkgPlan(data) {
  return request({
    url: '/queryUserPkgPlan',
    method: 'post',
    data
  })
}

export function delUserPkgPlan(data) {
  return request({
    url: '/delUserPkgPlan',
    method: 'post',
    data
  })
}

export function insertUserPkgPlan(data) {
  return request({
    url: '/updatePkgClass',
    method: 'post',
    data
  })
}

export function getPkgSize(data) {
  return request({
    url: 'getPkgSize',
    method: 'post',
    data
  })
}