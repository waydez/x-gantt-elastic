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
          :class="`scrolling-${scrollPosition}`"
          @mousemove="resizerMove"
          @mouseup="resizerEnd"
        >
          <task-list-container ref="taskListContainer" :task-columns="root.getTaskListAllColumns">
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
          </task-list-container>
          <task-list-container
            v-if="root.state.options.taskList.display && root.getTaskListLeftFixedColumns.length"
            ref="taskListLeftFixed"
            class="task-list-container__fixed"
            type="left-fixed"
            :task-columns="root.getTaskListLeftFixedColumns"
          >
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
          </task-list-container>
          <task-list-container
            v-if="root.state.options.taskList.display && root.getTaskListRightFixedColumns.length"
            ref="taskListRightFixed"
            class="task-list-container__right-fixed"
            type="right-fixed"
            :task-columns="root.getTaskListRightFixedColumns"
          >
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
          </task-list-container>

          <!-- START 任务列表 column 宽度设置 -->
          <div
            class="gantt-elastic__task-list-header-resizer-proxy"
            :style="{
              display: root.headerColResizer.moving ? 'block' : '',
              left: root.headerColResizer.x + 'px'
            }"
          >
          </div>
          <!-- END -->

          <!-- START 宽度自定义设置 -->
          <div v-if="toggleDisplay" class="gantt-elastic__task-list-resizer">
            <div
              class="gantt-elastic__task-list-resizer__inner"
              :style="{
                height: root.state.options.calendar.height + 'px'
              }"
              @mousedown="resizerStart"
            ></div>
          </div>
          <div
            v-show="resizing"
            class="gantt-elastic__task-list-resizer-proxy"
            :style="{ left: `${resizerLeft}px` }"
          ></div>
          <!-- END 宽度自定义设置 -->
          <div
            ref="chartContainer"
            class="gantt-elastic__main-view-container"
            :style="{ ...root.style['main-view-container'] }"
            @wheel.prevent="chartWheel"
          >
            <!--
              !depreciated
              @mousedown="chartMouseDown" @mousemove.prevent="chartMouseMove" @mouseup="chartMouseUp"
              @touchstart="chartMouseDown" @touchmove.prevent="chartMouseMove" @touchend="chartMouseUp"
            -->
            <chart></chart>
            <!-- 可以表格高度居中 root.state.options.rowsHeight / 2  -->
            <div class="gantt-elastic__toggle-handler" @click="toggleTaskList">
              <img
                :src="toggleIcon"
                class="toggle-handler-icon"
                :class="{ 'toggle-handler-icon-reverse': !toggleDisplay }"
              />
            </div>
            <!-- 跳转到时间开始节点 -->
            <time-dot-handler ref="timeDotHandler" />
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
    <!-- START 任务列表横向滚动条 -->
    <div
      ref="scrollContainerRef"
      class="gantt-elastic__task-list-scroll-container"
      :style="{
        width: root.state.options.taskList.viewWidth + 'px'
      }"
      @scroll="onTaskListHorizontalScroll"
    >
      <div
        class="gantt-elastic__task-list-scroll-container__inner"
        :style="{
          width: root.state.options.taskList.finalWidth + 'px'
        }"
      ></div>
    </div>
    <!-- END -->
    <div
      ref="chartScrollContainerHorizontal"
      class="gantt-elastic__chart-scroll-container gantt-elastic__chart-scroll-container--horizontal"
      :style="{
        ...root.style['chart-scroll-container'],
        ...root.style['chart-scroll-container--horizontal'],
        position: 'relative',
        marginLeft: getMarginLeft,
        marginTop: '-16px',
        zIndex: 1
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
import { throttle } from 'throttle-debounce'
import toggleIcon from '@packages/assets/svg/toggle-list.svg'
import TaskListContainer from '../TaskList/TaskListContainer.vue'
import Chart from '../Chart/Chart.vue'
import TimeDotHandler from './components/time-dot-handler.vue'

// let ignoreScrollEvents = false

