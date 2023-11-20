import Vue from 'vue'
import store from '../store'
import XRequestPlugin from '@x-ui/x-dcloud-ui/lib/x-request-plugin'

Vue.use(XRequestPlugin, {
  baseURL: process.env.VUE_APP_BASE_DOMAIN,
  timeout: 15000,
  headers: {
    'Accept-Language': 'zh-CN',
    xdaptenantid: process.env.VUE_APP_TENANT_ID
  },
  needShowMessage: true,
  businessErrorCatch: function (failRes, response, needShowMessage) {
    // 通用业务错误处理
    if (needShowMessage) {
      Vue.prototype.$message({
        message: failRes.message,
        type: failRes.code || 'error',
        durationTime: failRes.interval
      })
    }
  },
  errorCatch: function (e) {}
})

Vue.addInterceptorsRequest('REQUEST_PARAMS_INTERCEPTOR', (e) => {
  e.headers['xdaptimestamp'] = new Date().getTime()
  const authStore = store.state.authModule
  e.headers['xdaptoken'] = authStore.token || 'fake token'
  Vue.addHeaders({
    xdaptoken: authStore.token
  })

  return e
})
