import dayjs from 'dayjs'
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

/**
 * Map tasks
 *
 * @param {Array} tasks
 * @param {Object} options
 */
export function mapTasks(tasks, options) {
  for (let [index, task] of tasks.entries()) {
    // todo
    tasks[index] = {
      ...task,
      id: task[options.taskMapping.id],
      label: task[options.taskMapping.label],
      // start: task[options.taskMapping.start],
      plannedStart: task[options.taskMapping.plannedStart],
      plannedEnd: task[options.taskMapping.plannedEnd],
      actualStart: task[options.taskMapping.actualStart],
      actualEnd: task[options.taskMapping.actualEnd],
      // plannedDuration:
      //   new Date(task[options.taskMapping.plannedEnd]).getTime() -
      //   new Date(task[options.taskMapping.plannedStart]).getTime(),
      progress: task[options.taskMapping.progress],
      type: task[options.taskMapping.type],
      style: task[options.taskMapping.style],
      collapsed: task[options.taskMapping.collapsed]
    }
  }
  return tasks
}

/**
 * Fill out empty task properties and make it reactive
 *
 * @param {array} tasks
 */
export function fillTasks(tasks) {
  for (let task of tasks) {
    if (typeof task.plannedX === 'undefined') {
      task.plannedX = 0
    }
    if (typeof task.actualX === 'undefined') {
      task.actualX = 0
    }
    if (typeof task.plannedY === 'undefined') {
      task.plannedY = 0
    }
    if (typeof task.actualY === 'undefined') {
      task.actualY = 0
    }
    if (typeof task.plannedWidth === 'undefined') {
      task.plannedWidth = 0
    }
    if (typeof task.actualWidth === 'undefined') {
      task.plannedWidth = 0
    }
    if (typeof task.height === 'undefined') {
      task.height = 0
    }
    if (typeof task.mouseOver === 'undefined') {
      task.mouseOver = false
    }
    if (typeof task.collapsed === 'undefined') {
      task.collapsed = false
    }
    if (typeof task.dependentOn === 'undefined') {
      task.dependentOn = []
    }
    if (typeof task.parentId === 'undefined') {
      task.parentId = null
    }
    if (typeof task.style === 'undefined') {
      task.style = {}
    }
    if (typeof task.children === 'undefined') {
      task.children = []
    }
    if (typeof task.allChildren === 'undefined') {
      task.allChildren = []
    }
    if (typeof task.parents === 'undefined') {
      task.parents = []
    }
    if (typeof task.parent === 'undefined') {
      task.parent = null
    }
    // 计划
    if (typeof task.plannedStartTime === 'undefined') {
      task.plannedStartTime = dayjs(task.plannedStart).valueOf()
    }
    if (
      typeof task.plannedEndTime === 'undefined' &&
      Object.prototype.hasOwnProperty.call(task, 'plannedEnd')
    ) {
      task.plannedEndTime = dayjs(task.plannedEnd).valueOf()
    } else if (
      typeof task.plannedEnd === 'undefined' &&
      Object.prototype.hasOwnProperty.call(task, 'plannedDuration')
    ) {
      task.plannedEndTime = task.plannedStartTime + task.plannedDuration
    }
    if (
      typeof task.plannedDuration === 'undefined' &&
      Object.prototype.hasOwnProperty.call(task, 'plannedEndTime')
    ) {
      task.plannedDuration = task.plannedEndTime - task.plannedStartTime
    }
    // 实际
    if (typeof task.actualStartTime === 'undefined') {
      task.actualStartTime = task.actualStart && dayjs(task.actualStart).valueOf()
    }
    if (
      typeof task.actualEndTime === 'undefined' &&
      Object.prototype.hasOwnProperty.call(task, 'actualEnd')
    ) {
      task.actualEndTime = task.actualEnd && dayjs(task.actualEnd).valueOf()
    } else if (
      typeof task.actualEnd === 'undefined' &&
      Object.prototype.hasOwnProperty.call(task, 'actualDuration')
    ) {
      task.actualEndTime = task.actualStartTime + task.actualDuration
    }
    if (
      typeof task.actualDuration === 'undefined' &&
      Object.prototype.hasOwnProperty.call(task, 'actualEndTime')
    ) {
      task.actualDuration = task.actualEndTime - task.actualStartTime
    }
  }
  return tasks
}

/**
 * Make task tree, after reset - look above
 *
 * @param {object} task
 * @returns {object} tasks with children and parents
 */
export function makeTaskTree(task, tasks) {
  for (let i = 0, len = tasks.length; i < len; i++) {
    let current = tasks[i]
    if (current.parentId === task.id) {
      if (task.parents.length) {
        task.parents.forEach((parent) => current.parents.push(parent))
      }
      if (!Object.prototype.propertyIsEnumerable.call(task, '__root')) {
        current.parents.push(task.id)
        current.parent = task.id
      } else {
        current.parents = []
        current.parent = null
      }
      current = makeTaskTree(current, tasks)
      task.allChildren.push(current.id)
      task.children.push(current.id)
      current.allChildren.forEach((childId) => task.allChildren.push(childId))
    }
  }
  return task
}
