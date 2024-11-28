import axios from './config'

// 获取文件
export function lsFile(data) {
  return axios({
    url: '/fs/ls',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}

// 查询文件
export function catFile(data) {
  return axios({
    url: '/fs/cat',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}

// 查询文件所属软件包
export function getPkgByFile(data) {
  return axios({
    // baseURL: 'http://172.30.17.23:2124',
    url: '/getPkgByFile',
    method: 'post',
    data
  })
}
