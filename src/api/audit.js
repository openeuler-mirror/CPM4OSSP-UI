import request from '@/utils/request'

export function getAuditList(params) {
  return request({
    url: '/minisyslog/queryLogByCondition',
    method: 'get',
    params
  })
}
