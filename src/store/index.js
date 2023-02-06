import Vuex from 'vuex'
import Vue from 'vue'
import user from './modules/user'
import app from './modules/app'
import node from './modules/node'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    app,
    node
  }
})

export default store