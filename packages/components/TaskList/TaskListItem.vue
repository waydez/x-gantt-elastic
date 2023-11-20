<template>
  <div class="gantt-elastic__task-list-item" :style="{ ...root.style['task-list-item'] }">
    <item-column
      v-for="column in root.getTaskListColumnsSilently"
      :key="column._id"
      :column="column"
      :task="task"
    >
      <task-list-expander
        v-if="column.expander"
        :tasks="[task]"
        :options="root.state.options.taskList.expander"
        type="taskList"
      ></task-list-expander>
      <template :slot="column.customSlot">
        <slot v-if="column.customSlot" :name="column.customSlot" />
      </template>
    </item-column>
  </div>
</template>
<script>
import TaskListExpander from '../Expander.vue'
import ItemColumn from './ItemColumn.vue'

export default {
  name: 'TaskListItem',
  components: {
    TaskListExpander,
    ItemColumn
  },
  inject: ['root'],
  props: {
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  computed: {}
}
</script>
