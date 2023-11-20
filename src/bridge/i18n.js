import VueI18n from 'vue-i18n'
import { messages } from '../../packages/locale'
import { getVue, registerI18n } from '../../packages/utils/vue.util'
// import ElementLocale from 'element-ui/lib/locale'

getVue().use(VueI18n)

const i18n = new VueI18n({
  // locale: 'en', // set locale
  locale: 'zh-CN', // set locale
  messages // set locale messages
})

registerI18n(i18n)
// ElementLocale.i18n((key, value) => i18n.t(key, value))

export default i18n
