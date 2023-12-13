<template>
  <div class="gantt-elastic__task-list-item-column" :style="itemColumnStyle">
    <div class="gantt-elastic__task-list-item-value-wrapper" :style="wrapperStyle">
      <slot></slot>
      <div class="gantt-elastic__task-list-item-value-container" :style="containerStyle">
        <div v-if="task.type === 'group'" class="gantt-elastic__task-list-item-group-value">
          <template v-if="root.state.options.taskMapping.label === column.id">
            <span class="group-value__label">
              {{ groupValue.label }}
            </span>
            <span class="group-value__value">{{ value }}</span>
          </template>
        </div>
        <slot v-else-if="column.customSlot" :name="column.customSlot" />
        <div
          v-else
          class="gantt-elastic__task-list-item-value"
          :style="valueStyle"
          @click="emitEvent('click', $event)"
          @mouseenter="emitEvent('mouseenter', $event)"
          @mouseover="emitEvent('mouseover', $event)"
          @mouseout="emitEvent('mouseout', $event)"
          @mousemove="emitEvent('mousemove', $event)"
          @mousedown="emitEvent('mousedown', $event)"
          @mouseup="emitEvent('mouseup', $event)"
          @touchstart="emitEvent('touchstart', $event)"
          @touchmove="emitEvent('touchmove', $event)"
          @touchend="emitEvent('touchend', $event)"
        >
          {{ value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItemColumn',
  inject: ['root'],
  props: {
    column: {
      type: Object,
      default: () => {}
    },
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  computed: {
    /**
     * Get column value
     *
     * @returns {any|string}
     */
    value() {
      if (typeof this.column.value === 'function') {
        return this.column.value(this.task)
      }
      return this.task[this.column.value]
    },

    itemColumnStyle() {
      return {
        ...this.root.style['task-list-item-column'],
        ...this.column.style['task-list-item-column'],
        width: this.column.finalWidth + 'px',
        height: this.column.height + 'px'
      }
    },

    wrapperStyle() {
      return {
        ...this.root.style['task-list-item-value-wrapper'],
        ...this.column.style['task-list-item-value-wrapper']
      }
    },

    containerStyle() {
      return {
        ...this.root.style['task-list-item-value-container'],
        ...this.column.style['task-list-item-value-container']
      }
    },

    valueStyle() {
      return {
        ...this.root.style['task-list-item-value'],
        ...this.column.style['task-list-item-value']
      }
    },

    groupValue() {
      return this.root.getTaskListColumnsSilently.find((t) => t.id === this.task.condition) || {}
    }
  },
  methods: {
    /**
     * Emit event
     *
     * @param {String} eventName
     * @param {Event} event
     */
    emitEvent(eventName, event) {
      if (
        typeof this.column.events !== 'undefined' &&
        typeof this.column.events[eventName] === 'function'
      ) {
        this.column.events[eventName]({ event, data: this.task, column: this.column })
      }
      // todo
      this.root.$emit(`taskList-${this.task.type}-${eventName}`, {
        event,
        data: this.task,
        column: this.column
      })
    }
  }
}
</script>
<style lang="scss">
.gantt-elastic__task-list-item-group-value {
  padding: 4px;
  font-size: 12px;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  .group-value__label {
    color: #909399;
  }
}
</style>
