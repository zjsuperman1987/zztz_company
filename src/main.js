import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'
import i18n from './lang' // internationalization
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/global.less' // global less
import '@/styles/element-ui.less' // global less
import mainMessage from '@/utils/resetMessage'
import request from '@/utils/request'
import filter from '@/filters/index'
import VueSocketIO from 'vue-socket.io'
import myFunctions from "@/utils/myFunctions"
import "@/directive/dialogDrag"
import "@/directive/v-viewer"
import "@/directive/v-copy"
import moment from "moment";
import notify from '@/utils/validate-notify'
import Axios from 'axios'
import Viewer from 'v-viewer'
import  'viewerjs/dist/viewer.css'

//引入字体图标
import './assets/iconfont/iconfont.css'
import './assets/iconfont/iconfont.js'
Vue.use(Viewer, {
    defaultOptions: {
        zIndex: 9999
    }
})
Vue.prototype.myNotify = notify
Vue.use(new VueSocketIO({
      connection: process.env.VUE_APP_SW_API,
      options: {
        reconnectionDelay: 60000,
        query: store.getters.token ? 'token=' + store.getters.token : ''
      }
    })
)

//组件注册
import pagination from "@/components/Pagination/index";
Vue.component('page-nation',pagination)

Vue.use(window.ELEMENT,{
  size: 'small',
  i18n: (key, value) => i18n.t(key, value)
})

Vue.config.productionTip = false
Object.defineProperty(Vue.prototype, '$moment', { value: moment })
Object.defineProperty(Vue.prototype, '$validateNotify', { value: notify })
Object.defineProperty(Vue.prototype, '$http', { value: request })
Object.defineProperty(Vue.prototype, '$message', { value: mainMessage })
Object.defineProperty(Vue.prototype, '$myFunctions', { value: myFunctions })

// 全局导入过滤器
Object.keys(filter).forEach(key => Vue.filter(key, filter[key]))

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
