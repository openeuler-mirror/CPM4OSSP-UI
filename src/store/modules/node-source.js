
const nodeSource = {
  state: {
    // 存放节点，检测源配置30秒后才能再次操作
    nodeCheckSetting: []
  },
  getters: {

  },
  mutations: {
    // 倒计时30秒
    SET_CHECK_SOURCE_INTERVAL(state, nodeId) {
      const obj = {
        nodeId,
        time: 30
      }
      obj.interval = setInterval(() => {
        obj.time--
        if (obj.time === 0 && obj.interval !== undefined) {
          clearInterval(obj.interval)
          const nodeIndex = state.nodeCheckSetting.findIndex(item => item.nodeId === nodeId)
          state.nodeCheckSetting.splice(nodeIndex, 1)
        }
      }, 1000)
      state.nodeCheckSetting.push(obj)
    }
  },
  actions: {

  }
}

export default nodeSource
