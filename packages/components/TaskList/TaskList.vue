<template>
  <div
    v-show="root.state.options.taskList.display"
    ref="taskListWrapper"
    class="gantt-elastic__task-list-wrapper"
    :style="{ ...root.style['task-list-wrapper'], width: '100%', height: '100%' }"
  >
    <div ref="taskList" class="gantt-elastic__task-list" :style="{ ...root.style['task-list'] }">
      <task-list-header></task-list-header>
      <div
        ref="taskListItems"
        class="gantt-elastic__task-list-items"
        :style="{ ...root.style['task-list-items'], height: root.state.options.rowsHeight + 'px' }"
      >
        <!-- todo -->
        <task-list-item v-for="task in root.visibleTasks" :key="task.documentId" :task="task">
          <template v-for="column in root.getTaskListColumnsSilently">
            <template :slot="column.customSlot">
              <slot
                v-if="column.customSlot"
                :name="column.customSlot"
                :row="task"
                :column="column"
              />
            </template>
          </template>
        </task-list-item>
      </div>
    </div>
  </div>
</template>

<script>
import TaskListHeader from './TaskListHeader.vue'
import TaskListItem from './TaskListItem.vue'
export default {
  name: 'TaskList',
  components: {
    TaskListHeader,
    TaskListItem
  },
  inject: ['root'],
  data() {
    return {}
  },

  /**
   * Mounted
   */
  mounted() {
    this.root.state.refs.taskListWrapper = this.$refs.taskListWrapper
    this.root.state.refs.taskList = this.$refs.taskList
    this.root.state.refs.taskListItems = this.$refs.taskListItems
  }
}
</script>
