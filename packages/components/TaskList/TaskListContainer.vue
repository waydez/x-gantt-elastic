<template>
  <div
    v-show="taskListDisplay"
    ref="taskListContainer"
    class="gantt-elastic__task-list-container"
    :style="calcFixedStyle"
  >
    <task-list :task-columns="taskColumns">
      <template v-for="column in taskColumns" v-slot:[column.customSlot]="scopeSlot">
        <slot
          v-if="column.customSlot"
          :name="column.customSlot"
          :row="scopeSlot.row"
          :column="scopeSlot.column"
        />
      </template>
    </task-list>
  </div>
</template>

<script>
import TaskList from './TaskList.vue'

export default {
  name: 'TaskListContainer',
  components: { TaskList },
  inject: ['root'],
  props: {
    type: {
      type: String,
      default: '',
      validate: (item) => {
        return ['', 'left-fixed', 'right-fixed'].includes(item)
      }
    },
    taskColumns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  computed: {
    /**
     * display task list
     */
    taskListDisplay() {
      return !!this.root.state.options.taskList.display
    },

    /**
     * To calculate fixed width
     */
    calcFixedWidth() {
      return this.taskColumns.reduce((total, item) => {
        // return total + item.finalWidth
        return total + item.width
      }, 0)
    },

    /**
     * To calculate fixed style
     */
    calcFixedStyle() {
      const root = this.root
      const viewWidth = root.state.options.taskList.viewWidth
      const fixedStyle = {
        width: this.calcFixedWidth + 'px',
        height: root.state.options.height + 'px',
        flex: `1 0 ${viewWidth}px`
      }
      if (this.type === 'right-fixed') {
        fixedStyle.right = `calc(100% - ${viewWidth}px)`
      }
      return fixedStyle
    }
  }
}
</script>

<style lang="scss">
.gantt-elastic__task-list-container {
  background: #fff;
  z-index: 1;
  overflow: hidden;
  .gantt-elastic__task-list-wrapper {
    .gantt-elastic__task-list-item-column {
      border-left: 1px solid #00000050;
      &:first-child {
        border-left: none;
      }
    }
  }
  &.task-list-container__fixed {
    width: 150px;
    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;
    .gantt-elastic__task-list-header {
      display: block;
    }
    .gantt-elastic__task-list-wrapper .gantt-elastic__task-list-item-column {
      &:first-child {
        border-left: none;
      }
    }
  }
  &.task-list-container__right-fixed {
    position: absolute;
    top: 0;
    overflow: hidden;
    .gantt-elastic__task-list-wrapper .gantt-elastic__task-list-item-column {
      border-left: 1px solid #00000050;
    }
  }
}

.gantt-elastic__container {
  &.scrolling-middle {
    .task-list-container__fixed {
      box-shadow: 1px 1px 5px #c6c6c6;
    }
    .task-list-container__right-fixed {
      box-shadow: -1px 1px 5px #c6c6c6;
    }
  }
  &.scrolling-left {
    .task-list-container__fixed {
      box-shadow: none;
    }
    .task-list-container__right-fixed {
      box-shadow: -1px 1px 5px #c6c6c6;
    }
  }
  &.scrolling-right {
    .task-list-container__right-fixed {
      box-shadow: none;
    }
    .task-list-container__fixed {
      box-shadow: 1px 1px 5px #c6c6c6;
    }
  }
}
</style>
