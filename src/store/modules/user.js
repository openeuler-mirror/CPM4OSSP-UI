/**
 * 用户相关的 store
 * 存储了用户的 token，用于接口请求的权限验证
 * 存储用户的基本信息，用于展示
 * 存储该用户对应的菜单列表，用于渲染侧边栏菜单
 * 同样提供与之对应的更新功能
 */
import { TOKEN_KEY, USER_INFO_KEY, MENU_KEY, LONG_TERM_TOKEN } from '../../utils/const'
import { getUserInfo, loginOut } from '../../api/user'
import { getSystemMenu } from '../../api/menu'
import routeMenuMap from '../../router/route-menu'

const user = {
  state: {
    token: sessionStorage.getItem(TOKEN_KEY),
    longTermToken: sessionStorage.getItem(LONG_TERM_TOKEN),
    userInfo: JSON.parse(sessionStorage.getItem(USER_INFO_KEY)),
    menus: JSON.parse(sessionStorage.getItem(MENU_KEY))
  },
  mutations: {
    setToken(state, data) {
      state.token = data.token || ''
      state.longTermToken = data.longTermToken || ''
      if (state.token) {
        sessionStorage.setItem(TOKEN_KEY, data.token)
      } else {
        sessionStorage.removeItem(TOKEN_KEY)
      }
      if (state.longTermToken) {
        sessionStorage.setItem(LONG_TERM_TOKEN, data.longTermToken)
      } else {
        sessionStorage.removeItem(LONG_TERM_TOKEN)
      }
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    setMenus(state, menus) {
      state.menus = menus
    }
  },
  actions: {
    // 登录 data = {token: 'xxx', userName: 'name'}
    login({ dispatch, commit }, data) {
      return new Promise((resolve) => {
        commit('setToken', data)
        // commit('setUserName', data.userName);
        // 加载用户信息
        getUserInfo().then(res => {
          if (res.code === 200) {
            commit('setUserInfo', res.data)
            sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(res.data))
          }
        })
        // 加载系统菜单 这里需要等待 action 执行完毕返回 promise, 否则第一次登录可能会从 store 里面获取不到 menus 数据而报错
        dispatch('loadSystemMenus').then(() => {
          resolve()
        })
      })
    },
    // 加载系统菜单 action
    loadSystemMenus({ commit }) {
      return new Promise((resolve, reject) => {
        // 加载系统菜单
        getSystemMenu().then(res => {
          res.data.forEach(element => {
            if (element.childs && element.childs.length > 0) {
              const childs = element.childs.map(child => {
                return {
                  ...child,
                  'path': routeMenuMap[child.id]
                }
              })
              element.childs = childs
            } else {
              if (element && routeMenuMap && routeMenuMap[element.id]) {
                element.path = routeMenuMap[element.id];
              }
            }
          })
          commit('setMenus', res.data)
          sessionStorage.setItem(MENU_KEY, JSON.stringify(res.data))
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 退出登录 移除对应的 store
    logOut({ dispatch, commit }) {
      return new Promise((resolve, reject) => {
        commit('setToken', {})
        commit('setMenus', '')
        sessionStorage.removeItem(MENU_KEY)
        // 调用其他 action
        dispatch('clearTabs', true)
        loginOut({}).then(() => {
          resolve()
        }).catch(() => {
          reject()
        })
      })
    }
  },
  getters: {
    getToken(state) {
      return state.token
    },
    getLongTermToken(state) {
      return state.longTermToken
    },
    getUserInfo(state) {
      return state.userInfo
    },
    getMenus(state) {
      return state.menus
    }
  }
}

export default user
