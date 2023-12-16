<template>
  <div class="gantt-elastic__time-dot-handler" :style="containerStyle">
    <virtual-list
      ref="taskListItems"
      :list="root.visibleTasks"
      :item-key="'id'"
      :buffer="root.state.options.chart.grid.buffer"
      :min-size="lineHeight"
    >
      <template #default="{ itemData }">
        <div
          :key="itemData.id"
          class="gantt-elastic__dot-handler-line"
          :style="{
            opacity: itemData.visible ? 0 : 1,
            'justify-content': itemData.direction === 'left' ? 'flex-start' : 'flex-end',
            [`padding-${itemData.direction}`]:
              itemData.direction === 'left' ? '4px' : root.state.options.scrollBarHeight + 'px'
          }"
          @click="scrollToStart(itemData)"
        >
          <div class="gantt-elastic__dot-handler-line__inner" />
        </div>
      </template>
    </virtual-list>
  </div>
</template>

<script>
import { VirtualList } from 'vue-tiny-virtual-list'

export default {
  name: 'TimeDotHandler',
  components: {
    VirtualList
  },
  inject: ['root'],
  data() {
    return {}
  },
  computed: {
    containerStyle() {
      const calendarRect = this.root.state.options.calendar
      return {
        height: `calc(100% - ${calendarRect.height + calendarRect.gap}px)`,
        'margin-top': calendarRect.height + calendarRect.gap + 'px'
      }
    },
    lineHeight() {
      const { row, chart } = this.root.state.options
      return row.height + chart.grid.horizontal.gap * 2
    }
  },
  methods: {
    scrollToStart(task) {
      // 滚动至画布中央的对应时间线
      this.root.scrollToTime(task.plannedStartTime)
    }
  }
}
</script>

<style lang="scss">
.gantt-elastic__time-dot-handler {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  > .virtual-list__client {
    overflow: hidden !important;
  }
  .gantt-elastic__dot-handler-line {
    display: flex;
    align-items: center;
    width: 100%;
    height: 38px;
    line-height: 38px;
    &__inner {
      pointer-events: all;
      border-radius: 50%;
      cursor: pointer;
      width: 10px;
      height: 10px;
      background-color: rgb(33, 150, 243);
      &:hover {
        box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
</style>
