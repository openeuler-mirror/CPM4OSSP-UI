import Vue from 'vue'
import axios from 'axios'
import Qs from 'qs'
import store from '../store'
import router from '../router'
import { NO_NOTIFY_KEY, NO_LOADING_KEY, TOKEN_HEADER_KEY } from '../utils/const'
import { refreshToken } from './user'
import { notification } from 'ant-design-vue'

// 静态全局baseUrl
const serverIp = window.localStorage.getItem('mini_serverIp')
axios.defaults.baseURL = serverIp ? `http://${serverIp}:2124` : process.env.VUE_APP_BASE_API
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

// 请求拦截器
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

    // 版本获取时，不带请求头
    if (config.url === '/version') delete config.headers[TOKEN_HEADER_KEY]

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
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
      // 如果 headers 里面配置了 tip: no或者响应体里没有msg字段 就不用弹出提示信息
      if (!response.config.headers[NO_NOTIFY_KEY] && res.msg) {
        notification.error({
          message: res.msg,
          // description: response.config.url,
          duration: 2
        })
      }
    }

    return res
  },
  (error) => {
    if (!error.response) {
      // 网络异常
      $global_loading && $global_loading.close()
      notification.error({
        message: '网络错误',
        description: '网络开了小差，请检查服务器IP后重试...',
        duration: 2
      })
      // for debug
      return Promise.reject(error)
    }
    // 如果 headers 里面配置了 loading: no 就不用 loading
    if (!error.response.config.headers[NO_LOADING_KEY]) {
      $global_loading && $global_loading.close()
    }
    // 如果 headers 里面配置了 tip: no 就不用弹出提示信息
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

// 判断 jwt token 状态
function checkJWTToken(res, response) {
  console.log('checkJWTToken----------', res, res.code)
  // 如果是登录信息失效
  if (res.code === 800) {
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
  // 如果 jwt token 还可以续签
  if (res.code === 801) {
    notification.close()
    notification.info({
      message: '登录信息过期，尝试自动续签...',
      description: '如果不需要自动续签，请修改配置文件。该续签将不会影响页面。',
      duration: 3
    })
    // 续签且重试请求
    return redoRequest(response.config)
  }
}

// 刷新 jwt token 并且重试上次请求
function redoRequest(config) {
  return new Promise((resolve) => {
    Promise.resolve(refreshToken()).then((result) => {
      if (result.code === 200) {
        // 调用 store action 存储当前登录的用户名和 token
        store.dispatch('login', result.data)
        resolve()
      }
    })
  }).then(() => {
    // 重试原来的请求
    return request(config)
  })
}

export default request
