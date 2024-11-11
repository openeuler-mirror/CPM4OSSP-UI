import { getInstallablePackage } from '@/api/node_package'

const nodePackage = {
  state: {
    // 可安装软件包
    installPackages: [],
    // 当前选中的软件包
    selectPackage: ''
  },
  mutations: {
    SET_PACKAGE_LIST(state, data) {
      state.installPackages = data
    },
    SET_SELECT_PACKAGE(state, data) {
      state.selectPackage = data
    }
  },
  actions: {
    // 获取软件可安装软件包列表
    getPackages({ commit }, params) {
      return new Promise((reslove, reject) => {
        getInstallablePackage(params).then(res => {
          if (res.code === 200) {
            commit('SET_PACKAGE_LIST', res.data || [])
            reslove()
          }
          reject()
        })
      })
    }
  },
  getters: {
    getInstallPackages(state) {
      return state.installPackages
    }
  }
}

export default nodePackage
