<template>
  <div
    :class="getClassPrefix() + '-wrapper'"
    :style="{ ...root.style[getClassPrefix(false) + '-wrapper'], ...style }"
  >
    <svg
      v-if="allChildren.length"
      :class="getClassPrefix() + '-content'"
      :style="{ ...root.style[getClassPrefix(false) + '-content'] }"
      :width="options.size"
      :height="options.size"
      @click="toggle"
    >
      <rect
        :class="getClassPrefix() + '-border'"
        :style="{ ...root.style[getClassPrefix(false) + '-border'], ...borderStyle }"
        :x="border"
        :y="border"
        :width="options.size - border * 2"
        :height="options.size - border * 2"
        rx="2"
        ry="2"
      ></rect>
      <line
        v-if="allChildren.length"
        :class="getClassPrefix() + '-line'"
        :style="{ ...root.style[getClassPrefix(false) + '-line'] }"
        :x1="lineOffset"
        :y1="options.size / 2"
        :x2="options.size - lineOffset"
        :y2="options.size / 2"
      ></line>
      <line
        v-if="collapsed"
        :class="getClassPrefix() + '-line'"
        :style="{ ...root.style[getClassPrefix(false) + '-line'] }"
        :x1="options.size / 2"
        :y1="lineOffset"
        :x2="options.size / 2"
        :y2="options.size - lineOffset"
      ></line>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Expander',
  inject: ['root'],
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    const border = 0.5
    return {
      border,
      borderStyle: {
        'stroke-width': border
      },
      lineOffset: 5
    }
  },
  computed: {
    style() {
      if (this.type !== 'taskList') {
        return {}
      }
      const margin = this.root.state.options.taskList.expander.margin
      const padding =
        this.tasks[0].parents.length * this.root.state.options.taskList.expander.padding
      return {
        'padding-left': padding + margin + 'px',
        margin: 'auto 0'
      }
    },
    /**
     * Get all tasks
     *
     * @returns {array}
     */
    allChildren() {
      const children = []
      this.tasks.forEach((task) => {
        task.allChildren.forEach((childId) => {
          children.push(childId)
        })
      })
      return children
    },
    /**
     * Is current expander collapsed?
     *
     * @returns {boolean}
     */
    collapsed() {
      if (this.tasks.length === 0) return false
      return this.tasks.every((t) => t.collapsed)
    }
  },
  methods: {
    /**
     * Get specific class prefix
     *
     * @returns {string}
     */
    getClassPrefix(full = true) {
      return `${full ? 'gantt-elastic__' : ''}${this.options.type}-expander`
    },
    /**
     * Toggle expander
     */
    toggle() {
      if (this.tasks.length === 0) return
      const collapsed = !this.collapsed
      this.root.toggleCollapsed(this.tasks, collapsed)
    }
  }
}
</script>
