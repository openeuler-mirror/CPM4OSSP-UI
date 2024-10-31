
import { getTaskStatus } from '@/api/node_package'

const node = {
  state: {
    openNodeFlag: false,
    openNode: {},
    taskList: []
  },
  mutations: {
    SET_TASK_LIST(state, data) {
      state.taskList = data
    },
    SET_OPEN_NODE(state, data) {
      state.openNode = { ...data }
      state.openNodeFlag = true
    },
    CLEAR_OPEN_NODE(state) {
      state.openNodeFlag = false
    }
  },
  actions: {
    getTaskList({ commit }, param) {
      return new Promise((resolve, reject) => {
        getTaskStatus(param).then(res => {
          if (res.code === 200) {
            commit('SET_TASK_LIST', res.data)
            resolve(res.data)
          }
        })
      })
    }
  },
  getters: {
    taskNumNot(state) {
      let len = 0
      state.taskList.forEach(item => {
        if (item.taskViewTimes === 0) {
          len++
        }
      })
      return len
    }
  }
}

export default node
