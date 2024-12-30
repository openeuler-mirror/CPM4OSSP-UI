import request from './config'

// 获取审计日志列表和系统日志列表
export function getVersionApi(params) {
  return request({
    url: '/version',
    method: 'get',
    params
  })
}
