<template>
  <div class="gantt-elastic" style="width: 100%">
    <template v-if="!!$slots.header">
      <slot name="header"></slot>
    </template>
    <template v-else>
      <!-- 时间维度 -->
      <tool-bar></tool-bar>
    </template>
    <main-view ref="mainView">
      <template v-for="column in getTaskListColumnsSilently" v-slot:[column.customSlot]="scopeSlot">
        <slot
          v-if="column.customSlot"
          :name="column.customSlot"
          :row="scopeSlot.row"
          :column="scopeSlot.column"
        />
      </template>
    </main-view>
    <slot name="footer"></slot>
  </div>
</template>

<script>
import ResizeObserver from 'resize-observer-polyfill'
import VueInstance from 'vue'
import dayjs from 'dayjs'
import { mergeDeep, mergeDeepReactive, notEqualDeep } from '@packages/helpers'
import { TOGGLE_HANDLER } from '@packages/constant/index'
import MainView from './Layout/MainView.vue'
import ToolBar from './Layout/ToolBar.vue'
import { GanttEngine } from '@packages/engine/index.js'
// import { getWeekdays } from '@packages/utils/date-time.util'
const _canvas = document.createElement('canvas')
const ctx = _canvas.getContext('2d')
let VueInst = VueInstance
let Vue = window.Vue
function initVue() {
  if (typeof Vue !== 'undefined' && typeof VueInst === 'undefined') {
    VueInst = Vue
  }
}
initVue()

/**
 * GanttElastic
 * Main vue component
 */
