<template>
  <div ref="mainView" class="gantt-elastic__main-view" :style="{ ...root.style['main-view'] }">
    <div
      class="gantt-elastic__main-container-wrapper"
      :style="{ ...root.style['main-container-wrapper'], height: root.state.options.height + 'px' }"
    >
      <div
        class="gantt-elastic__main-container"
        :style="{
          ...root.style['main-container'],
          width: root.state.options.clientWidth + 'px',
          height: root.state.options.height + 'px'
        }"
      >
        <div
          class="gantt-elastic__container"
          :style="{ ...root.style['container'], position: 'relative' }"
          @mousemove="mouseMove"
          @mouseup="mouseUp"
        >
          <div
            v-show="root.state.options.taskList.display"
            ref="taskList"
            class="gantt-elastic__task-list-container"
            :style="{
              ...root.style['task-list-container'],
              width: root.state.options.taskList.viewWidth + 'px',
              height: root.state.options.height + 'px',
              overflow: 'auto hidden',
              flex: `1 0 ${root.state.options.taskList.viewWidth}px`
            }"
          >
            <task-list :task-columns="root.getTaskListAllColumns">
              <template
                v-for="column in root.getTaskListAllColumns"
                v-slot:[column.customSlot]="scopeSlot"
              >
                <slot
                  v-if="column.customSlot"
                  :name="column.customSlot"
                  :row="scopeSlot.row"
                  :column="scopeSlot.column"
                />
              </template>
            </task-list>
          </div>
          <!-- <div class="scroll-bar">
            <div> 滚动条 </div>
          </div> -->
          <div
            v-if="root.state.options.taskList.display && root.getTaskListLeftFixedColumns.length"
            ref="taskListLeftFixed"
            class="gantt-elastic__task-list-container task-list-container__fixed"
            :style="{
              ...root.style['task-list-container'],
              width: calcLeftFixedWidth + 'px',
              height: root.state.options.height - 14 + 'px',
              overflow: 'hidden',
              flex: `1 0 ${root.state.options.taskList.viewWidth}px`,
              background: 'aliceblue',
              'box-shadow': 'none'
            }"
          >
            <task-list :task-columns="root.getTaskListLeftFixedColumns">
              <template
                v-for="column in root.getTaskListLeftFixedColumns"
                v-slot:[column.customSlot]="scopeSlot"
              >
                <slot
                  v-if="column.customSlot"
                  :name="column.customSlot"
                  :row="scopeSlot.row"
                  :column="scopeSlot.column"
                />
              </template>
            </task-list>
          </div>
          <div
            v-if="root.getTaskListRightFixedColumns.length"
            ref="taskListRightFixed"
            class="gantt-elastic__task-list-container task-list-container__right-fixed"
            :style="{
              ...root.style['task-list-container'],
              width: calcRightFixedWidth + 'px',
              height: root.state.options.height - 14 + 'px',
              overflow: 'hidden',
              flex: `1 0 ${root.state.options.taskList.viewWidth}px`,
              background: 'aliceblue',
              'box-shadow': 'none',
              right: `calc(100% - ${root.state.options.taskList.viewWidth}px)`
            }"
          >
            <task-list :task-columns="root.getTaskListRightFixedColumns">
              <template
                v-for="column in root.getTaskListRightFixedColumns"
                v-slot:[column.customSlot]="scopeSlot"
              >
                <slot
                  v-if="column.customSlot"
                  :name="column.customSlot"
                  :row="scopeSlot.row"
                  :column="scopeSlot.column"
                />
              </template>
            </task-list>
          </div>
          <div
            ref="chartContainer"
            class="gantt-elastic__main-view-container"
            :style="{ ...root.style['main-view-container'] }"
            @mousedown="chartMouseDown"
            @touchstart="chartMouseDown"
            @mouseup="chartMouseUp"
            @touchend="chartMouseUp"
            @mousemove.prevent="chartMouseMove"
            @touchmove.prevent="chartMouseMove"
            @wheel.prevent="chartWheel"
          >
            <chart></chart>
            <!-- 可以表格高度居中 root.state.options.rowsHeight / 2  -->
            <div
              class="gantt-elastic__toggle-handler"
              :style="{ top: `${0}px` }"
              @click="toggleTaskList"
            >
              <img
                :src="root.TOGGLE_HANDLER"
                class="toggle-handler-icon"
                :class="{ 'toggle-handler-icon-reverse': toggleDisplay }"
              />
            </div>
            <div class="gantt-elastic__scroll-handler-container" :style="getContainerStyle">
              <template v-for="item in root.visibleTasks">
                <div
                  v-show="!item.visible"
                  :key="item.id"
                  class="gantt-elastic__scroll-handler"
                  :style="{
                    top: `${item.plannedY + item.height / 2}px`,
                    ...calcStyle(item)
                  }"
                  @click="scrollToStart(item)"
                >
                  <!-- <span style="cursor: pointer">
                    {{ item.direction === 'left' ? '<==' : '==>' }}
                  </span> -->
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div
        ref="chartScrollContainerVertical"
        class="gantt-elastic__chart-scroll-container gantt-elastic__chart-scroll-container--vertical"
        :style="{
          ...root.style['chart-scroll-container'],
          ...root.style['chart-scroll-container--vertical'],
          ...verticalStyle
        }"
        @scroll="onVerticalScroll"
      >
        <div
          class="gantt-elastic__chart-scroll--vertical"
          :style="{ width: '1px', height: root.state.options.allVisibleTasksHeight + 'px' }"
        ></div>
      </div>
    </div>
    <div
      ref="chartScrollContainerHorizontal"
      class="gantt-elastic__chart-scroll-container gantt-elastic__chart-scroll-container--horizontal"
      :style="{
        ...root.style['chart-scroll-container'],
        ...root.style['chart-scroll-container--horizontal'],
        marginLeft: getMarginLeft
      }"
      @scroll="onHorizontalScroll"
    >
      <div
        class="gantt-elastic__chart-scroll--horizontal"
        :style="{ height: '1px', width: root.state.options.width + 'px' }"
      ></div>
    </div>
  </div>
