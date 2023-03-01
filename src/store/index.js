import Vuex from 'vuex'
import Vue from 'vue'
import user from './modules/user'
import app from './modules/app'
import node from './modules/node'
import nodePackage from './modules/node-package'


Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    app,
    node,
    nodePackage
  }
})

export default store