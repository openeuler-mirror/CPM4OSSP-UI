import { ACTIVE_TAB_KEY, TAB_LIST_KEY, ACTIVE_MENU_KEY } from '../../utils/const'

const app = {
  state: {
    activeTabKey: sessionStorage.getItem(ACTIVE_TAB_KEY),
    tabList: JSON.parse(sessionStorage.getItem(TAB_LIST_KEY)) || [],
    activeMenuKey: sessionStorage.getItem(ACTIVE_MENU_KEY)
  },
  mutations: {
    setActiveTabKey(state, activeKey) {
      state.activeTabKey = activeKey
      sessionStorage.setItem(ACTIVE_TAB_KEY, activeKey)
    },
    setTabList(state, tabList) {
      state.tabList = tabList
      sessionStorage.setItem(TAB_LIST_KEY, JSON.stringify(tabList))
    },
    setActiveMenuKey(state, activeMenuKey) {
      state.activeMenuKey = activeMenuKey
      sessionStorage.setItem(ACTIVE_MENU_KEY, activeMenuKey)
    }
  },
  actions: {
    addTab({ commit, state, rootGetters }, tab) {
      const menus = rootGetters.getMenus
      let currentMenu = findMenuByPath(menus, tab.path)

      if (!currentMenu) {
        console.error('Menu not found for path:', tab.path)
        return
      }

      tab.title = currentMenu.title
      tab.id = currentMenu.id

      let tabList = [...state.tabList]
      const index = tabList.findIndex(ele => ele.key === tab.key)

      if (index > -1) {
        commit('setActiveTabKey', tab.key)
      } else {
        tabList.push(tab)
        commit('setTabList', tabList)
        commit('setActiveTabKey', tab.key)
      }

      commit('setActiveMenuKey', tab.id)
    },
    removeTab({ commit, state }, key) {
      let tabList = [...state.tabList]
      const index = tabList.findIndex(ele => ele.key === key)

      if (index === -1) return

      tabList.splice(index, 1)

      if (state.activeTabKey === key) {
        const tempTab = tabList[Math.max(0, index - 1)] || tabList[0]
        if (tempTab && tempTab.key !== state.activeTabKey) {
          commit('setActiveTabKey', tempTab.key)
        }
      }

      commit('setTabList', tabList)
    },
    clearTabs({ commit, state }, isAll = false) {
      if (isAll) {
        commit('setTabList', [])
        sessionStorage.removeItem(TAB_LIST_KEY)
        return
      }

      const currentTab = state.tabList.find(ele => ele.key === state.activeTabKey)
      commit('setTabList', currentTab ? [currentTab] : [])
    },
    activeMenu({ commit }, activeMenuKey) {
      commit('setActiveMenuKey', activeMenuKey)
    }
  },
  getters: {
    getTabList: state => state.tabList,
    getActiveTabKey: state => state.activeTabKey,
    getActiveMenuKey: state => state.activeMenuKey
  }
}

function findMenuByPath(menus, path) {
  for (const menu of menus) {
    if (menu.path === path) return menu
    if (menu.childs) {
      const subMenu = findMenuByPath(menu.childs, path)
      if (subMenu) return subMenu
    }
  }
  return null
}

export default app