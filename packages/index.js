import { GanttEngine } from './engine/index'
import { GanttElastic } from './components/index'

// import Mixin from './mixin/demo.mixin.js'
// locale
// import { messages as Locale } from './locale/index'
// other
// import PinyinUtil from './utils/pinyin.util'
// 引入element-ui
// import './vendor/element-ui'
// import EventBus from './vendor/event-bus'

const components = [GanttElastic]

const install = (Vue, opt) => {
  // check if installed
  if (install.installed) {
    return
  }
  components.forEach((item) => {
    Vue.component(item.name, item)
  })
}

const GanttElasticPlugin = { install }

// auto install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(GanttElasticPlugin)
}

export default GanttElasticPlugin

export { GanttEngine, GanttElastic }
