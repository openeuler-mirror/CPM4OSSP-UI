const nodeSource = {
  state: {
    nodeCheckSetting: []
  },
  mutations: {
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
}

export default nodeSource
