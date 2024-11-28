import axios from './config'

export function checkSystem() {
  return axios({
    url: '/check-system',
    method: 'post',
    headers: {
      loading: 'no',
      tip: 'no'
    }
  })
}

export function initInstall(params) {
  return axios({
    url: '/install_submit.json',
    method: 'post',
    data: params
  })
}