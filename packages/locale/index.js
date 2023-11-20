import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import merge from 'lodash-es/merge'

import enLocaleApp from './lang/en'
import zhLocaleApp from './lang/zh-CN/index.js'
const messages = {
  en: merge(enLocale, enLocaleApp),
  'zh-CN': merge(zhLocale, zhLocaleApp)
}

export { messages }
