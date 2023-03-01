import { getInstallablePackage } from '@/api/node_package'

const nodePackage = {
  state: {
    installPackages: [],
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
}

export default nodePackage