<template>
  <g
    v-if="showWorkingDays"
    class="gantt-elastic__chart-days-highlight-container"
    :style="{ ...root.style['chart-days-highlight-container'] }"
  >
    <rect
      v-for="day in workingDays"
      :key="getKey(day)"
      :x="day.offset.px"
      y="0"
      :width="day.width.px"
      height="100%"
      :style="{ ...root.style['chart-days-highlight-rect'] }"
      class="gantt-elastic__chart-days-highlight-rect"
    ></rect>
  </g>
</template>

<script>
import dayjs from 'dayjs'
export default {
  name: 'DaysHighlight',
  inject: ['root'],
  data() {
    return {}
  },
  computed: {
    /**
     * Get working days
     *
     * @returns {array}
     */
    workingDays() {
      return this.root.state.options.times.steps.filter((step) => {
        const stepTime = dayjs(step.time).day()
        // todo 区分工作日
        // if (this.root.state.options.calendar.onlyDisplayWorkDay) {
        //   return stepTime === 0 && stepTime === 6
        // }
        return this.root.state.options.calendar.workingDays.indexOf(stepTime) === -1
      })
    },

    /**
     * Show working days?
     *
     * @returns {bool}
     */
    showWorkingDays() {
      const calendar = this.root.state.options.calendar
      if (
        typeof calendar.workingDays !== 'undefined' &&
        Array.isArray(calendar.workingDays) &&
        calendar.workingDays.length
      ) {
        return true
      }
      return false
    }
  },
  methods: {
    /**
     * Get key
     *
     * @param {object} day
     * @returns {string} key ideintifier for loop
     */
    getKey(day) {
      return dayjs(day.time).format('YYYY-MM-DD')
    }
  }
}
</script>