</template>

<script>
import TaskList from '../TaskList/TaskList.vue'
import Chart from '../Chart/Chart.vue'

// let ignoreScrollEvents = false

export default {
  name: 'MainView',
  components: {
    TaskList,
    Chart
  },
  inject: ['root'],
  data() {
    return {
      defs: '',
      mousePos: {
        x: 0,
        y: 0,
        movementX: 0,
        movementY: 0,
        lastX: 0,
        lastY: 0,
        positiveX: 0,
        positiveY: 0,
        currentX: 0,
        currentY: 0
      }
    }
  },
  computed: {
    /**
     * To calculate left fixed width
     */
    calcLeftFixedWidth() {
      return this.root.getTaskListLeftFixedColumns.reduce((total, item) => {
        return total + item.finalWidth
      }, 0)
    },

    /**
     * To calculate right fixed width
     */
    calcRightFixedWidth() {
      return this.root.getTaskListRightFixedColumns.reduce((total, item) => {
        return total + item.finalWidth
      }, 0)
    },

    /**
     * Get margin left
     *
     * @returns {string}
     */
    getMarginLeft() {
      if (!this.root.state.options.taskList.display) {
        return '0px'
      }
      return this.root.state.options.taskList.viewWidth + 'px'
    },

    /**
     * Get vertical style
     *
     * @returns {object}
     */
    verticalStyle() {
      return {
        width: this.root.state.options.scrollBarHeight + 'px',
        height: this.root.state.options.rowsHeight + 'px',
        'margin-top':
          this.root.state.options.calendar.height + this.root.state.options.calendar.gap + 'px'
      }
    },

    /**
     * Get view box
     *
     * @returns {string}
     */
    getViewBox() {
      if (this.root.state.options.clientWidth) {
        return `0 0 ${
          this.root.state.options.clientWidth - this.root.state.options.scrollBarHeight
        } ${this.root.state.options.height}`
      }
      return `0 0 0 ${this.root.state.options.height}`
    },

    /**
     * calendar config of options
     */
    calendarRect() {
      return this.root.state.options.calendar
    },

    /**
     * toggle taskList display
     */
    toggleDisplay() {
      return this.root.state.options.taskList.display
    },

    /**
     *  Get container style
     */
    getContainerStyle() {
      const calendarRect = this.calendarRect
      return {
        transform: `translateY(-${this.root.state.options.scroll.chart.top}px)`,
        top: `${calendarRect.height + calendarRect.gap}px`
      }
    }
  },

  /**
   * Before destroy event - clean up
   */
  beforeDestroy() {
    document.removeEventListener('mouseup', this.chartMouseUp)
    document.removeEventListener('mousemove', this.chartMouseMove)
    document.removeEventListener('touchmove', this.chartMouseMove)
    document.removeEventListener('touchend', this.chartMouseUp)
  },
  /**
   * Mounted
   */
  mounted() {
    this.root.state.refs.mainView = this.$refs.mainView
    this.root.state.refs.chartContainer = this.$refs.chartContainer
    // this.root.state.refs.taskList = this.$refs.taskList
    this.root.state.refs.chartScrollContainerHorizontal = this.$refs.chartScrollContainerHorizontal
    this.root.state.refs.chartScrollContainerVertical = this.$refs.chartScrollContainerVertical
    document.addEventListener('mouseup', this.chartMouseUp.bind(this))
    document.addEventListener('mousemove', this.chartMouseMove.bind(this))
    document.addEventListener('touchmove', this.chartMouseMove.bind(this))
    document.addEventListener('touchend', this.chartMouseUp.bind(this))
  },
  methods: {
    /**
     * Emit event when mouse is moving inside main view
     */
    mouseMove(event) {
      this.root.$emit('main-view-mousemove', event)
    },

    /**
     * Emit mouseup event inside main view
     */
    mouseUp(event) {
      this.root.$emit('main-view-mouseup', event)
    },

    /**
     * Horizontal scroll event handler
     */
    onHorizontalScroll(ev) {
      this.root.$emit('chart-scroll-horizontal', ev)
    },

    /**
     * Vertical scroll event handler
     */
    onVerticalScroll(ev) {
      this.root.$emit('chart-scroll-vertical', ev)
    },

    /**
     * Mouse wheel event handler
     */
    chartWheel(ev) {
      this.root.$emit('chart-wheel', ev)
    },

    /**
     * Chart mousedown event handler
     * Initiates drag scrolling mode
     */
    chartMouseDown(ev) {
      if (typeof ev.touches !== 'undefined') {
        this.mousePos.x = this.mousePos.lastX = ev.touches[0].screenX
        this.mousePos.y = this.mousePos.lastY = ev.touches[0].screenY
        this.mousePos.movementX = 0
        this.mousePos.movementY = 0
        this.mousePos.currentX = this.$refs.chartScrollContainerHorizontal.scrollLeft
        this.mousePos.currentY = this.$refs.chartScrollContainerVertical.scrollTop
      }
      this.root.state.options.scroll.scrolling = true
    },

    /**
     * Chart mouseup event handler
     * Deactivates drag scrolling mode
     */
    chartMouseUp(ev) {
      this.root.state.options.scroll.scrolling = false
    },

    /**
     * Chart mousemove event handler
     * When in drag scrolling mode this method calculate scroll movement
     */
    chartMouseMove(ev) {
      if (this.root.state.options.scroll.scrolling) {
        ev.preventDefault()
        ev.stopImmediatePropagation()
        ev.stopPropagation()
        const touch = typeof ev.touches !== 'undefined'
        let movementX, movementY
        if (touch) {
          const screenX = ev.touches[0].screenX
          const screenY = ev.touches[0].screenY
          movementX = this.mousePos.x - screenX
          movementY = this.mousePos.y - screenY
          this.mousePos.lastX = screenX
          this.mousePos.lastY = screenY
        } else {
          movementX = ev.movementX
          movementY = ev.movementY
        }
        const horizontal = this.$refs.chartScrollContainerHorizontal
        const vertical = this.$refs.chartScrollContainerVertical
        let x = 0
        let y = 0
        if (touch) {
          x =
            this.mousePos.currentX + movementX * this.root.state.options.scroll.dragXMoveMultiplier
        } else {
          x = horizontal.scrollLeft - movementX * this.root.state.options.scroll.dragXMoveMultiplier
        }
        horizontal.scrollLeft = x
        if (touch) {
          y =
            this.mousePos.currentY + movementY * this.root.state.options.scroll.dragYMoveMultiplier
        } else {
          y = vertical.scrollTop - movementY * this.root.state.options.scroll.dragYMoveMultiplier
        }
        vertical.scrollTop = y
      }
    },

    /**
     * 显示隐藏任务列表
     */
    toggleTaskList() {
      this.root.$emit('taskList-display-toggle')
    },
    /**
     * Get the handler position: left or right
     */
    calcStyle(item) {
      if (item.direction === 'left') {
        return {
          left: `${0}px`
        }
      } else {
        return {
          right: `${this.root.state.options.scrollBarHeight}px`
        }
      }
    },
    scrollToStart(task) {
      this.root.scrollTo(task.plannedX)
    }
  }
}
</script>

<style lang="scss">
.gantt-elastic__main-view {
  .gantt-elastic__main-view-container {
    .gantt-elastic__toggle-handler {
      position: absolute;
      font-size: 12px;
      user-select: none;
      overflow: hidden;
      cursor: pointer;
      padding: 8px;
      color: #606060;
      background: rgba(255, 255, 255, 0.502);
      transition: box-shadow 250ms;
      box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
      border-bottom-right-radius: 9px;
      left: 0;
      top: 0;
      &:hover {
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.15);
        background: #fff;
      }
      .toggle-handler-icon {
        opacity: 0.5;
        &-reverse {
          transform: rotate(180deg);
        }
      }
    }
    .gantt-elastic__scroll-handler-container {
      position: relative;
      .gantt-elastic__scroll-handler {
        position: absolute;
        border-radius: 50%;
        width: 10px;
        height: 10px;
        cursor: pointer;
        background-color: rgb(33, 150, 243);
        &:hover {
          box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
  .task-list-container__fixed {
    width: 150px;
    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;
    .gantt-elastic__task-list-header {
      display: block;
    }
  }
  .task-list-container__right-fixed {
    position: absolute;
    top: 0;
    overflow: hidden;
  }
  .scroll-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
  }
}
</style>
