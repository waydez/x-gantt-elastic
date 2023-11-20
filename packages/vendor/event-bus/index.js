import mitt from 'mitt'

class EventBus {
  constructor() {
    this.keys = {}
    this.emitter = mitt()
  }

  emit(key, ...args) {
    this.keys[key.toUpperCase()] = key
    this.emitter.emit(key, ...args)
  }

  on(key, callback) {
    this.emitter.on(key, callback)
  }

  onInVue(key, callback, vm) {
    const callbackProxy = (...args) => {
      if (vm._inactive) return
      callback(...args)
    }
    this.emitter.on(key, callbackProxy)
    vm.$once('hook:beforeDestroy', () => {
      this.emitter.off(key, callbackProxy)
    })
  }

  off(key, callback) {
    this.emitter.off(key, callback)
  }
}

export default new EventBus()
