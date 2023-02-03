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
    login({ dispatch, commit }, data) {
      return new Promise((resolve) => {
        commit('setToken', data)
        getUserInfo().then(res => {
          if (res.code === 200) {
            commit('setUserInfo', res.data)
            sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(res.data))
          }
        })
        dispatch('loadSystemMenus').then(() => {
          resolve()
        })
      })
    },
    loadSystemMenus({ commit }) {
      return new Promise((resolve, reject) => {
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
