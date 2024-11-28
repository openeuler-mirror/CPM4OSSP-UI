import request from './config'

export function getSource(data) {
  return request({
    url: '/node/getSourceList',
    method: 'post',
    data
  })
}

export function setSource(data) {
  return request({
    url: '/node/setSourceList',
    method: 'post',
    data,
    headers: {
      tip: 'no'
    }
  })
}

export function scanSourceListOnce(data) {
  return request({
    url: '/node/scanSourceListOnce',
    method: 'post',
    data
  })
}

export function scanSourceListCycle(data) {
  return request({
    url: '/node/scanSourceListCycle',
    method: 'post',
    data
  })
}

export function setSourceDataBase(data) {
  return request({
    url: '/node/setSourceDatabase',
    method: 'post',
    data
  })
}

export function getSourceDataBase(data) {
  return request({
    url: '/node/getSourceDatabase',
    method: 'post',
    data
  })
}

export function delSourceDataBase(data) {
  return request({
    url: '/node/delSourceDatabaseByID',
    method: 'post',
    data
  })
}

export function getScanSource(data) {
  return request({
    url: '/node/getScanSource',
    method: 'post',
    data
  })
}

export function rollbackSourceList(data) {
  return request({
    url: '/node/rollbackSourceList',
    method: 'post',
    data
  })
}