export default {
  name: 'MainView',
  components: {
    TaskListContainer,
    Chart,
    TimeDotHandler
  },
  inject: ['root'],
  data() {
    return {
      toggleIcon,
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
      },
      resizing: false,
      resizerLeft: 0,
      scrollPosition: 'left'
    }
  },
  computed: {
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
    },

    scrollContainer() {
      return this.$refs.scrollContainerRef
    },

    /**
     *
     */
    calcRightFixedShadow() {
      // if (!this.scrollContainer) return ''
      // debugger
      const { scrollLeft, viewWidth } = this.root.state.options.taskList
      // debugger
      // const { offsetWidth, scrollWidth } = // this.$refs.scrollContainerRef
      // const maxScrollLeftPosition = viewWidth - scrollWidth - 1
      return scrollLeft < viewWidth ? 'fixed-shadow' : ''
    }
  },

  /**
   * Before destroy event - clean up
   */
  beforeDestroy() {
    document.removeEventListener('mouseup', this.chartMouseUp)
    document.removeEventListener('mousemove', this.chartMouseMove)
    // !depreciated
    // document.removeEventListener('touchmove', this.chartMouseMove)
    // document.removeEventListener('touchend', this.chartMouseUp)
  },
  /**
   * Mounted
   */
  mounted() {
    this.root.state.refs.mainView = this.$refs.mainView
    this.root.state.refs.chartContainer = this.$refs.chartContainer
    this.root.state.refs.taskListContainer = this.$refs.taskListContainer.$el
    this.root.state.refs.chartScrollContainerHorizontal = this.$refs.chartScrollContainerHorizontal
    this.root.state.refs.chartScrollContainerVertical = this.$refs.chartScrollContainerVertical
    document.addEventListener('mouseup', this.chartMouseUp.bind(this))
    document.addEventListener('mousemove', this.chartMouseMove.bind(this))
    // document.addEventListener('touchmove', this.chartMouseMove.bind(this))
    // document.addEventListener('touchend', this.chartMouseUp.bind(this))
  },
  methods: {
    /**
     * Emit event when mouse is moving inside main view
     */
    // mouseMove(event) {
    //   this.root.$emit('main-view-mousemove', event)
    // },

    /**
     * Emit mouseup event inside main view
     */
    // mouseUp(event) {
    //   this.root.$emit('main-view-mouseup', event)
    // },

    /**
     * Horizontal scroll event handler
     */
    onHorizontalScroll(ev) {
      this.root.$emit('chart-scroll-horizontal', ev)
    },

    /**
     * Task list horizontal scroll event handler
     */
    onTaskListHorizontalScroll(ev) {
      this.root.$emit('taskList-container-scroll-horizontal', ev)

      this.syncPosition()
    },

    /**
     * 同步滚动位置
     */
    syncPosition: throttle(100, function () {
      const { scrollLeft } = this.root.state.options.taskList
      const { scrollWidth, offsetWidth } = this.$refs.scrollContainerRef
      const maxScrollLeftPosition = scrollWidth - offsetWidth - 1

      if (scrollLeft >= maxScrollLeftPosition) {
        this.scrollPosition = 'right'
      } else if (scrollLeft === 0) {
        this.scrollPosition = 'left'
      } else {
        this.scrollPosition = 'middle'
      }
    }),

    /**
     * Vertical scroll event handler
     */
    onVerticalScroll(ev) {
      this.$refs.timeDotHandler &&
        (this.$refs.timeDotHandler.$refs.taskListItems.$el.scrollTop = ev.target.scrollTop)
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
      // !depreciated
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
      this.resizerEnd(ev)
    },

    /**
     * Chart mousemove event handler
     * When in drag scrolling mode this method calculate scroll movement
     */
    chartMouseMove(ev) {
      this.resizerMove(ev)
      // 由于禁用了画布点击滚动，因此下面的逻辑暂无用途
      if (this.root.state.options.scroll.scrolling) {
        // !depreciated
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
    resizerStart(e) {
      e.preventDefault()
      if (!this.resizing) {
        const offsetX = this.$parent.$el.getBoundingClientRect().left
        this.resizerLeft = e.x - offsetX
        this.resizing = true
      }
    },
    resizerMove(e) {
      e.preventDefault()
      if (this.resizing) {
        const offsetX = this.$parent.$el.getBoundingClientRect().left
        this.resizerLeft = e.x - offsetX
      }
    },
    resizerEnd(e) {
      e.preventDefault()
      if (!this.resizing) return
      this.resizing = false
      this.root.$emit('taskList-view-width-change', Number(e.x))
    }
  }
}
</script>

<style lang="scss">
.gantt-elastic__main-view {
  .gantt-elastic__main-view-container {
    .gantt-elastic__toggle-handler {
      width: 24px;
      height: 36px;
      position: absolute;
      font-size: 12px;
      user-select: none;
      overflow: hidden;
      cursor: pointer;
      padding: 10px 4px;
      background: #f5f5f5;
      transition: box-shadow 250ms;
      box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
      // box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.15);
      outline: #eee solid 1px;
      // border-color: #eee;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      box-sizing: border-box;
      left: 0;
      top: 50%;
      z-index: 1;
      &:hover {
        // box-shadow: 2px 2px 6px rgba(151, 125, 125, 0.15);
        box-shadow: 2px 0px 5px #c6c6c6;
      }
      .toggle-handler-icon {
        opacity: 0.8;
        &-reverse {
          transform: rotate(180deg);
        }
      }
    }
  }

  .gantt-elastic__task-list-header-resizer-proxy {
    display: none;
    position: absolute;
    background: #eee;
    height: 100%;
    width: 1px;
    z-index: 3;
  }
  .gantt-elastic__task-list-resizer,
  .gantt-elastic__task-list-resizer-proxy {
    height: 100%;
    border-radius: 2px;
  }
  .gantt-elastic__task-list-resizer {
    width: 2px;
    z-index: 1;
    background: #eee;
    cursor: pointer;
    &:hover {
      background: #3370ff;
      box-shadow: 0 0 1px #3370ff;
    }
    &__inner {
      cursor: col-resize;
      background: transparent;
    }
  }
  .gantt-elastic__task-list-resizer-proxy {
    width: 1px;
    position: absolute;
    background: #3370ff;
    z-index: 2;
  }
  .gantt-elastic__task-list-scroll-container {
    position: relative;
    left: 0;
    bottom: 0;
    overflow: auto;
    z-index: 1;
    margin-top: -16px;
    &__inner {
      height: 1px;
    }
  }
}

.gantt-elastic__chart-scroll-container,
.gantt-elastic__task-list-scroll-container {
  opacity: 0.3;
  transition: linear;
  &:hover {
    opacity: 0.8;
  }
}
</style>
