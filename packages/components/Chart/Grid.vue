<template>
  <svg
    ref="chart"
    class="gantt-elastic__grid-lines-wrapper"
    :style="{ ...root.style['grid-lines-wrapper'] }"
    x="0"
    y="0"
    :width="root.state.options.width"
    :height="root.state.options.allVisibleTasksHeight"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g class="gantt-elastic__grid-lines" :style="{ ...root.style['grid-lines'] }">
      <!-- todo 分组 -->
      <line
        v-for="line in horizontalLines"
        :key="line.key"
        class="gantt-elastic__grid-line-horizontal"
        :style="{ ...root.style['grid-line-horizontal'] }"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
      ></line>
      <line
        v-for="line in verticalLines"
        :key="line.key"
        class="gantt-elastic__grid-line-vertical"
        :style="{ ...root.style['grid-line-vertical'] }"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
      ></line>
      <line
        class="gantt-elastic__grid-line-time"
        :style="{ ...root.style['grid-line-time'] }"
        :x1="root.timeLinePosition.x"
        :y1="root.timeLinePosition.y1"
        :x2="root.timeLinePosition.x"
        :y2="root.timeLinePosition.y2"
      ></line>
    </g>
  </svg>
</template>

<script>
// import dayjs from 'dayjs'

export default {
  name: 'Grid',
  inject: ['root'],
  data() {
    return {}
  },
  computed: {
    /**
     * Generate vertical lines of the grid
     *
     * @returns {array}
     */
    verticalLines() {
      let lines = []
      const state = this.root.state
      state.options.times.steps.forEach((step) => {
        if (this.root.isInsideViewPort(step.offset.px, 1)) {
          // todo 区分工作日
          // let addable = true
          // if (this.root.state.options.calendar.onlyDisplayWorkDay) {
          //   const stepTime = dayjs(step.time).day()
          //   addable = stepTime !== 0 && stepTime !== 6
          // }
          // if (!addable) return
          lines.push({
            key: step.time,
            x1: step.offset.px,
            y1: 0,
            x2: step.offset.px,
            y2:
              state.tasks.length *
                (state.options.row.height + state.options.chart.grid.horizontal.gap * 2) +
              this.root.style['grid-line-vertical']['stroke-width']
          })
        }
      })
      return lines
    },

    /**
     * Generate horizontal lines of the grid
     *
     * @returns {array}
     */
    horizontalLines() {
      let lines = []
      const state = this.root.state.options
      let tasks = this.root.visibleTasks
      for (let index = 0, len = tasks.length; index <= len; index++) {
        const y =
          index * (state.row.height + state.chart.grid.horizontal.gap * 2) +
          this.root.style['grid-line-vertical']['stroke-width'] / 2
        lines.push({
          key: 'hl' + index,
          x1: 0,
          y1: y,
          x2: '100%',
          y2: y
        })
      }
      return lines
    },

    /**
     * Check if specified line is inside viewport (visible)
     *
     * @returns {function}
     */
    inViewPort() {
      return (line) => {
        const state = this.root.state.options
        return line.x1 >= state.scroll.chart.left && line.x1 <= state.scroll.chart.right
      }
    }
  },
  /**
   * Created
   */
  created() {},

  /**
   * Mounted
   */
  mounted() {
    this.$nextTick(() => {
      this.$nextTick(() => {
        // because of stupid slider :/
        this.root.$emit('chart-position-recenter')
      })
    })
  },

  methods: {
    /**
     * Recenter position - go to current time line
     */
    recenterPosition() {
      this.root.$emit('chart-position-recenter')
    }
  }
}
</script>

<style lang="scss">
</style>
