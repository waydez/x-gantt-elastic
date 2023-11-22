import { EventBus as eventBus } from '@packages/vendor'
import {
  mergeDeep,
  getOptions,
  prepareStyle,
  mapTasks,
  fillTasks,
  makeTaskTree
} from '@packages/helpers'
import BasicEngine from './engine'

export default class GanttEngine extends BasicEngine {
  constructor() {
    super()
    this.eventBus = eventBus
    this.globalData = {}
    // ====
    this.refs = {}
    this.tasksById = {}
    this.taskTree = {}
    this.ctx = {}
    this.emitTasksChanges = true // some operations may pause emitting changes to parent component
    this.emitOptionsChanges = true // some operations may pause emitting changes to parent component
    this.resizeObserver = null
    this.unwatchTasks = null
    this.unwatchOptions = null
    this.unwatchStyle = null
    this.unwatchOutputTasks = null
    this.unwatchOutputOptions = null
    this.unwatchOutputStyle = null
  }

  setGlobalData(key, data) {
    this.globalData[key] = data
  }
  getGlobalData(key) {
    return this.globalData[key]
  }

  initTasksConfig(_tasks, options, vm) {
    let tasks = mapTasks(_tasks, options)
    tasks = fillTasks(tasks)
    this.tasksById = this.resetTaskTree(tasks, vm)
    this.taskTree = makeTaskTree(this.rootTask, tasks)
    this.setTasks(this.taskTree.allChildren.map((childId) => this.getTask(childId)))
    this.calculateTaskListColumnsDimensions()
  }

  /**
   * Reset task tree - which is used to create tree like structure inside task list
   */
  resetTaskTree(tasks, vm) {
    if (vm) {
      vm.$set(this, 'rootTask', {
        id: null,
        label: 'root',
        children: [],
        allChildren: [],
        parents: [],
        parent: null,
        __root: true
      })
    } else {
      Object.assign(this.rootTask, {
        id: null,
        label: 'root',
        children: [],
        allChildren: [],
        parents: [],
        parent: null,
        __root: true
      })
    }
    const tasksById = {}
    for (let i = 0, len = tasks.length; i < len; i++) {
      let current = tasks[i]
      current.children = []
      current.allChildren = []
      current.parent = null
      current.parents = []
      tasksById[current.id] = current
    }
    return tasksById
  }

  /**
   * Calculate task list columns dimensions
   */
  calculateTaskListColumnsDimensions() {
    let final = 0
    let percentage = 0
    for (let column of this.options.taskList.columns) {
      if (column.expander) {
        column.widthFromPercentage =
          ((this.getMaximalExpanderWidth() + column.width) / 100) * this.options.taskList.percent
      } else {
        column.widthFromPercentage = (column.width / 100) * this.options.taskList.percent
      }
      percentage += column.widthFromPercentage
      column.finalWidth = (column.thresholdPercent * column.widthFromPercentage) / 100
      final += column.finalWidth
      column.height = this.getTaskHeight() - this.style['grid-line-horizontal']['stroke-width']
    }
    this.options.taskList.widthFromPercentage = percentage
    this.options.taskList.finalWidth = final
  }
  /**
   * Get one task height
   *
   * @returns {number}
   */
  getTaskHeight(withStroke = false) {
    if (withStroke) {
      return (
        this.options.row.height +
        this.options.chart.grid.horizontal.gap * 2 +
        this.style['grid-line-horizontal']['stroke-width']
      )
    }
    return this.options.row.height + this.options.chart.grid.horizontal.gap * 2
  }
  /**
   * Get gantt total height
   *
   * @returns {number}
   */
  getHeight(visibleTasks, outer = false) {
    let height =
      visibleTasks.length * (this.options.row.height + this.options.chart.grid.horizontal.gap * 2) +
      this.options.calendar.height +
      this.options.calendar.strokeWidth +
      this.options.calendar.gap
    if (outer) {
      height += this.options.scrollBarHeight
    }
    return height
  }

  /**
   * Get specified tasks height
   *
   * @returns {number}
   */
  getTasksHeight(visibleTasks) {
    return visibleTasks.length * this.getTaskHeight()
  }

  /**
   * Convert time (in milliseconds) to pixel offset inside chart
   *
   * @param {int} ms
   * @returns {number}
   */
  timeToPixelOffsetX(ms) {
    let x = ms - this.options.times.firstTime
    if (x) x = x / this.options.times.timePerPixel

    return x
  }

  /**
   * Get task by id
   * @param {any} taskId
   * @returns {object|null} task
   */
  getTask(taskId) {
    if (typeof this.tasksById[taskId] === 'undefined') return null
    return this.tasksById[taskId]
  }

  /**
   * 初始化 options 配置
   * @param {Object} _options
   * @returns
   */
  initOptions(_options) {
    const selfConfigOptions = this.handleFormatOptions(_options)
    const options = mergeDeep(
      {},
      this.options,
      getOptions(selfConfigOptions.locale.localeName),
      selfConfigOptions
    )
    if (typeof options.taskList === 'undefined') options.taskList = {}
    options.taskList.columns = options.taskList.columns.map((column, index) => {
      column.thresholdPercent = 100
      column.widthFromPercentage = 0
      column.finalWidth = 0
      if (typeof column.height === 'undefined') column.height = 0
      if (typeof column.style === 'undefined') column.style = {}
      column._id = `${index}-${column.label}`
      return column
    })
    this.setOptions(options)
    return this.options
  }
  /**
   * 识别外部 options 配置，进行整合
   * @param {Object} options
   * @returns
   */
  handleFormatOptions(options) {
    const config = { taskList: {} }
    config.locale = options.locale
    config.taskMapping = options.taskMapping
    config.maxRows = options.maxRows
    config.maxHeight = options.maxHeight
    config.taskList.columns = options.columns
    return config
  }

  /**
   * 初始化 style 配置
   * @param {Object} dynamicStyle
   * @returns
   */
  initDynamicStyle(dynamicStyle) {
    if (Object.keys(this.dynamicStyle).length) return
    const style = mergeDeep({}, prepareStyle(dynamicStyle), dynamicStyle)
    this.setDynamicStyle(style)
  }

  /**
   * 初始化 event-bus 内的事件 events
   * @param {Array} events
   * @param {VueComponent} vm
   * @returns
   */
  initializeEvents(events, vm) {
    if (!events) return
    events.forEach((event) => this.eventBus.onInVue(event.name, event.evt, vm))
  }

  /**
   * Get calendar rows outer height
   *
   * @returns {int}
   */
  getCalendarHeight() {
    return this.options.calendar.height + this.options.calendar.strokeWidth
  }

  /**
   * Get maximal level of nested task children
   *
   * @returns {int}
   */
  getMaximalLevel() {
    let maximalLevel = 0
    this.tasks.forEach((task) => {
      if (task.parents.length > maximalLevel) {
        maximalLevel = task.parents.length
      }
    })
    return maximalLevel - 1
  }

  /**
   * Get maximal expander width - to calculate straight task list text
   *
   * @returns {int}
   */
  getMaximalExpanderWidth() {
    return (
      this.getMaximalLevel() * this.options.taskList.expander.padding +
      this.options.taskList.expander.margin
    )
  }
}
