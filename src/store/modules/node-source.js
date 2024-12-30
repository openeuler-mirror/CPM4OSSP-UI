
const nodeSource = {
  state: {
    // 存放节点，检测源配置30秒后才能再次操作
    nodeCheckSetting: new Map()
  },
  getters: {

  },
  mutations: {
    SET_CHECK_SOURCE_INTERVAL(state, nodeId) {
      console.log(`Setting check source interval for node ${nodeId}`)
  
      if (state.nodeCheckSetting.has(nodeId)) {
        console.log(`Clearing existing interval for node ${nodeId}`)
        clearTimeout(state.nodeCheckSetting.get(nodeId).timeout)
        state.nodeCheckSetting.delete(nodeId)
      }
  
      const obj = {
        nodeId,
        time: 30
      }
  
      obj.timeout = setTimeout(() => {
        console.log(`Interval finished for node ${nodeId}`)
        state.nodeCheckSetting.delete(nodeId)
      }, 30000)
  
      state.nodeCheckSetting.set(nodeId, obj)
      console.log(`Interval set for node ${nodeId}`)
    }
  },
  actions: {

  }
}

export default nodeSource
