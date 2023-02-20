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

