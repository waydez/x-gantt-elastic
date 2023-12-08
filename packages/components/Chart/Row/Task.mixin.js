export default {
  props: {
    task: {
      type: Object,
      default: () => {}
    },
    // 不显示前后的 expander 和 label
    noPrefix: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /**
     * Get view box
     *
     * @returns {string}
     */
    getViewBox() {
      const task = this.task
      return `0 0 ${task.width} ${task.height}`
    },

    /**
     * Get group transform
     *
     * @returns {string}
     */
    getGroupTransform() {
      return `translate(${this.task.x} ${this.task.y})`
    },

    /**
     * Should we display expander?
     *
     * @returns {boolean}
     */
    displayExpander() {
      const expander = this.root.state.options.chart.expander
      return (
        expander.display ||
        (expander.displayIfTaskListHidden && !this.root.state.options.taskList.display)
      )
    },

    /**
     *  Get current task fill color
     */
    fillColor() {
      const { fillColor } = this.task
      if (!fillColor) return {}
      return { stroke: fillColor, fill: fillColor }
    }
  },
  methods: {
    /**
     * Emit event
     *
     * @param {string} eventName
     * @param {Event} event
     */
    emitEvent(eventName, event) {
      if (!this.root.state.options.scroll.scrolling) {
        this.root.$emit(`chart-${this.task.type}-${eventName}`, { event, data: this.task })
      }
    }
  }
}
