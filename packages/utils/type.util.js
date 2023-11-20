const isType = function (type) {
  return function (obj) {
    return Object.prototype.toString.call(obj) === `[object ${type}]`
  }
}

const isString = isType('String')

const isArray = isType('Array')

const isObject = isType('Object')

const isFunction = isType('Function')

const isNumber = isType('Number')

const isPlainObject = function (obj) {
  let prototype
  return (
    isObject(obj) &&
    ((prototype = Object.getPrototypeOf(obj)),
    prototype === null || prototype === Object.getPrototypeOf({}))
  )
}

export default {
  isType,
  isString,
  isArray,
  isObject,
  isFunction,
  isNumber,
  isPlainObject
}
