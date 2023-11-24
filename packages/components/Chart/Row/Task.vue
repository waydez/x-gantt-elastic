<template>
  <g
    class="gantt-elastic__chart-row-bar-wrapper gantt-elastic__chart-row-task-wrapper"
    :style="{
      ...root.style['chart-row-bar-wrapper'],
      ...root.style['chart-row-task-wrapper'],
      ...task.style['chart-row-bar-wrapper']
    }"
  >
    <foreignObject
      v-if="!noPrefix && displayExpander"
      class="gantt-elastic__chart-expander gantt-elastic__chart-expander--task"
      :style="{
        ...root.style['chart-expander'],
        ...root.style['chart-expander--task'],
        ...task.style['chart-expander']
      }"
      :x="
        task.x - root.state.options.chart.expander.offset - root.state.options.chart.expander.size
      "
      :y="task.y + (root.state.options.row.height - root.state.options.chart.expander.size) / 2"
      :width="root.state.options.chart.expander.size"
      :height="root.state.options.chart.expander.size"
    >
      <expander
        :tasks="[task]"
        :options="root.state.options.chart.expander"
        type="chart"
      ></expander>
    </foreignObject>
    <svg
      class="gantt-elastic__chart-row-bar gantt-elastic__chart-row-task"
      :style="{
        ...root.style['chart-row-bar'],
        ...root.style['chart-row-task'],
        ...task.style['chart-row-bar']
      }"
      :x="task.x"
      :y="task.y"
      :width="task.width"
      :height="task.height"
      :viewBox="`0 0 ${task.width} ${task.height}`"
      xmlns="http://www.w3.org/2000/svg"
      @click="emitEvent('click', $event)"
      @mouseenter="emitEvent('mouseenter', $event)"
      @mouseover="emitEvent('mouseover', $event)"
      @mouseout="emitEvent('mouseout', $event)"
      @mousemove="emitEvent('mousemove', $event)"
      @mousedown="emitEvent('mousedown', $event)"
      @mouseup="emitEvent('mouseup', $event)"
      @mousewheel="emitEvent('mousewheel', $event)"
      @touchstart="emitEvent('touchstart', $event)"
      @touchmove="emitEvent('touchmove', $event)"
      @touchend="emitEvent('touchend', $event)"
    >
      <!-- <defs>
        <clipPath :id="clipPathId">
          <polygon :points="getPoints"></polygon>
        </clipPath>
      </defs>
      <polygon
        class="gantt-elastic__chart-row-bar-polygon gantt-elastic__chart-row-task-polygon"
        :style="{
          ...root.style['chart-row-bar-polygon'],
          ...root.style['chart-row-task-polygon'],
          ...task.style['base'],
          ...task.style['chart-row-bar-polygon']
        }"
        :points="getPoints"
      ></polygon> -->
      <path
        class="gantt-elastic__chart-row-bar-polygon gantt-elastic__chart-row-task-polygon"
        :style="{
          ...root.style['chart-row-bar-polygon'],
          ...root.style['chart-row-task-polygon'],
          ...task.style['base'],
          ...task.style['chart-row-bar-polygon']
        }"
        :d="getPath"
      ></path>
      <progress-bar :task="task" :clip-path="'url(#' + clipPathId + ')'"></progress-bar>
    </svg>
    <!-- todo -->
    <chart-text v-if="!noPrefix && root.state.options.chart.text.display" :task="task"></chart-text>
  </g>
</template>

<script>
import Expander from '../../Expander.vue'
import ChartText from '../Text.vue'
import ProgressBar from '../ProgressBar.vue'
import taskMixin from './Task.mixin.js'
export default {
  name: 'Task',
  components: {
    ChartText,
    ProgressBar,
    Expander
  },
  inject: ['root'],
  mixins: [taskMixin],
  props: {
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
     * Get clip path id
     *
     * @returns {string}
     */
    clipPathId() {
      return 'gantt-elastic__task-clip-path-' + this.task.id
    },

    /**
     * Get points
     *
     * @returns {string}
     */
    getPoints() {
      const task = this.task
      return `0,0 ${task.width},0 ${task.width},${task.height} 0,${task.height}`
    },
    getPath() {
      const { width, height } = this.task
      const borderRadius = 4
      // const borderRadius = this.root.state.options.chart.borderRadius
      const borderWidth = width - borderRadius * 2
      const borderHeight = height - borderRadius * 2
      return `
      m ${borderRadius},0 
      l ${borderWidth},0 
      q ${borderRadius},${0} ${borderRadius},${borderRadius}
      l ${0},${borderHeight} 
      q ${0},${borderRadius} ${-borderRadius},${borderRadius}
      l ${-borderWidth},${0} 
      q ${-borderRadius},${0} ${-borderRadius},${-borderRadius}
      l ${0},${-borderHeight}
      q ${0},${-borderRadius} ${borderRadius},${-borderRadius}`
    }
  }
}
</script>
<style lang="scss"></style>
