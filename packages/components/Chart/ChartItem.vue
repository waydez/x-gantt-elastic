<template>
  <g
    ref="chartRowWrapper"
    class="gantt-elastic__chart-row-wrapper"
    :style="{ ...root.style['chart-row-wrapper'] }"
    @click="chartRowClick($event, task)"
  >
    <foreignObject
      ref="foreignObject"
      :data-id="task.id"
      :x="foreignObjectX"
      :y="foreignObjectY"
      :width="maxWidth"
      height="1"
    />
    <component
      :is="task.type"
      :task="{
        style: task.style,
        x: task.plannedX,
        y: task.plannedY,
        width: task.plannedWidth,
        height: task.height / (1 + hasPeerLine),
        id: task.id,
        allChildren: task.allChildren,
        label: task.label,
        progress: task.progress,
        collapsed: task.collapsed,
        fillColor: task.fillColor
      }"
    ></component>
    <!-- 如果没有实际进度，则全显示计划进度  -->
    <template v-if="hasPeerLine">
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
          collapsed: task.collapsed,
          fillColor: task.fillColor
        }"
      ></component>
    </template>
  </g>
</template>

<script>
import Task from './Row/Task.vue'
import Milestone from './Row/Milestone.vue'
import Project from './Row/Project.vue'
import Group from './Row/Group.vue'

export default {
  name: 'ChartItem',
  inject: ['root'],
  components: {
    Task,
    Milestone,
    Project,
    Group
  },
  props: {
    task: {
      type: Object,
      default: () => {}
    },
    hasPeerLine: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      intersectionObserver: null
    }
  },
  computed: {
    foreignObjectX() {
      const task = this.task
      if (task.actualX >= 0) {
        return Math.min(task.plannedX, task.actualX)
      } else return task.plannedX
    },
    foreignObjectY() {
      const task = this.task
      return task.plannedY + task.height / 2
    },
    maxWidth() {
      const task = this.task
      let end = task.plannedX + task.plannedWidth
      if (task.actualX >= 0) {
        end = Math.max(end, task.actualX + task.actualWidth)
      } else {
        end = task.plannedX + task.plannedWidth
      }

      return end - this.foreignObjectX
    }
  },
  mounted() {
    const root = this.root
    const option = { root: root.state.refs.chart, thresholds: [0] }
    let previousLeft = root.state.options.scroll.left
    this.intersectionObserver = new IntersectionObserver((entries) => {
      // 如果 intersectionRatio 为 0，则目标在视野外，
      // 我们不需要做任何事情。
      const entry = entries[0]
      const direction = previousLeft > root.state.options.scroll.left ? 'right' : 'left'
      const task = root.getTask(entry.target.dataset.id)
      task.direction = direction
      task.visible = entry.intersectionRatio > 0
      previousLeft = root.state.options.scroll.left
    }, option)
    // 开始监听
    this.$nextTick(() => {
      this.intersectionObserver.observe(this.$refs.foreignObject)
    })
  },
  beforeDestroy() {
    if (this.intersectionObserver) this.intersectionObserver.unobserve(this.$refs.foreignObject)
  },
  methods: {
    chartRowClick(event, task) {
      this.root.$emit('chartBlock-row-click', { event, task })
    }
  }
}
</script>

<style></style>
