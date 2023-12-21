<template>
  <div
    v-show="root.state.options.taskList.display"
    ref="taskListWrapper"
    class="gantt-elastic__task-list-wrapper"
    :style="{
      ...root.style['task-list-wrapper'],
      width: root.state.options.taskList.finalWidth + 'px',
      height: '100%'
    }"
  >
    <div ref="taskList" class="gantt-elastic__task-list" :style="{ ...root.style['task-list'] }">
      <task-list-header :task-columns="taskColumns"></task-list-header>
      <div
        class="gantt-elastic__task-list-items"
        :style="{
          ...root.style['task-list-items'],
          height: root.state.options.rowsHeight + 'px'
        }"
      >
        <!-- todo -->
        <virtual-list
          ref="taskListItems"
          :list="root.visibleTasks"
          :item-key="'id'"
          :buffer="root.state.options.chart.grid.buffer"
          :min-size="lineHeight"
        >
          <template #default="{ itemData }">
            <task-list-item
              :task="itemData"
              :task-columns="taskColumns"
              @click.native="taskRowClick($event, itemData)"
            >
              <template v-for="column in taskColumns">
                <template :slot="column.id">
                  <slot
                    v-if="column.customSlot"
                    :name="column.id"
                    :row="itemData"
                    :column="column"
                  />
                </template>
              </template>
            </task-list-item>
          </template>
        </virtual-list>
      </div>
    </div>
  </div>
</template>

<script>
import { VirtualList } from 'vue-tiny-virtual-list'
import TaskListHeader from './TaskListHeader.vue'
import TaskListItem from './TaskListItem.vue'

export default {
  name: 'TaskList',
  components: {
    VirtualList,
    TaskListHeader,
    TaskListItem
  },
  inject: ['root'],
  props: {
    taskColumns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  computed: {
    lineHeight() {
      const { row, chart } = this.root.state.options
      return row.height + chart.grid.horizontal.gap * 2
    }
  },

  /**
   * Mounted
   */
  mounted() {
    // this.root.state.refs.taskListWrapper = this.$refs.taskListWrapper
    // this.root.state.refs.taskList = this.$refs.taskList
    if (!this.root.state.refs.taskListWrapper) this.root.state.refs.taskListWrapper = []
    if (!this.root.state.refs.taskList) this.root.state.refs.taskList = []
    if (!this.root.state.refs.taskListItems) this.root.state.refs.taskListItems = []

    this.root.state.refs.taskListWrapper.push(this.$refs.taskListWrapper)
    this.root.state.refs.taskList.push(this.$refs.taskList)
    this.root.state.refs.taskListItems.push(this.$refs.taskListItems.$refs.clientRef.$el)
  },
  methods: {
    taskRowClick(event, task) {
      this.root.$emit('taskList-row-click', { event, task })
    }
  }
}
</script>
