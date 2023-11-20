<template>
  <svg
    x="0"
    y="0"
    width="100%"
    height="100%"
    class="gantt-elastic__chart-dependency-lines-container"
    :style="{ ...root.style['chart-dependency-lines-container'] }"
  >
    <g v-for="task in dependencyTasks" :key="task.id">
      <path
        v-for="dependencyLine in task.dependencyLines"
        :key="dependencyLine.id"
        class="gantt-elastic__chart-dependency-lines-path"
        :style="{
          ...root.style['chart-dependency-lines-path'],
          ...task.style['chart-dependency-lines-path'],
          ...task.style['chart-dependency-lines-path-' + dependencyLine.task_id]
        }"
        :d="dependencyLine.points"
      ></path>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'DependencyLines',
  inject: ['root'],
  props: {
    tasks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  computed: {
    /**
     * Get tasks which are dependent on other tasks
     *
     * @returns {array}
     */
    dependencyTasks() {
      return this.tasks
        .filter((task) => typeof task.dependentOn !== 'undefined')
        .map((task) => {
          task.dependencyLines = task.dependentOn.map((id) => {
            return { points: this.getPoints(id, task.id), task_id: id }
          })
          return task
        })
        .filter((task) => task.dependencyLines.points !== null)
    }
  },
  methods: {
    /**
     * Get path points
     *
     * @param {any} fromTaskId
     * @param {any} toTaskId
     * @returns {string}
     */
    getPoints(fromTaskId, toTaskId) {
      const fromTask = this.root.getTask(fromTaskId)
      const toTask = this.root.getTask(toTaskId)
      if (
        fromTask === null ||
        toTask === null ||
        !this.root.isTaskVisible(toTask) ||
        !this.root.isTaskVisible(fromTask)
      ) {
        return null
      }
      //  todo？ 是否只根据计划的时间点，来链接依赖线
      const startX = fromTask.plannedX + fromTask.plannedWidth
      const startY = fromTask.plannedY + fromTask.height / 2
      const stopX = toTask.plannedX
      const stopY = toTask.plannedY + toTask.height / 2
      const distanceX = stopX - startX
      let distanceY
      let yMultiplier = 1
      if (stopY >= startY) {
        distanceY = stopY - startY
      } else {
        distanceY = startY - stopY
        yMultiplier = -1
      }
      const offset = 10
      const roundness = 4
      const isBefore = distanceX <= offset + roundness
      let points = `M ${startX} ${startY}
          L ${startX + offset},${startY} `
      if (isBefore) {
        points += `
          Q ${startX + offset + roundness},${startY} ${startX + offset + roundness},${ startY + roundness * yMultiplier} 
          L ${startX + offset + roundness}, ${ startY + (distanceY * yMultiplier) / 2 - roundness * yMultiplier }
          Q ${startX + offset + roundness},${startY + (distanceY * yMultiplier) / 2} ${ startX + offset },${startY + (distanceY * yMultiplier) / 2}
          L ${startX - offset + distanceX},${startY + (distanceY * yMultiplier) / 2}
          Q ${startX - offset + distanceX - roundness},${startY + (distanceY * yMultiplier) / 2} ${ startX - offset + distanceX - roundness },${startY + (distanceY * yMultiplier) / 2 + roundness * yMultiplier}
          L ${startX - offset + distanceX - roundness},${stopY - roundness * yMultiplier}
          Q ${startX - offset + distanceX - roundness},${stopY} ${ startX - offset + distanceX },${stopY}
          L ${stopX},${stopY}
        `
      } else {
        points += `
          L ${startX + distanceX / 2 - roundness},${startY}
          Q ${startX + distanceX / 2},${startY} ${startX + distanceX / 2},${ startY + roundness * yMultiplier }
          L ${startX + distanceX / 2},${stopY - roundness * yMultiplier}
          Q ${startX + distanceX / 2},${stopY} ${startX + distanceX / 2 + roundness},${stopY}
          L ${stopX},${stopY}
        `
      }
      return points
    }
  }
}
</script>

<style lang="scss">
.gantt-elastic__chart-dependency-lines-path {
  &:hover {
    stroke: red !important;
    stroke-width: 3 !important;
    cursor: pointer;
  }
}
</style>
