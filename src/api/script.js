import request from './config'

// 上传脚本
export function uploadScriptApi(data) {
  return request({
    url: '/script/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
    data
  })
}
