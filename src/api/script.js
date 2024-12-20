import request from './config'

// 获取脚本列表
export function getScriptListApi(data) {
  return request({
    url: '/script/list',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

// 上传脚本
export function uploadScriptApi(data) {
  return request({
    url: '/script/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
    data
  })
}

// 下发脚本
export function executeScriptApi(data) {
  return request({
    url: '/script/execute',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

// 获取命令列表
export function getCmommandListApi(data) {
  return request({
    url: '/manageCommandPre/list',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

// 新增命令
export function addCommandApi(data) {
  return request({
    url: '/manageCommandPre/insert',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

// 下发命令
export function executeCommandApi(data) {
  return request({
    url: '/manageCommandPre/executeLocal',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}

// 执行结果列表
export function getExecResApi(data) {
  return request({
    url: '/manageCommand/list',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data
  })
}
