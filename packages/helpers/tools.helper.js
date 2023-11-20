import getStyle from './style.helper.js'

/**
 * Helper function to determine if specified variable is an object
 *
 * @param {any} item
 *
 * @returns {boolean}
 */
export function isObject(item) {
  return (
    item &&
    typeof item === 'object' &&
    !Array.isArray(item) &&
    !(item instanceof HTMLElement) &&
    !(item instanceof CanvasRenderingContext2D) &&
    typeof item !== 'function'
  )
}

/**
 * Detect if object or array is observable
 *
 * @param {object|array} obj
 *
 * @returns {boolean}
 */
export function isObservable(obj) {
  return typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, '__ob__')
}

/**
 * Prepare style
 *
 * @returns {object}
 */
export function prepareStyle(userStyle) {
  let fontSize = '12px'
  let fontFamily = 'Roboto, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif' //window.getComputedStyle(document.body).getPropertyValue('font-family').toString()
  if (typeof userStyle !== 'undefined') {
    if (typeof userStyle.fontSize !== 'undefined') {
      fontSize = userStyle.fontSize
    }
    if (typeof userStyle.fontFamily !== 'undefined') {
      fontFamily = userStyle.fontFamily
    }
  }
  return getStyle(fontSize, fontFamily)
}

/**
 * Helper function which will merge objects recursively - creating brand new one - like clone
 *
 * @param {object} target
 * @params {object} sources
 *
 * @returns {object}
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) {
    return target
  }
  const source = sources.shift()
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (typeof target[key] === 'undefined') {
          target[key] = {}
        }
        target[key] = mergeDeep(target[key], source[key])
      } else if (Array.isArray(source[key])) {
        target[key] = []
        for (let item of source[key]) {
          if (isObject(item)) {
            target[key].push(mergeDeep({}, item))
            continue
          }
          target[key].push(item)
        }
      } else {
        target[key] = source[key]
      }
    }
  }
  return mergeDeep(target, ...sources)
}

/**
 * Same as above but with reactivity in mind
 *
 * @param {object} target
 * @params {object} sources
 *
 * @returns {object}
 */
export function mergeDeepReactive(component, target, ...sources) {
  if (!sources.length) {
    return target
  }
  const source = sources.shift()
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (typeof target[key] === 'undefined') {
          component.$set(target, key, {})
        }
        mergeDeepReactive(component, target[key], source[key])
      } else if (Array.isArray(source[key])) {
        component.$set(target, key, source[key])
      } else if (typeof source[key] === 'function') {
        if (source[key].toString().indexOf('[native code]') === -1) {
          target[key] = source[key]
        }
      } else {
        component.$set(target, key, source[key])
      }
    }
  }
  return mergeDeepReactive(component, target, ...sources)
}

/**
 * Check if objects or arrays are equal by comparing nested values
 *
 * @param {object|array} left
 * @param {object|array} right
 *
 * @returns {boolean}
 */
export function notEqualDeep(left, right, cache = [], path = '') {
  if (typeof right !== typeof left) {
    return { left, right, what: path + '.typeof' }
  } else if (Array.isArray(left) && !Array.isArray(right)) {
    return { left, right, what: path + '.isArray' }
  } else if (Array.isArray(right) && !Array.isArray(left)) {
    return { left, right, what: path + '.isArray' }
  } else if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return { left, right, what: path + '.length' }
    }
    let what
    for (let index = 0, len = left.length; index < len; index++) {
      if ((what = notEqualDeep(left[index], right[index], cache, path + '.' + index))) {
        return what
      }
    }
  } else if (isObject(left) && !isObject(right)) {
    return { left, right, what: path + '.isObject' }
  } else if (isObject(right) && !isObject(left)) {
    return { left, right, what: path + '.isObject' }
  } else if (isObject(left) && isObject(right)) {
    for (let key in left) {
      if (
        !Object.prototype.hasOwnProperty.call(left, key) ||
        !Object.prototype.propertyIsEnumerable.call(left, key)
      ) {
        continue
      }
      if (!Object.prototype.hasOwnProperty.call(right, key)) {
        return { left, right, what: path + '.' + key }
      }
      let what
      if ((what = notEqualDeep(left[key], right[key], cache, path + '.' + key))) {
        return what
      }
    }
  } else if (left !== right) {
    return { left, right, what: path + '. !==' }
  }
  return false
}
