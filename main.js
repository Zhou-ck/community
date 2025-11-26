import Vue from 'vue'
import App from './App'
import store from './store' // store
import plugins from './plugins' // plugins
import './permission' // permission
import { getDicts } from "@/api/system/dict/data"
import uView from 'uview-ui'
//全局的分享功能
import share from '@/utils/share.js'
Vue.mixin(share)

Vue.use(plugins)
Vue.use(uView)

Vue.config.productionTip = false
Vue.prototype.$store = store
Vue.prototype.getDicts = getDicts

App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