export default {
  name: 'GanttElastic',
  components: { MainView, ToolBar },
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => {}
    },
    dynamicStyle: {
      type: Object,
      default: () => {}
    }
  },
  provide() {
    const provider = {}
    const self = this
    Object.defineProperty(provider, 'root', {
      enumerable: true,
      get: () => self
    })
    Object.defineProperty(provider, 'ganttEngine', {
      enumerable: true,
      get: () => self.ganttEngine
    })
    return provider
  },
  data() {
    return {
      state: {
        tasks: [],
        options: {
          scrollBarHeight: 0,
          allVisibleTasksHeight: 0,
          outerHeight: 0,
          scroll: {
            left: 0,
            top: 0
          }
        },
        dynamicStyle: {},
        refs: {},
        tasksById: {},
        taskTree: {},
        ctx,
        emitTasksChanges: true, // some operations may pause emitting changes to parent component
        emitOptionsChanges: true, // some operations may pause emitting changes to parent component
        resizeObserver: null,
        unwatchTasks: null,
        unwatchOptions: null,
        unwatchStyle: null,
        unwatchOutputTasks: null,
        unwatchOutputOptions: null,
        unwatchOutputStyle: null
      },
      TOGGLE_HANDLER,
      _ganttEngine: null
    }
  },
  computed: {
    ganttEngine() {
      return this._ganttEngine
    },
    /**
     * Get visible tasks
     * Very important method which will bring us only those tasks that are visible inside gantt chart
     * For example when task is collapsed - children of this task are not visible - we should not render them
     */
    visibleTasks() {
      const visibleTasks = this.state.tasks.filter((task) => this.isTaskVisible(task))
      const maxRows = visibleTasks.slice(0, this.state.options.maxRows)
      this.state.options.rowsHeight = this.getTasksHeight(maxRows)
      let heightCompensation = 0
      if (
        this.state.options.maxHeight &&
        this.state.options.rowsHeight > this.state.options.maxHeight
      ) {
        heightCompensation = this.state.options.rowsHeight - this.state.options.maxHeight
        this.state.options.rowsHeight = this.state.options.maxHeight
      }
      this.state.options.height = this.getHeight(maxRows) - heightCompensation
      this.state.options.allVisibleTasksHeight = this.getTasksHeight(visibleTasks)
      this.state.options.outerHeight = this.getHeight(maxRows, true) - heightCompensation
      let len = visibleTasks.length
      for (let index = 0; index < len; index++) {
        let task = visibleTasks[index]
        task.plannedWidth =
          task.plannedDuration / this.state.options.times.timePerPixel -
          this.style['grid-line-vertical']['stroke-width']
        if (task.plannedWidth < 0) {
          task.plannedWidth = 0
        }
        task.actualWidth =
          task.actualDuration / this.state.options.times.timePerPixel -
          this.style['grid-line-vertical']['stroke-width']
        if (task.actualWidth < 0) {
          task.actualWidth = 0
        }
        task.height = this.state.options.row.height
        // 计划时间
        task.plannedX = this.timeToPixelOffsetX(task.plannedStartTime)
        task.plannedY =
          (this.state.options.row.height + this.state.options.chart.grid.horizontal.gap * 2) *
            index +
          this.state.options.chart.grid.horizontal.gap
        // 实际时间
        task.actualX = this.timeToPixelOffsetX(task.actualStartTime)
        task.actualY =
          (this.state.options.row.height + this.state.options.chart.grid.horizontal.gap * 2) *
            index +
          this.state.options.chart.grid.horizontal.gap
      }
      return visibleTasks
    },

    /**
     * Style shortcut
     */
    style() {
      return (this.ganttEngine && this.ganttEngine.dynamicStyle) || {}
    },

    /**
     * Get columns silently
     */
    getTaskListColumnsSilently() {
      return (
        (this.ganttEngine && this.ganttEngine.options.taskList.columns.filter((c) => c.display)) ||
        []
      )
    },

    /**
     * Get columns and compute dimensions on the fly
     */
    getTaskListColumns() {
      this.ganttEngine.calculateTaskListColumnsDimensions()
      return this.getTaskListColumnsSilently
    },

    /**
     * Tasks used for communicate with parent component
     */
    outputTasks() {
      return (this.ganttEngine && this.ganttEngine.tasks) || []
    },

    /**
     * Options used to communicate with parent component
     */
    outputOptions() {
      return (this.ganttEngine && this.ganttEngine.options) || {}
    },

    /**
     * Get current time line position
     *
     * @returns {object}
     */
    timeLinePosition() {
      const d = new Date()
      const current = d.getTime()
      const currentOffset = this.timeToPixelOffsetX(current)
      const timeLine = {
        x: 0,
        y1: 0,
        y2: '100%',
        dateTime: '',
        time: current
      }
      timeLine.x = currentOffset
      timeLine.dateTime = d.toLocaleDateString()
      return timeLine
    }
  },

  /**
   * Watch tasks after gantt instance is created and react when we have new kids on the block
   */
  created() {
    this.initEngine()
    if (!this.ganttEngine) throw Error('Gantt engine is not defined')
    this.initializeEvents()
    this.setup()
    this.state.unwatchTasks = this.$watch(
      'tasks',
      (tasks) => {
        const notEqual = notEqualDeep(tasks, this.outputTasks)
        if (notEqual) {
          this.setup('tasks')
        }
      },
      { deep: true }
    )
    this.state.unwatchOptions = this.$watch(
      'options',
      (opts) => {
        const notEqual = notEqualDeep(opts, this.outputOptions)
        if (notEqual) {
          this.setup('options')
        }
      },
      { deep: true }
    )
    this.state.unwatchStyle = this.$watch(
      'dynamicStyle',
      (style) => {
        const notEqual = notEqualDeep(style, this.dynamicStyle)
        if (notEqual) {
          this.initializeStyle()
        }
      },
      { deep: true, immediate: true }
    )

    this.state.unwatchOutputTasks = this.$watch(
      'outputTasks',
      (tasks) => {
        this.$emit(
          'tasks-changed',
          tasks.map((task) => task)
        )
      },
      { deep: true }
    )
    this.state.unwatchOutputOptions = this.$watch(
      'outputOptions',
      (options) => {
        this.$emit('options-changed', mergeDeep({}, options))
      },
      { deep: true }
    )
    this.state.unwatchOutputStyle = this.$watch(
      'style',
      (style) => {
        this.$emit('dynamic-style-changed', mergeDeep({}, style))
      },
      { deep: true }
    )

    this.$root.$emit('gantt-elastic-created', this)
    this.$emit('created', this)
  },

  /**
   * Emit before-mount event
   */
  beforeMount() {
    this.$emit('before-mount', this)
  },

  /**
   * Emit ready/mounted events and deliver this gantt instance to outside world when needed
   */
  mounted() {
    this.state.options.clientWidth = this.$el.clientWidth
    this.state.resizeObserver = new ResizeObserver((entries, observer) => {
      this.globalOnResize()
    })
    this.state.resizeObserver.observe(this.$el.parentNode)
    this.globalOnResize()
    this.$emit('ready', this)
    this.$root.$emit('gantt-elastic-mounted', this)
    this.$emit('mounted', this)
    this.$root.$emit('gantt-elastic-ready', this)
  },

  /**
   * Emit event when data was changed and before update (you can cleanup dom events here for example)
   */
  beforeUpdate() {
    this.$emit('before-update')
  },

  /**
   * Emit event when gantt-elastic view was updated
   */
  updated() {
    this.$nextTick(() => {
      this.$emit('updated')
    })
  },

  /**
   * Before destroy event - clean up
   */
  beforeDestroy() {
    this.$el.parentNode && this.state.resizeObserver.unobserve(this.$el.parentNode)
    this.state.unwatchTasks()
    this.state.unwatchOptions()
    this.state.unwatchStyle()
    this.state.unwatchOutputTasks()
    this.state.unwatchOutputOptions()
    this.state.unwatchOutputStyle()
    this.$emit('before-destroy')
  },

  /**
   * Emit event after gantt-elastic was destroyed
   */
  destroyed() {
    this.$emit('destroyed')
  },
  methods: {
    mergeDeep,
    mergeDeepReactive,

    /**
     * Initialize component
     */
    initialize(itsUpdate = '') {
      const options = this.ganttEngine.initOptions(this.options)
      dayjs.locale(options.locale, null, true)
      dayjs.locale(options.locale.name)
      // style
      this.initializeStyle()
      // tasks
      this.initTasksConfig()
      this.globalOnResize()
    },

    /**
     * Initialize style
     */
    initializeStyle() {
      this.ganttEngine.initDynamicStyle(this.dynamicStyle)
    },

    /**
     * Initialize tasks
     */
    initTasksConfig() {
      this.ganttEngine.initTasksConfig()
      const height = getScrollBarHeight()
      this.options.scrollBarHeight = height
      this.style['chart-scroll-container--vertical']['margin-left'] = `-${height}px`
      this.options.outerHeight = this.options.height + this.options.scrollBarHeight
    },

    /**
     * Get calendar rows outer height
     *
     * @returns {int}
     */
    getCalendarHeight() {
      return this.state.options.calendar.height + this.state.options.calendar.strokeWidth
    },

    /**
     * Get maximal level of nested task children
     *
     * @returns {int}
     */
    getMaximalLevel() {
      let maximalLevel = 0
      this.state.tasks.forEach((task) => {
        if (task.parents.length > maximalLevel) {
          maximalLevel = task.parents.length
        }
      })
      return maximalLevel - 1
    },

    /**
     * Get maximal expander width - to calculate straight task list text
     *
     * @returns {int}
     */
    getMaximalExpanderWidth() {
      return (
        this.getMaximalLevel() * this.state.options.taskList.expander.padding +
        this.state.options.taskList.expander.margin
      )
    },

    /**
     * Synchronize scrollTop property when row height is changed
     */
    syncScrollTop() {
      if (
        this.state.refs.taskListItems &&
        this.state.refs.chartGraph.scrollTop !== this.state.refs.taskListItems.scrollTop
      ) {
        this.state.options.scroll.top =
          this.state.refs.taskListItems.scrollTop =
          this.state.refs.chartScrollContainerVertical.scrollTop =
            this.state.refs.chartGraph.scrollTop
      }
    },

    /**
     * Get task by id
     *
     * @param {any} taskId
     * @returns {object|null} task
     */
    getTask(taskId) {
      if (typeof this.state.tasksById[taskId] !== 'undefined') {
        return this.state.tasksById[taskId]
      }
      return null
    },

    /**
     * Get children tasks for specified taskId
     *
     * @param {any} taskId
     * @returns {array} children
     */
    getChildren(taskId) {
      return this.state.tasks.filter((task) => task.parent === taskId)
    },

    /**
     * Is task visible
     *
     * @param {Number|String|Task} task
     */
    isTaskVisible(task) {
      if (typeof task === 'number' || typeof task === 'string') {
        task = this.getTask(task)
      }
      for (let i = 0, len = task.parents.length; i < len; i++) {
        if (this.getTask(task.parents[i]).collapsed) {
          return false
        }
      }
      return true
    },

    /**
     * Get svg
     *
     * @returns {string} html svg image of gantt
     */
    getSVG() {
      // todo
      return this.state.refs.mainView
    },

    /**
     * Get image
     *
     * @param {string} type image format
     * @returns {Promise} when resolved returns base64 image string of gantt
     */
    getImage(type = 'png') {
      return new Promise((resolve) => {
        const mainViewDom = this.getSVG()
        // this.$html2Image.toCanvas(mainViewDom).then((src) => {
        //   resolve(src.toDataURL('image/' + type))
        // })
        // 暂时使用 htm2canvas,性能更好，用时更少
        this.$htm2canvas(mainViewDom).then((src) => {
          resolve(src.toDataURL('image/' + type))
        })
      })
    },

    /**
     * Convert pixel offset inside chart to corresponding time offset in milliseconds
     *
     * @param {number} pixelOffsetX
     * @returns {int} milliseconds
     */
    pixelOffsetXToTime(pixelOffsetX) {
      let offset = pixelOffsetX + this.style['grid-line-vertical']['stroke-width'] / 2
      return offset * this.state.options.times.timePerPixel + this.state.options.times.firstTime
    },

    /**
     * Determine if element is inside current view port
     *
     * @param {number} x - element placement
     * @param {number} width - element width
     * @param {int} buffer - or threshold, if element is outside viewport but offset from view port is below this value return true
     * @returns {boolean}
     */
    isInsideViewPort(x, width, buffer = 5000) {
      return (
        (x + width + buffer >= this.state.options.scroll.chart.left &&
          x - buffer <= this.state.options.scroll.chart.right) ||
        (x - buffer <= this.state.options.scroll.chart.left &&
          x + width + buffer >= this.state.options.scroll.chart.right)
      )
    },

    /**
     * Chart scroll event handler
     *
     * @param {event} ev
     */
    onScrollChart(ev) {
      this._onScrollChart(
        this.state.refs.chartScrollContainerHorizontal.scrollLeft,
        this.state.refs.chartScrollContainerVertical.scrollTop
      )
    },

    /**
     * After same as above but with different arguments - normalized
     *
     * @param {number} left
     * @param {number} top
     */
    _onScrollChart(left, top) {
      if (
        this.state.options.scroll.chart.left === left &&
        this.state.options.scroll.chart.top === top
      ) {
        return
      }
      const chartContainerWidth = this.state.refs.chartContainer.clientWidth
      this.state.options.scroll.chart.left = left
      this.state.options.scroll.chart.right = left + chartContainerWidth
      this.state.options.scroll.chart.percent =
        (left / this.state.options.times.totalViewDurationPx) * 100
      this.state.options.scroll.chart.top = top
      this.state.options.scroll.chart.time = this.pixelOffsetXToTime(left)
      this.state.options.scroll.chart.timeCenter = this.pixelOffsetXToTime(
        left + chartContainerWidth / 2
      )
      this.state.options.scroll.chart.dateTime.left = dayjs(
        this.state.options.scroll.chart.time
      ).valueOf()
      this.state.options.scroll.chart.dateTime.right = dayjs(
        this.pixelOffsetXToTime(left + this.state.refs.chart.clientWidth)
      ).valueOf()
      this.scrollTo(left, top)
    },

    /**
     * Scroll current chart to specified time (in milliseconds)
     *
     * @param {int} time
     */
    scrollToTime(time) {
      let pos = this.timeToPixelOffsetX(time)
      const chartContainerWidth = this.state.refs.chartContainer.clientWidth
      pos = pos - chartContainerWidth / 2
      if (pos > this.state.options.width) {
        pos = this.state.options.width - chartContainerWidth
      }
      this.scrollTo(pos)
    },

    /**
     * Scroll chart or task list to specified pixel values
     *
     * @param {number|null} left
     * @param {number|null} top
     */
    scrollTo(left = null, top = null) {
      if (left !== null) {
        this.state.refs.chartCalendarContainer.scrollLeft = left
        this.state.refs.chartGraphContainer.scrollLeft = left
        this.state.refs.chartScrollContainerHorizontal.scrollLeft = left
        this.state.options.scroll.left = left
      }
      if (top !== null) {
        this.state.refs.chartScrollContainerVertical.scrollTop = top
        this.state.refs.chartGraph.scrollTop = top
        this.state.refs.taskListItems.scrollTop = top
        this.state.options.scroll.top = top
        this.syncScrollTop()
      }
    },

    /**
     * After some actions like time zoom change we need to recompensate scroll position
     * so as a result everything will be in same place
     */
    fixScrollPos() {
      // 滚动到当前时间范围的中间
      // this.scrollToTime(this.state.options.scroll.chart.timeCenter)
      // 跳转到当前时间线位置
      this.$nextTick(() => {
        this.scrollToTime(this.timeLinePosition.time)
      })
    },

    /**
     * Mouse wheel event handler
     */
    onWheelChart(ev) {
      if (!ev.shiftKey && ev.deltaX === 0) {
        let top = this.state.options.scroll.top + ev.deltaY
        const chartClientHeight = this.state.options.rowsHeight
        const scrollHeight = this.state.refs.chartGraph.scrollHeight - chartClientHeight
        if (top < 0) {
          top = 0
        } else if (top > scrollHeight) {
          top = scrollHeight
        }
        this.scrollTo(null, top)
      } else if (ev.shiftKey && ev.deltaX === 0) {
        let left = this.state.options.scroll.left + ev.deltaY
        const chartClientWidth = this.state.refs.chartScrollContainerHorizontal.clientWidth
        const scrollWidth =
          this.state.refs.chartScrollContainerHorizontal.scrollWidth - chartClientWidth
        if (left < 0) {
          left = 0
        } else if (left > scrollWidth) {
          left = scrollWidth
        }
        this.scrollTo(left)
      } else {
        let left = this.state.options.scroll.left + ev.deltaX
        const chartClientWidth = this.state.refs.chartScrollContainerHorizontal.clientWidth
        const scrollWidth =
          this.state.refs.chartScrollContainerHorizontal.scrollWidth - chartClientWidth
        if (left < 0) {
          left = 0
        } else if (left > scrollWidth) {
          left = scrollWidth
        }
        this.scrollTo(left)
      }
    },

    /**
     * Time zoom change event handler
     */
    onTimeZoomChange(timeZoom) {
      this.state.options.times.timeZoom = timeZoom
      this.recalculateTimes()
      this.calculateSteps()
      this.fixScrollPos()
    },

    /**
     * Row height change event handler
     */
    onRowHeightChange(height) {
      this.options.row.height = height
      this.ganttEngine.calculateTaskListColumnsDimensions()
      this.syncScrollTop()
    },

    /**
     * Scope change event handler
     */
    onScopeChange(value) {
      this.state.options.scope.before = value
      this.state.options.scope.after = value
      this.initTimes()
      this.calculateSteps()
      this.computeCalendarWidths()
      this.fixScrollPos()
    },

    /**
     * Task list width change event handler
     */
    onTaskListWidthChange(value) {
      this.options.taskList.percent = value
      this.ganttEngine.calculateTaskListColumnsDimensions()
      this.fixScrollPos()
    },

    /**
     * Task list column width change event handler
     */
    onTaskListColumnWidthChange() {
      this.ganttEngine.calculateTaskListColumnsDimensions()
      this.fixScrollPos()
    },

    /**
     * Task list display change event handler
     */
    onTaskListDisplayToggle(value) {
      if (typeof value === 'undefined') {
        this.state.options.taskList.display = !this.state.options.taskList.display
      } else {
        this.state.options.taskList.display = !!value
      }
    },

    /**
     * Chart position recenter event handler
     */
    onChartPositionRecenter() {
      this.fixScrollPos()
    },

    /**
     * Download chart with picture event handler
     */
    onChartDownloadWithPic({ name = 'timeline.jpg', type = 'jpeg' } = {}) {
      console.time('download chart with picture')
      this.getImage(type).then((image) => {
        const elem = document.createElement('a')
        elem.href = image
        elem.download = name
        elem.click()
        console.timeEnd('download chart with picture')
      })
    },

    /**
     * TaskList Row click event handler
     */
    onTaskListRowClick(data) {
      console.log('onTaskListRowClick', data)
      this.$emit('task-row-click', data)
    },

    /**
     * Chart row click event handler
     */
    onChartBlockRowClick(data) {
      this.$emit('chart-row-click', data)
    },

    /**
     * init gantt engine
     */
    initEngine() {
      this._ganttEngine = new GanttEngine()
      return this._ganttEngine
    },

    /**
     * Listen to specified event names
     */
    initializeEvents() {
      const eventConfig = [
        { name: 'chart-scroll-horizontal', evt: this.onScrollChart },
        { name: 'chart-scroll-vertical', evt: this.onScrollChart },
        { name: 'chart-wheel', evt: this.onWheelChart },
        { name: 'times-timeZoom-change', evt: this.onTimeZoomChange },
        { name: 'row-height-change', evt: this.onRowHeightChange },
        { name: 'scope-change', evt: this.onScopeChange },
        { name: 'taskList-width-change', evt: this.onTaskListWidthChange },
        { name: 'taskList-column-width-change', evt: this.onTaskListColumnWidthChange },
        { name: 'taskList-display-toggle', evt: this.onTaskListDisplayToggle },
        { name: 'chart-position-recenter', evt: this.onChartPositionRecenter },
        { name: 'chart-download-with-pic', evt: this.onChartDownloadWithPic },
        { name: 'taskList-row-click', evt: this.onTaskListRowClick },
        { name: 'chartBlock-row-click', evt: this.onChartBlockRowClick }
      ]
      this.ganttEngine.initializeEvents(eventConfig, this)
    },

    /**
     * When some action was performed (scale change for example) - recalculate time variables
     */
    recalculateTimes() {
      let max = this.state.options.times.timeScale * 60
      let min = this.state.options.times.timeScale
      let steps = max / min
      let percent = this.state.options.times.timeZoom / 100
      this.state.options.times.timePerPixel =
        this.state.options.times.timeScale * steps * percent +
        Math.pow(2, this.state.options.times.timeZoom)
      this.state.options.times.totalViewDurationMs = dayjs(this.state.options.times.lastTime).diff(
        this.state.options.times.firstTime,
        'milliseconds'
      )
      // const offset =
      //   (this.state.options.calendar.onlyDisplayWorkDay &&
      //     getWeekdays(this.state.options.times.firstTime, this.state.options.times.lastTime)) ||
      //   0
      // this.state.options.times.totalViewDurationMs =
      //   dayjs(this.state.options.times.lastTime).diff(
      //     this.state.options.times.firstTime,
      //     'milliseconds'
      //   ) -
      //   offset * 24 * 60 * 60 * 1000
      this.state.options.times.totalViewDurationPx =
        this.state.options.times.totalViewDurationMs / this.state.options.times.timePerPixel
      this.state.options.width =
        this.state.options.times.totalViewDurationPx +
        this.style['grid-line-vertical']['stroke-width']
    },

    /**
     * Initialize time variables
     */
    initTimes() {
      // todo 是否需要根据任务的开始时间和结束时间来限制甘特图展示的开始时间和结束时间
      // this.state.options.times.firstTime = dayjs(this.state.options.times.firstTaskTime)
      //   .locale(this.state.options.locale.name)
      //   .startOf('day')
      //   .subtract(this.state.options.scope.before, 'days')
      //   .startOf('day')
      //   .valueOf()
      // this.state.options.times.lastTime = dayjs(this.state.options.times.lastTaskTime)
      //   .locale(this.state.options.locale.name)
      //   .endOf('day')
      //   .add(this.state.options.scope.after, 'days')
      //   .endOf('day')
      //   .valueOf()
      this.recalculateTimes()
    },

    /**
     * Calculate steps
     * Steps are days by default
     * Each step contain information about time offset and pixel offset of this time inside gantt chart
     */
    calculateSteps() {
      const steps = []
      const lastMs = dayjs(this.state.options.times.lastTime).valueOf()
      const currentDate = dayjs(this.state.options.times.firstTime)
      steps.push({
        time: currentDate.valueOf(),
        offset: {
          ms: 0,
          px: 0
        }
      })
      for (
        let currentDate = dayjs(this.state.options.times.firstTime)
            .add(1, this.state.options.times.stepDuration)
            .startOf('day'),
          dayOffset = 0;
        currentDate.valueOf() <= lastMs;
        currentDate = currentDate.add(1, this.state.options.times.stepDuration).startOf('day')
      ) {
        // todo 区分工作日
        // const day = currentDate.day()
        // if (this.state.options.calendar.onlyDisplayWorkDay && (day === 0 || day === 6)) {
        //   dayOffset += 24 * 60 * 60 * 1000
        //   continue
        // }
        const offsetMs =
          currentDate.diff(this.state.options.times.firstTime, 'milliseconds') - dayOffset
        const offsetPx = offsetMs / this.state.options.times.timePerPixel
        const step = {
          time: currentDate.valueOf(),
          offset: {
            ms: offsetMs,
            px: offsetPx
          }
        }
        const previousStep = steps[steps.length - 1]
        previousStep.width = {
          ms: offsetMs - previousStep.offset.ms,
          px: offsetPx - previousStep.offset.px
        }
        steps.push(step)
      }
      const lastStep = steps[steps.length - 1]
      lastStep.width = {
        ms: this.state.options.times.totalViewDurationMs - lastStep.offset.ms,
        px: this.state.options.times.totalViewDurationPx - lastStep.offset.px
      }
      this.state.options.times.steps = steps
    },

    /**
     * Calculate calendar widths - when scale was changed for example
     */
    computeCalendarWidths() {
      this.computeDayWidths()
      this.computeHourWidths()
      this.computeMonthWidths()
    },

    /**
     * Compute width of calendar hours column widths basing on text widths
     */
    computeHourWidths() {
      const style = { ...this.style['calendar-row-text'], ...this.style['calendar-row-text--hour'] }
      this.state.ctx.font = style['font-size'] + ' ' + style['font-family']
      const localeName = this.state.options.locale.name
      let currentDate = dayjs('2018-01-01T00:00:00').locale(localeName) // any date will be good for hours
      let maxWidths = this.state.options.calendar.hour.maxWidths
      if (maxWidths.length) {
        return
      }
      for (let formatName in this.state.options.calendar.hour.format) {
        maxWidths[formatName] = 0
      }
      for (let hour = 0; hour < 24; hour++) {
        let widths = { hour }
        for (let formatName in this.state.options.calendar.hour.format) {
          const hourFormatted = this.state.options.calendar.hour.format[formatName](currentDate)
          this.state.options.calendar.hour.formatted[formatName].push(hourFormatted)
          widths[formatName] = this.state.ctx.measureText(hourFormatted).width
        }
        this.state.options.calendar.hour.widths.push(widths)
        for (let formatName in this.state.options.calendar.hour.format) {
          if (widths[formatName] > maxWidths[formatName]) {
            maxWidths[formatName] = widths[formatName]
          }
        }
        currentDate = currentDate.add(1, 'hour')
      }
    },

    /**
     * Compute calendar days column widths basing on text widths
     */
    computeDayWidths() {
      const style = { ...this.style['calendar-row-text'], ...this.style['calendar-row-text--day'] }
      this.state.ctx.font = style['font-size'] + ' ' + style['font-family']
      const localeName = this.state.options.locale.name
      let currentDate = dayjs(this.state.options.times.steps[0].time).locale(localeName)
      let maxWidths = this.state.options.calendar.day.maxWidths
      this.state.options.calendar.day.widths = []
      Object.keys(this.state.options.calendar.day.format).forEach((formatName) => {
        maxWidths[formatName] = 0
      })
      for (let day = 0, daysLen = this.state.options.times.steps.length; day < daysLen; day++) {
        const widths = {
          day
        }
        Object.keys(this.state.options.calendar.day.format).forEach((formatName) => {
          widths[formatName] = this.state.ctx.measureText(
            this.state.options.calendar.day.format[formatName](currentDate)
          ).width
        })
        this.state.options.calendar.day.widths.push(widths)
        Object.keys(this.state.options.calendar.day.format).forEach((formatName) => {
          if (widths[formatName] > maxWidths[formatName]) {
            maxWidths[formatName] = widths[formatName]
          }
        })
        currentDate = currentDate.add(1, 'day')
      }
    },

    /**
     * Months count
     *
     * @description Returns number of different months in specified time range
     *
     * @param {number} fromTime - date in ms
     * @param {number} toTime - date in ms
     *
     * @returns {number} different months count
     */
    monthsCount(fromTime, toTime) {
      if (fromTime > toTime) {
        return 0
      }
      let currentMonth = dayjs(fromTime)
      let previousMonth = currentMonth.clone()
      let monthsCount = 1
      while (currentMonth.valueOf() <= toTime) {
        currentMonth = currentMonth.add(1, 'day')
        if (previousMonth.month() !== currentMonth.month()) {
          monthsCount++
        }
        previousMonth = currentMonth.clone()
      }
      return monthsCount
    },

    /**
     * Compute month calendar columns widths basing on text widths
     */
    computeMonthWidths() {
      const style = {
        ...this.style['calendar-row-text'],
        ...this.style['calendar-row-text--month']
      }
      this.state.ctx.font = style['font-size'] + ' ' + style['font-family']
      let maxWidths = this.state.options.calendar.month.maxWidths
      this.state.options.calendar.month.widths = []
      Object.keys(this.state.options.calendar.month.format).forEach((formatName) => {
        maxWidths[formatName] = 0
      })
      const localeName = this.state.options.locale.name
      let currentDate = dayjs(this.state.options.times.firstTime).locale(localeName)
      const monthsCount = this.monthsCount(
        this.state.options.times.firstTime,
        this.state.options.times.lastTime
      )
      for (let month = 0; month < monthsCount; month++) {
        const widths = {
          month
        }
        Object.keys(this.state.options.calendar.month.format).forEach((formatName) => {
          widths[formatName] = this.state.ctx.measureText(
            this.state.options.calendar.month.format[formatName](currentDate)
          ).width
        })
        this.state.options.calendar.month.widths.push(widths)
        Object.keys(this.state.options.calendar.month.format).forEach((formatName) => {
          if (widths[formatName] > maxWidths[formatName]) {
            maxWidths[formatName] = widths[formatName]
          }
        })
        currentDate = currentDate.add(1, 'month')
      }
    },

    /**
     * Prepare time and date variables for gantt
     */
    prepareDates() {
      //  todo
      let firstTaskTime = Number.MAX_SAFE_INTEGER
      let lastTaskTime = 0
      for (let index = 0, len = this.state.tasks.length; index < len; index++) {
        let task = this.state.tasks[index]
        if (task.plannedStartTime < firstTaskTime) {
          firstTaskTime = task.plannedStartTime
        }
        if (task.plannedStartTime + task.plannedDuration > lastTaskTime) {
          lastTaskTime = task.plannedStartTime + task.plannedDuration
        }
      }
      this.state.options.times.firstTaskTime = firstTaskTime
      this.state.options.times.lastTaskTime = lastTaskTime
      // todo
      // this.state.options.times.firstTime = dayjs(firstTaskTime)
      //   .locale(this.state.options.locale.name)
      //   .startOf('day')
      //   .subtract(this.state.options.scope.before, 'days')
      //   .startOf('day')
      //   .valueOf();
      // this.state.options.times.lastTime = dayjs(lastTaskTime)
      //   .locale(this.state.options.locale.name)
      //   .endOf('day')
      //   .add(this.state.options.scope.after, 'days')
      //   .endOf('day')
      //   .valueOf();
    },

    /**
     * Setup and calculate everything
     */
    setup(itsUpdate = '') {
      this.initialize(itsUpdate)
      this.prepareDates()
      this.initTimes()
      this.calculateSteps()
      this.computeCalendarWidths()
      this.options.taskList.width = this.options.taskList.columns.reduce(
        (prev, current) => {
          return { width: prev.width + current.width }
        },
        { width: 0 }
      ).width
    },

    /**
     * Global resize event (from window.addEventListener)
     */
    globalOnResize() {
      if (typeof this.$el === 'undefined' || !this.$el) {
        return
      }
      this.options.clientWidth = this.$el.clientWidth
      if (
        this.options.taskList.widthFromPercentage >
        (this.options.clientWidth / 100) * this.options.taskList.widthThreshold
      ) {
        const diff =
          this.options.taskList.widthFromPercentage -
          (this.options.clientWidth / 100) * this.options.taskList.widthThreshold
        let diffPercent = 100 - (diff / this.options.taskList.widthFromPercentage) * 100
        if (diffPercent < 0) {
          diffPercent = 0
        }
        this.options.taskList.columns.forEach((column) => {
          column.thresholdPercent = diffPercent
        })
      } else {
        this.options.taskList.columns.forEach((column) => {
          column.thresholdPercent = 100
        })
      }
      this.ganttEngine.calculateTaskListColumnsDimensions()
      this.$emit('calendar-recalculate')
      this.syncScrollTop()
    },

    /**
     * 全局收起/展开方法
     */
    toggleCollapsed(target, collapsed) {
      target.forEach((t) => {
        const found = this.state.tasks.find((v) => v.id === t.id)
        if (found) found.collapsed = collapsed
      })
    }
  }
}
</script>

