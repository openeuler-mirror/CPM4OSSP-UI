import axios from '../utils/request'

// login
export function login(params) {
  return axios({
    url: '/userLogin',
    method: 'post',
    data: params
  })
}

// refresh token
export function refreshToken() {
  return axios({
    url: '/renewal',
    method: 'post'
  })
}

// 获取用户信息
export function getUserInfo() {
  return axios({
    url: '/user/user-basic-info',
    method: 'post'
  })
}

// 退出登录
export function loginOut(params) {
  return axios({
    url: '/logout2',
    method: 'get',
    data: params
  })
}

// 修改密码
export function updatePwd(params) {
  return axios({
    url: '/user/updatePwd',
    method: 'post',
    data: params
  })
}

// 用户列表
export function getUserList() {
  return axios({
    url: '/user/getUserList',
    method: 'post'
  })
}

// 添加用户
export function addUser(params) {
  return axios({
    url: '/user/addUser',
    method: 'post',
    data: params
  })
}

// 修改用户
export function updateUser(params) {
  return axios({
    url: '/user/updateUser',
    method: 'post',
    data: params
  })
}

// 删除用户
export function deleteUser(id) {
  return axios({
    url: '/user/deleteUser',
    method: 'post',
    data: { id }
  })
}

// 解锁用户
export function unlockUser(id) {
  return axios({
    url: '/user/unlock',
    method: 'post',
    data: { id }
  })
}
