let thisVue
let thisVuex
let thisRouter
let thisI18n

const registerVue = function (v) {
  thisVue = v
}

const registerVuex = function (vx) {
  thisVuex = vx
}

const getVue = function () {
  return thisVue
}

const getVuex = function () {
  return thisVuex
}

const registerRouter = function (router) {
  thisRouter = router
}

const getRouter = function () {
  return thisRouter
}

const registerI18n = function (i18n) {
  thisI18n = i18n
}

const getI18n = function () {
  return thisI18n
}

export {
  registerVue,
  getVue,
  registerVuex,
  getVuex,
  registerRouter,
  getRouter,
  registerI18n,
  getI18n
}
