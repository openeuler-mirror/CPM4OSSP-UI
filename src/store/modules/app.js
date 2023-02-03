import { ACTIVE_TAB_KEY, TAB_LIST_KEY, ACTIVE_MENU_KEY } from '../../utils/const'

const app = {
  state: {
    activeTabKey: sessionStorage.getItem(ACTIVE_TAB_KEY),
    tabList: JSON.parse(sessionStorage.getItem(TAB_LIST_KEY)),
    activeMenuKey: sessionStorage.getItem(ACTIVE_MENU_KEY)
  },
  mutations: {
    setActiveTabKey(state, activeKey) {
      state.activeTabKey = activeKey
    },
    setTabList(state, tabList) {
      state.tabList = tabList
    },
    setActiveMenuKey(state, activeMenuKey) {
      state.activeMenuKey = activeMenuKey
    }
  },
  actions: {
    addTab({ commit, state, rootGetters }, tab) {
      return new Promise((resolve) => {
        const menus = rootGetters.getMenus
        let currentMenu = {}
        menus.forEach(menu => {
          if (menu.childs) {
            menu.childs.forEach(subMenu => {
              if (subMenu.path === tab.path) {
                currentMenu = subMenu
              }
            })
          }
        })
        tab.title = currentMenu.title
        tab.id = currentMenu.id
        let tabList = state.tabList || []
        const index = tabList.findIndex(ele => ele.key === tab.key)
        if (index > -1) {
          commit('setActiveTabKey', tab.key)
          sessionStorage.setItem(ACTIVE_TAB_KEY, tab.key)
        } else {
          tabList.push(tab)
          commit('setTabList', tabList)
          commit('setActiveTabKey', tab.key)
          sessionStorage.setItem(ACTIVE_TAB_KEY, tab.key)
          sessionStorage.setItem(TAB_LIST_KEY, JSON.stringify(tabList))
        }
        commit('setActiveMenuKey', tab.id)
        sessionStorage.setItem(ACTIVE_MENU_KEY, tab.id)
        resolve()
      })
    },
    removeTab({ commit, state }, key) {
      return new Promise((resolve) => {
        let tabList = state.tabList
        const index = tabList.findIndex(ele => ele.key === key)
        tabList.splice(index, 1)
        if (state.activeTabKey === key) {
          const tempTab = tabList[Math.min(index, 0)]
          if (state.activeTabKey !== tempTab.key) {
            commit('setActiveTabKey', tempTab.key)
            sessionStorage.setItem(ACTIVE_TAB_KEY, tempTab.key)
          }
        }
        commit('setTabList', tabList)
        sessionStorage.setItem(TAB_LIST_KEY, JSON.stringify(tabList))
        resolve()
      })
    },
    clearTabs({ commit, state }, isAll) {
      if (isAll) {
        commit('setTabList', [])
        sessionStorage.removeItem(TAB_LIST_KEY)
        return
      }
      let tabList = state.tabList
      const index = tabList.findIndex(ele => ele.key === state.activeTabKey)
      const currentTab = tabList[index]
      tabList = [currentTab]
      commit('setTabList', tabList)
      sessionStorage.setItem(TAB_LIST_KEY, JSON.stringify(tabList))
    },
    activeMenu({ commit }, activeMenuKey) {
      commit('setActiveMenuKey', activeMenuKey)
      sessionStorage.setItem(ACTIVE_MENU_KEY, activeMenuKey)
    }
  },
  getters: {
    getTabList(state) {
      return state.tabList
    },
    getActiveTabKey(state) {
      return state.activeTabKey
    },
    getActiveMenuKey(state) {
      return state.activeMenuKey
    },
    getGuideFlag(state) {
      return state.guideFlag
    }
  }
}

export default app
