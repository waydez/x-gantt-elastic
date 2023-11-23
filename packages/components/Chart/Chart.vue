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
            <g
              v-for="task in root.visibleTasks"
              :key="task.id"
              :task="task"
              class="gantt-elastic__chart-row-wrapper"
              :style="{ ...root.style['chart-row-wrapper'] }"
              @click="chartRowClick($event, task)"
            >
              <component
                :is="task.type"
                :task="{
                  style: task.style,
                  x: task.plannedX,
                  y: task.plannedY,
                  width: task.plannedWidth,
                  height: task.height / (1 + ((task.actualStartTime && 1) || 0)),
                  id: task.id,
                  allChildren: task.allChildren,
                  label: task.label,
                  progress: task.progress,
                  collapsed: task.collapsed
                }"
              ></component>
              <!-- 如果没有实际进度，则全显示计划进度  -->
              <template v-if="task.actualStartTime">
                <!-- 实际进度不显示展开收起 -->
                <component
                  :is="task.type"
                  :noPrefix="true"
                  :task="{
                    style: task.style,
                    x: task.actualX,
                    y: task.actualY + task.height / 2 + 2,
                    width: task.actualWidth,
                    height: task.height / 2,
                    id: task.id,
                    allChildren: task.allChildren,
                    label: task.label,
                    progress: task.progress,
                    collapsed: task.collapsed
                  }"
                ></component>
              </template>
            </g>
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
import Task from './Row/Task.vue'
import Milestone from './Row/Milestone.vue'
import Project from './Row/Project.vue'
export default {
  name: 'Chart',
  components: {
    Grid,
    DependencyLines,
    Calendar,
    Task,
    Milestone,
    Project,
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
    chartRowClick(event, task) {
      this.root.$emit('chartBlock-row-click', { event, task })
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

.gantt-elastic__grid-lines-wrapper .gantt-elastic__grid-lines .gantt-elastic__grid-line-time:hover {
  @include filterColor;
  stroke-width: 2 !important;
}
</style>