<style>
[class^='gantt-elastic'],
[class*=' gantt-elastic'] {
  box-sizing: border-box;
}
.gantt-elastic__main-view svg {
  display: block;
}
.gantt-elastic__grid-horizontal-line,
.gantt-elastic__grid-vertical-line {
  stroke: #a0a0a0;
  stroke-width: 1;
}
foreignObject > * {
  margin: 0px;
}
.gantt-elastic .p-2 {
  padding: 10rem;
}
.gantt-elastic__main-view-main-container,
.gantt-elastic__main-view-container {
  overflow: hidden;
  max-width: 100%;
}
.gantt-elastic__main-view-container {
  position: relative;
}
.gantt-elastic__task-list-header-column:last-of-type {
  border-right: 1px solid #00000050;
}
.gantt-elastic__task-list-item:last-of-type {
  border-bottom: 1px solid #00000050;
}
.gantt-elastic__task-list-item-value-wrapper:hover {
  overflow: visible !important;
}
.gantt-elastic__task-list-item-value-wrapper:hover
  > .gantt-elastic__task-list-item-value-container {
  position: relative;
  overflow: visible !important;
}
.gantt-elastic__task-list-item-value-wrapper:hover > .gantt-elastic__task-list-item-value {
  position: absolute;
}
</style>
