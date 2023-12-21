<template>
  <div
    class="gantt-elastic__task-list-header"
    :style="{
      ...root.style['task-list-header'],
      height: `${root.state.options.calendar.height}px`,
      'margin-bottom': `${root.state.options.calendar.gap}px`
    }"
    @mousemove="resizerMouseMove"
  >
    <div
      v-for="column in taskColumns"
      :key="column._id"
      class="gantt-elastic__task-list-header-column"
      :style="getStyle(column)"
    >
      <task-list-expander
        v-if="column.expander"
        :tasks="collapsible"
        :options="root.state.options.taskList.expander"
      ></task-list-expander>
      <div
        class="gantt-elastic__task-list-header-label"
        :style="{
          ...root.style['task-list-header-label'],
          ...column.style['task-list-header-label']
        }"
        :column="column"
        @mouseup="resizerMouseUp"
      >
        {{ column.label }}
      </div>
      <div
        class="gantt-elastic__task-list-header-resizer-wrapper"
        :column="column"
        @mousedown="resizerMouseDown($event, column)"
      >
      </div>
    </div>
  </div>
</template>

<script>
import TaskListExpander from '../Expander.vue'

export default {
  name: 'TaskListHeader',
  components: {
    TaskListExpander
  },
  inject: ['root'],
  props: {
    taskColumns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      resizer: {
        column: null,
        moving: false,
        initialX: 0,
        x: 0
      }
    }
  },

  computed: {
    /**
     * Is this row collapsible?
     *
     * @returns {bool}
     */
    collapsible() {
      return this.root.state.tasks.filter((task) => task.allChildren.length > 0)
    }
  },

  /**
   * Before destroy event - clear all event listeners
   */
  beforeDestroy() {
    document.removeEventListener('mouseup', this.resizerMouseUp)
    document.removeEventListener('mousemove', this.resizerMouseMove)
  },

  /**
   * Created
   */
  created() {
    this.mouseUpListener = document.addEventListener('mouseup', this.resizerMouseUp.bind(this))
    this.mouseMoveListener = document.addEventListener(
      'mousemove',
      this.resizerMouseMove.bind(this)
    )
    // this.root.$on('main-view-mousemove', this.resizerMouseMove)
    // this.root.$on('main-view-mouseup', this.resizerMouseUp)
  },

  methods: {
    /**
     * Get style
     *
     * @returns {object}
     */
    getStyle(column) {
      return {
        // width: column.finalWidth + 'px'
        width: column.width + 'px'
      }
    },
    /**
     * Resizer mouse down event handler
     */
    resizerMouseDown(event, column) {
      event.preventDefault()
      if (!this.resizer.moving) {
        // 该列的配置信息
        this.resizer.column = column
        this.resizer.moving = true
        this.resizer.initialX = event.clientX
        this.resizer.initialWidth = column.width
        const offsetX = this.root.$el.getBoundingClientRect().left
        this.resizer.x = event.x - offsetX
        this.root.$emit('taskList-column-width-change-start', {
          x: this.resizer.x,
          moving: this.resizer.moving
        })
      }
    },

    /**
     * Resizer mouse move event handler
     */
    resizerMouseMove(event) {
      event.preventDefault()
      if (this.resizer.moving) {
        const offsetX = this.root.$el.getBoundingClientRect().left
        this.resizer.x = event.x - offsetX

        this.root.$emit('taskList-column-width-change', {
          x: this.resizer.x,
          moving: this.resizer.moving
        })
      }
    },

    /**
     * Resizer mouse up event handler
     */
    resizerMouseUp(event) {
      event.preventDefault()
      if (this.resizer.moving) {
        const column = this.resizer.column
        column.width = this.resizer.initialWidth + event.clientX - this.resizer.initialX
        if (column.width < this.root.state.options.taskList.minWidth) {
          column.width = this.root.state.options.taskList.minWidth
        }
        this.resizer.moving = false
        this.root.$emit('taskList-column-width-change-stop', {
          x: this.resizer.x,
          moving: this.resizer.moving
        })
      }
    }
  }
}
</script>

<style lang="scss">
.gantt-elastic__task-list-header-resizer-wrapper {
  background: transparent;
  height: 100%;
  width: 2px;
  cursor: col-resize;
  display: inline-flex;
  vertical-align: center;
}

.gantt-elastic__task-list-header-column {
  box-sizing: border-box;
  display: flex;
  background: #f3f5f7;
  border-left: 1px solid #eee;
  color: #333;
  font-weight: 600;
  &:first-child:not(:last-child) {
    border-left: none;
  }
}
</style>
