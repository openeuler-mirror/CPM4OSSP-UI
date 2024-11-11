import axios from './config'

// node 列表
export function getNodeList(params) {
  return axios({
    url: '/node/list_data.json',
    method: 'get',
    params: params
  })
}

// node 状态
export function getNodeStatus(nodeId) {
  return axios({
    url: '/node/node_status',
    method: 'post',
    data: { nodeId },
    headers: {
      tip: 'no',
      loading: 'no'
    }
  })
}

// 编辑节点
export function editNode(params) {
  const data = {
    id: params.id,
    name: params.name,
    protocol: params.protocol,
    url: params.url,
    timeout: params.timeout,
    cycle: params.cycle,
    openStatus: params.openStatus,
    loginName: params.loginName,
    loginPwd: params.loginPwd,
    type: params.type,
    proxyPort: params.proxyPort,
    checkStatus: params.checkStatus,
    status: params.status,
    linxSerial: params.linxSerial || null,
    snType: params.snType || null,
    snText: params.snText || null,
    system: params.system,
    kernel: params.kernel
  }
  return axios({
    url: '/node/save.json',
    method: 'post',
    data
  })
}

// 删除 node
export function deleteNode(id) {
  return axios({
    url: '/node/del.json',
    method: 'post',
    data: { id }
  })
}

// 节点 top 命令
export function getNodeTop(data) {
  return axios({
    url: '/node/getTop',
    method: 'post',
    data: data,
    headers: {
      loading: 'no'
    }
  })
}

// 获取进程列表
export function getProcessList(nodeId) {
  return axios({
    url: '/node/processList',
    method: 'post',
    data: { nodeId },
    headers: {
      loading: 'no',
      tip: 'no'
    }
  })
}

// 杀进程
export function killPid(params) {
  return axios({
    url: '/node/kill.json',
    method: 'post',
    data: params
  })
}
export function setNodeLocalIp(data) {
  return axios({
    url: 'node/setNodeLocalIp',
    method: 'post',
    data,
    headers: {
      tip: 'no'
    }
  })
}

// 获取历史监控数据
export function getTopHistory(data) {
  return axios({
    url: 'node/getTopHistory',
    method: 'post',
    data
  })
}

// 获取apt锁状态
export function getAptStatus(data) {
  return axios({
    url: '/node/sshGetAptStatus',
    method: 'post',
    data
  })
}

// apt解锁
export function unLockApt(data) {
  return axios({
    url: '/node/sshUnLockApt',
    method: 'post',
    data
  })
}

// 节点列表 包含搜索
export function getNodeListSearch(data) {
  return axios({
    url: '/node/search',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'post',
    data
  })
}
