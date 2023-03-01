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
}

export default nodePackage