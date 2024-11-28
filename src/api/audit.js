import request from './config'

// 获取审计日志列表和系统日志列表
export function getAuditList(params) {
  return request({
    url: '/minisyslog/queryLogByCondition',
    method: 'get',
    params
  })
}
