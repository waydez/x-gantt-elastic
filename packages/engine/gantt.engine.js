import { EventBus as eventBus } from '@packages/vendor/index.js'
import BasicEngine from './engine'
export default class GanttEngine extends BasicEngine {
  constructor() {
    super()
    this.eventBus = eventBus
    this.globalData = {}
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
}
