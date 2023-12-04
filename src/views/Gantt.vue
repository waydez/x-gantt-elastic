<template>
  <div class="gantt">
    <div class="gantt-header">
      <div>
        <el-button v-for="item in btnList" :key="item.type" icon="mdi-plus" @click="addItem(item)">
          {{ item.label }}
        </el-button>
      </div>
      <div class="field-list">
        <ul style="list-style: none; display: flex">
          <template v-for="item in options.columns">
            <div :key="item.id" style="display: flex">
              <input v-model="item.display" type="checkbox" />
              <li style="margin: 0 10px">
                {{ item.label }}
              </li>
            </div>
          </template>
        </ul>
      </div>
      <div class="task-group">
        <el-button icon="mdi-plus" type="text" @click="doGroupFilter">
          {{ doGroup }}
        </el-button>
        <el-select v-model="groupConditions" multiple collapse-tags>
          <el-option
            v-for="item in options.columns"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="gantt-body">
      <gantt-elastic
        ref="ganttRef"
        :options="options"
        :tasks="proxyTasks"
        :dynamic-style="dynamicStyle"
        @tasks-changed="tasksUpdate"
        @options-changed="optionsUpdate"
        @dynamic-style-changed="styleUpdate"
      >
        <!-- <template slot="header">
          <gantt-header />
        </template> -->
        <template v-slot:uuid_planned_start="scopeSlot">
          <div>
            {{ scopeSlot.row.uuid_planned_start }}
          </div>
        </template>
        <template v-slot:uuid_planned_end="scopeSlot">
          <div v-show="scopeSlot.row.type !== 'group'">
            {{ scopeSlot.row.uuid_planned_start }}
          </div>
        </template>
        <template slot="footer">
          <custom-block />
        </template>
      </gantt-elastic>
    </div>
  </div>
</template>

<style></style>

<script>
import dayjs from 'dayjs'
import GanttElastic from '@packages/components/GanttElastic.vue'
// import GanttHeader from 'gantt-elastic-header'
import CustomBlock from './custom-block.vue'
import { getDate, tasks, options } from './mock-task.js'
// import { customColumns, taskMapping } from '../constant/index'

export default {
  name: 'Gantt',
  components: {
    GanttElastic,
    // GanttHeader,
    CustomBlock
  },
  data() {
    return {
      scaleList: [
        {
          label: '年',
          value: 'year'
        },
        {
          label: '月',
          value: 'month'
        },
        {
          label: '日',
          value: 'day'
        }
        // {
        // 	label: "小时",
        // 	value: "hour"
        // }
      ],
      tasks,
      options,
      dynamicStyle: {},
      lastId: 16,
      btnList: [
        {
          type: 'project',
          label: 'Add project'
        },
        {
          type: 'milestone',
          label: 'Add milestone'
        },
        {
          type: 'group',
          label: 'Add group'
        },
        {
          type: 'task',
          label: 'Add task'
        }
      ],
      groupConditions: [],
      proxyTasks: tasks,
      doGroup: '进行分组'
    }
  },
  computed: {},
  methods: {
    addItem(item) {
      // const random = parseInt(Math.random() * 10)
      const plannedStart = getDate(0)
      const plannedEnd = getDate(24 * 2)
      this.proxyTasks.unshift({
        type: item.type,
        id: this.lastId++,
        uuid_planned_start: plannedStart,
        uuid_planned_end: plannedEnd,
        uuid_task_name: '新增任务item'
      })
    },
    tasksUpdate() {},
    optionsUpdate(options) {},
    styleUpdate(style) {},
    startClick() {
      console.log('startClick')
    },
    print() {
      // eslint-disable-next-line no-debugger
      debugger
      let element = document.querySelector('.gantt-elastic__main-view')

      // 获取元素的大小和位置
      var rect = element.getBoundingClientRect()

      // 计算元素在画布上的位置和大小
      var canvasWidth = 300 // 画布的宽度
      var canvasHeight = 200 // 画布的高度
      var scaleX = canvasWidth / rect.width
      var scaleY = canvasHeight / rect.height
      var scale = Math.min(scaleX, scaleY)
      var newWidth = rect.width * scale
      var newHeight = rect.height * scale
      var newX = (canvasWidth - newWidth) / 2
      var newY = (canvasHeight - newHeight) / 2

      // 获取元素的HTML结构
      var html = element.outerHTML

      // 将元素绘制到画布上
      var canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      var context = canvas.getContext('2d')
      var image = new Image()
      image.onload = function () {
        context.drawImage(image, newX, newY, newWidth, newHeight)
        var dataUrl = canvas.toDataURL('image/png')
        var img = new Image()
        img.src = dataUrl
        img.onload = function () {
          // 保存图片到文件
          var link = document.createElement('a')
          link.href = img.src
          link.download = 'screenshot.png'
          link.click()
        }
      }
      image.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
    },
    formatDate(timestamp) {
      return dayjs(timestamp).format('YYYY-MM-DDTHH:mm:ss')
    },
    doGroupFilter() {
      const conditions = this.groupConditions
      let tasks = []
      if (!conditions || !conditions.length) {
        tasks = this.tasks
      } else {
        tasks = this.$refs.ganttRef.handleFilterGroup(this.tasks, conditions, this.options)
      }
      this.proxyTasks = tasks
    }
  }
}
</script>

<style lang="scss">
.gantt {
  padding: 10px;
  width: 100%;
  // height: 100%;
  box-sizing: border-box;
  .gantt-header {
    display: flex;
    .task-group {
      display: flex;
      justify-content: center;
      align-items: center;
      .el-button {
        margin: 0 8px;
      }
      .el-select {
        .el-input__inner {
          padding: 0 24 0 0px;
          height: 32px;
          line-height: 32px;
        }
        .el-input__icon {
          height: 32px;
          line-height: 32px;
        }
      }
    }
  }
  .gantt-body {
    width: 100%;
  }
}
</style>
