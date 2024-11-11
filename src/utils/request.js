import Vue from 'vue'
import axios from 'axios'
import Qs from 'qs'
import store from '../store'
import router from '../router'
import { NO_NOTIFY_KEY, NO_LOADING_KEY, TOKEN_HEADER_KEY } from './const'
import { refreshToken } from '../api/user'
import { notification } from 'ant-design-vue'

// 静态全局baseUrl
const serverIp = window.localStorage.getItem('mini_serverIp')
axios.defaults.baseURL = serverIp ? `http://${serverIp}:2122` : process.env.VUE_APP_BASE_API
if (!serverIp) {
  let url = process.env.VUE_APP_BASE_API
  let ip = url.split(':')[1].slice(2)
  localStorage.setItem('mini_serverIp', ip)
}
let $global_loading
let startTime
var delTimeout = 20 * 1000
var apiTimeout = window.apiTimeout === '<apiTimeout>' ? delTimeout : window.apiTimeout
const request = axios.create({
  timeout: apiTimeout || delTimeout,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    loading: 'no'
  },
  responseType: 'json'
})

// request interceptors
request.interceptors.request.use(
  (config) => {
    // 如果 headers 里面配置了 loading: no 就不用 loading
    if (!config.headers[NO_LOADING_KEY]) {
      $global_loading = Vue.prototype.$loading.service({
        lock: true,
        text: '加载数据中，请稍候...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      startTime = new Date().getTime()
    }
    // 处理数据
    if (window.routerBase) {
      // 防止 url 出现 //
      config.url = (window.routerBase + config.url).replace(new RegExp('//', 'gm'), '/')
    }
    if (config.headers['Content-Type'].indexOf('application/x-www-form-urlencoded') !== -1) {
      config.data = Qs.stringify(config.data)
    }
    config.headers[TOKEN_HEADER_KEY] = store.getters.getToken
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// response interceptors
request.interceptors.response.use(
  (response) => {
    // 如果 headers 里面配置了 loading: no 就不用 loading
    if (!response.config?.headers[NO_LOADING_KEY]) {
      const endTime = new Date().getTime()
      if (endTime - startTime < 1000) {
        setTimeout(() => {
          $global_loading && $global_loading.close()
        }, 300)
      } else {
        $global_loading && $global_loading.close()
      }
    }
    // 如果 responseType 是 blob 表示是下载文件
    if (response.request.responseType === 'blob') {
      return response.data
    }
    // 判断返回值，权限等...
    const res = response.data

    // 先判断 jwt token 状态
    if (res.code === 800 || res.code === 801) {
      return checkJWTToken(res, response)
    }

    // 其他情况
    if (res.code !== 200) {
      // 如果 headers 里面配置了 tip: no 就不用弹出提示信息
      if (!response.config.headers[NO_NOTIFY_KEY]) {
        notification.error({
          message: res.msg,
          duration: 2
        })
      }
    }

    return res
  },
  (error) => {
    if (!error.response) {
      // NETWORK ERR
      $global_loading && $global_loading.close()
      notification.error({
        message: '网络错误',
        description: '网络开了小差，请检查服务器IP后重试...',
        duration: 2
      })
      // for debug
      return Promise.reject(error)
    }
    if (!error.response.config.headers[NO_LOADING_KEY]) {
      $global_loading && $global_loading.close()
    }
    if (!error.response.config.headers[NO_NOTIFY_KEY]) {
      const { status, statusText, data } = error.response
      if (!status) {
        notification.error({
          message: '网络错误',
          description: '网络开了小差，请检查服务器IP后重试...',
          duration: 2
        })
      } else {
        notification.error({
          message: status,
          description: (statusText || '') + (data || ''),
          duration: 2
        })
      }
    }
    return Promise.reject(error)
  }
)

function checkJWTToken(res, response) {
  // 如果是登录信息失效
  if (res.code === 800 || res.code === 801) {
    notification.warn({
      message: res.msg,
      // description: response.config.url,
      duration: 3
    })
    store.dispatch('logOut').then(() => {
      router.push('/login')
      location.reload()
    })
    return false
  }

}

function redoRequest(config) {
  return new Promise((resolve) => {
    Promise.resolve(refreshToken()).then((result) => {
      if (result.code === 200) {
        store.dispatch('login', result.data)
        resolve()
      }
    })
  }).then(() => {
    return request(config)
  })
}

export default request
