import axios from '@/utils/request'

export function getNodeList(params) {
  return axios({
    url: '/node/list_data.json',
    method: 'get',
    params: params
  })
}

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

export function editNode(params) {
  const data = {
    id: params.id,
    name: params.name,
    protocol: params.protocol,
    url: params.url,
    timeOut: params.timeOut,
    cycle: params.cycle,
    openStatus: params.openStatus,
    loginName: params.loginName,
    loginPwd: params.loginPwd,
    type: params.type,
    proxyPort: params.proxyPort
  }
  return axios({
    url: '/node/save.json',
    method: 'post',
    data
  })
}

export function deleteNode(id) {
  return axios({
    url: '/node/del.json',
    method: 'post',
    data: { id }
  })
}

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

export function getTopHistory(data) {
  return axios({
    url: 'node/getTopHistory',
    method: 'post',
    data
  })
}

export function getOsVersion(data) {
  return axios({
    url: '/node/getOsVersion',
    method: 'post',
    data,
    headers: {
      tip: 'no'
    }
  })
}

export function getAptStatus(data) {
  return axios({
    url: '/node/sshGetAptStatus',
    method: 'post',
    data
  })
}

export function unLockApt(data) {
  return axios({
    url: '/node/sshUnLockApt',
    method: 'post',
    data
  })
}

