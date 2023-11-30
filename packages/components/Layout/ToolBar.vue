<template>
  <div class="gantt-tool-bar">
    <div class="gantt-tool-bar-left">
      <div class="gantt-tool-bar__item gantt-only-workday">
        <label>{{ onlyWorkDay }}</label>
        <el-switch v-model="onlyDisplayWorkDay" />
      </div>
      <div class="gantt-tool-bar__item gantt-task-list-width">
        <label>{{ taskListWidth }}</label>
        <el-slider
          v-model="taskListWidthPercent"
          :min="200"
          :max="root.state.options.taskList.finalWidth"
        ></el-slider>
      </div>
      <div class="gantt-tool-bar__item gantt-download-pic">
        <label>{{ exportPicture }}</label>
        <i class="el-icon-download" @click.prevent="handleDownload"></i>
      </div>
    </div>
    <div class="gantt-tool-bar-right">
      <div class="gantt-tool-bar__item gantt-today">
        <el-button type="text" size="mini" round @click.prevent="recenterPosition">
          {{ toNow }}
        </el-button>
      </div>
      <div class="gantt-tool-bar__item gantt-time-dimension">
        <el-radio-group v-model="timeScale" size="mini">
          <el-radio-button v-for="item in dimension" :key="item.label" :label="item.label">
            {{ item.text }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script>
const TIME_DIMENSION = {
  year: {
    timeZoom: 1,
    timeScale: 365 * 24 * 60 * 1000
  },
  month: {
    timeZoom: 0.5,
    timeScale: 30 * 24 * 60 * 1000
  },
  week: {
    timeZoom: 1,
    timeScale: 7 * 24 * 60 * 1000
  },
  day: {
    timeZoom: 1.5,
    timeScale: 24 * 60 * 1000
  }
}
const TIME_DIMENSION_LABEL = Object.keys(TIME_DIMENSION)

export default {
  name: 'GanttToolBar',
  components: {},
  inject: ['root'],
  data() {
    return {
      onlyWorkDay: '仅展示工作日',
      taskListWidth: '任务列表宽度',
      exportPicture: '导出图片',
      toNow: '今天',
      dimension: [
        { label: 'day', text: '日' },
        { label: 'week', text: '周' },
        { label: 'month', text: '月' }
        // { label: 'year', text: '年' }
      ],
      onlyDisplayWorkDay: false,
      viewWidth: 0
    }
  },
  computed: {
    options() {
      return this.root.state.options
    },
    // onlyDisplayWorkDay: {
    //   get() {
    //     return !!this.options.calendar.onlyDisplayWorkDay
    //   },
    //   set(val) {
    //     this.options.calendar.onlyDisplayWorkDay = val
    //     // this.root.recalculateTimes()
    //     // this.root.calculateSteps()
    //   }
    // },
    timeScale: {
      get: function () {
        const timeScale = this.options.times.timeScale
        const found = TIME_DIMENSION_LABEL.find(
          (key) => timeScale === TIME_DIMENSION[key].timeScale
        )
        return found || ''
      },
      set: function (timeScale) {
        if (TIME_DIMENSION[timeScale]) {
          this.setCalendarDisplay(timeScale)
          this.options.times.stepDuration = timeScale
          this.options.times.timeScale = TIME_DIMENSION[timeScale].timeScale // 365 * 30 * 24 * 60 * 1000
          this.root.$emit('times-timeZoom-change', TIME_DIMENSION[timeScale].timeZoom)
        }
      }
    },
    taskListWidthPercent: {
      get: function () {
        return this.viewWidth
      },
      set: function (value) {
        this.viewWidth = Number(value)
        this.root.$emit('taskList-view-width-change', Number(value))
      }
    }
  },
  created() {
    this.viewWidth = this.root.state.options.taskList.viewWidth
  },
  methods: {
    handleDownload() {
      this.root.$emit('chart-download-with-pic')
    },
    recenterPosition() {
      this.root.$emit('chart-position-recenter')
    },
    setCalendarDisplay(value) {
      switch (value) {
        case 'year':
          this.options.calendar.month.display = true
          this.options.calendar.day.display = false
          this.options.calendar.hour.display = false
          break
        case 'month':
          this.options.calendar.month.display = true
          this.options.calendar.day.display = false
          this.options.calendar.hour.display = false
          break
        case 'week':
          this.options.calendar.month.display = true
          this.options.calendar.day.display = true
          this.options.calendar.hour.display = false
          break
        case 'day':
          this.options.calendar.month.display = true
          this.options.calendar.day.display = true
          this.options.calendar.hour.display = false
          break

        default:
          break
      }
    }
  }
}
</script>

<style lang="scss">
.gantt-tool-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  .gantt-tool-bar__item {
    margin: 0 12px;
  }
  &-left {
    display: flex;
    .gantt-task-list-width {
      // width: 500px;
      display: flex;
      // justify-content: space-between;
      align-items: center;
      .el-slider {
        width: 200px;
      }
    }
    .gantt-only-workday {
      display: flex;
      align-items: center;
      .el-switch,
      .el-switch__core {
        width: 32px;
        height: 16px;
        line-height: 16px;
      }
      .el-switch__core::after {
        width: 12px;
        height: 12px;
        height: 12px;
      }
      .el-switch.is-checked .el-switch__core::after {
        margin-left: -14px;
      }
    }
    .gantt-download-pic {
      display: flex;
      // justify-content: space-between;
      align-items: center;
      padding: 0 10px;
      cursor: pointer;
      & > i {
        font-size: 16px;
        &:hover {
          color: #5cb6ff;
        }
      }
    }
  }
  &-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .gantt-time-dimension {
      margin-left: 10px;
    }
  }
}
</style>
