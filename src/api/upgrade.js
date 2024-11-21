import axios from './config'

// 查询节点软件操作记录
export function nodePkgOp(data) {
  return axios({
    url: '/statistic/nodePkgOp/list',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}
