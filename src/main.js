import Vue from 'vue'
import App from './App.vue'
// * bridge 必须在此引入
import './bridge/init.js'
import router from './router'
import store from './store'
// import { GanttEngine } from '../packages/engine/index.js'
// 引入element-ui
import './vendor/element-ui'
// 引入scss变量
import './vendor/packages-scss'
import components from './vendor/package'
import '../packages/assets/scss/index.scss'
// 引入i18n
import { getI18n } from '../packages/utils/vue.util'
// 引入x-ui
import { XLoading } from '@x-ui/x-dcloud-ui'
import lodash from 'lodash'

Vue.prototype.$lodash = lodash
Vue.use(XLoading)

components.forEach((item) => {
  Vue.component(item.name, item)
})

Vue.config.productionTip = false

// GanttEngine.getInstance().setGlobalData('demo', { name: 'test' })

new Vue({
  i18n: getI18n(),
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
