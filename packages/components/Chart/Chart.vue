<template>
  <div ref="chart" class="gantt-elastic__chart" :style="{ ...root.style['chart'] }">
    <div
      ref="chartCalendarContainer"
      class="gantt-elastic__chart-calendar-container"
      :style="{
        ...root.style['chart-calendar-container'],
        height: root.state.options.calendar.height + 'px',
        'margin-bottom': root.state.options.calendar.gap + 'px'
      }"
    >
      <calendar></calendar>
    </div>
    <div
      ref="chartGraphContainer"
      class="gantt-elastic__chart-graph-container"
      :style="{
        ...root.style['chart-graph-container'],
        height: root.state.options.height - root.state.options.calendar.height + 'px'
      }"
    >
      <div
        :style="{
          ...root.style['chart-area'],
          width: root.state.options.width + 'px',
          height: root.state.options.rowsHeight + 'px'
        }"
      >
        <div
          ref="chartGraph"
          class="gantt-elastic__chart-graph"
          :style="{ ...root.style['chart-graph'], height: '100%' }"
        >
          <svg
            ref="chartGraphSvg"
            class="gantt-elastic__chart-graph-svg"
            :style="{ ...root.style['chart-graph-svg'] }"
            x="0"
            y="0"
            :width="root.state.options.width + 'px'"
            :height="root.state.options.allVisibleTasksHeight + 'px'"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- 休息日的高亮区域 -->
            <days-highlight></days-highlight>
            <!-- 日期时间表格 -->
            <grid></grid>
            <!-- 依赖线 -->
            <dependency-lines :tasks="root.visibleTasks"></dependency-lines>
            <!-- 具体任务块 -->
            <chart-item
              v-for="task in root.visibleTasks"
              :key="task.id"
              :task="task"
              :has-peer-line="hasPeerLine(task)"
            />
            <!-- 今天的时间线 -->
            <line
              class="gantt-elastic__grid-line-time"
              :style="{ ...root.style['grid-line-time'] }"
              :x1="root.timeLinePosition.x"
              :y1="root.timeLinePosition.y1"
              :x2="root.timeLinePosition.x"
              :y2="root.timeLinePosition.y2"
            ></line>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Grid from './Grid.vue'
import DaysHighlight from './DaysHighlight.vue'
import Calendar from '../Calendar/Calendar.vue'
import DependencyLines from './DependencyLines.vue'
import ChartItem from './ChartItem.vue'

export default {
  name: 'Chart',
  components: {
    Grid,
    DependencyLines,
    Calendar,
    ChartItem,
    DaysHighlight
  },
  inject: ['root'],
  data() {
    return {
      moving: false
    }
  },

  computed: {
    /**
     * Get view box
     *
     * @returns {string}
     */
    getViewBox() {
      return `0 0 ${this.root.state.options.width} ${this.root.state.options.allVisibleTasksHeight}`
    }
  },
  /**
   * Mounted
   */
  mounted() {
    this.root.state.refs.chart = this.$refs.chart
    this.root.state.refs.chartCalendarContainer = this.$refs.chartCalendarContainer
    this.root.state.refs.chartGraphContainer = this.$refs.chartGraphContainer
    this.root.state.refs.chartGraph = this.$refs.chartGraph
    this.root.state.refs.chartGraphSvg = this.$refs.chartGraphSvg
  },
  methods: {
    hasPeerLine(task) {
      return task.type === 'task' && !!task.actualStartTime && !!task.actualEndTime
    }
  }
}
</script>

<style lang="scss">
@mixin filterColor() {
  cursor: pointer;
  filter: hue-rotate(45deg);
}

.gantt-elastic__chart-row-bar-wrapper {
  .gantt-elastic__chart-row-bar {
    .gantt-elastic__chart-row-bar-polygon:hover {
      @include filterColor;
    }
  }
}

.gantt-elastic__chart-dependency-lines-path:hover {
  @include filterColor;
}

.gantt-elastic__grid-line-time:hover {
  @include filterColor;
  stroke-width: 2 !important;
}
</style>
