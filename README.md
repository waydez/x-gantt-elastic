# x-gantt-elastic

> 弹性甘特图，提供了方便快捷的甘特图工具开发

## 开始

运行当前项目需要环境： `node >= 16`, `pnpm`, `python2`.

对于 windows, 还需要安装 `msbuild tools 2017`.

### 安装

```shell
# install dependencies
pnpm install

# serve with hot reload at localhost:8080
pnpm serve
```

### 打包

```shell
# build packages/
pnpm lib

# publish packages/
pnpm publish --access public
```

## 开发

### 使用

1. 引入

```vue
// 组件内按需引入
<script>
import { XGanttElastic } from "@rabkit/x-gantt-elastic"
export default {
  components: { XGanttElastic }
}
</script>

```

```js
// main.js 中全量引入
import XGanttElasticPlugin from "@rabkit/x-gantt-elastic"
Vue.use(XGanttElasticPlugin)
```

2. 组件


```vue
<x-gantt-elastic
  :options="options"
  :tasks="tasks"
  :dynamic-style="dynamicStyle"
  @tasks-changed="tasksUpdate"
  @options-changed="optionsUpdate"
  @dynamic-style-changed="styleUpdate"
>
  <template slot="header"></template>
  <template slot="footer"></template>
</x-gantt-elastic>
```

3. 参数

   **tasks**

   描述：当前甘特图的任务数据列表

   类型：`Array`

   默认值：`[]`

   ```js
   // 数组项示例
   {
     id: '',
     label: '',
     plannedStart: '',
     plannedEnd: '',
     actualStart: '',
     actualEnd: ''
     type: 'task' | 'milestone' | 'group',
     dependentOn: ['id1', 'id2'],
     fillColor: '',
     visible: true | false,
     direction: 'left' | 'right'
   }
   ```

   

   **options**

   - title

     描述：当前甘特图的标题，位于甘特图左上方

     类型：`String`

     默认值：`''`

   - taskMapping

     描述：当前甘特图的任务字段映射列表

     类型：`Object`

     默认值：

     ```js
     {
         id: 'id',
         label: 'label',
         plannedStart: 'plannedStart',
         plannedEnd: 'plannedEnd',
         actualStart: 'actualStart',
         actualEnd: 'actualEnd'
     },
     ```

   - maxRows

     描述：当前甘特图容器可展示的最大行数，超过最大行数会显示滚动条

     类型：`Number`

     默认值：`20`

   - rowHeight

     描述：当前甘特图图形的行高

     类型：`Number`

     默认值：30`

   - horizontalGap

     描述：当前甘特图图形的行上下间距

     类型：`Number`

     默认值：`4`

   - maxHeight

     描述：当前甘特图最大高度，若 maxHeight 为 0 或者 undefined，则使用 maxRows , horizontalGap 和 rowHeight 计算最大高度

     类型：`Number`

     默认值：`0`

   - columns

     描述：当前甘特图的任务列信息

     类型：`Array`

     默认值：`[]`

     ```js
     // 配置项示例
     {
       id: 'uuid_task_name',
       label: '任务详情',
       value: 'uuid_task_name',
       display: true | false,
       expander: true | false,
       fixed: 'left' | 'right',
       width: 100
     }
     ```

     

   - locale

     描述：当前甘特图中的文案配置信息

     类型：`Object`

     默认值：`{}`

   

   **dynamic-style**

   类型：Object

   默认值：{}

   

> 不推荐使用 `dynamic-style` 来设置组件中的样式，会影响调试的效率以及可能会产生无法预料的样式问题。
>
> 推荐使用外部样式加 `!important`进行覆盖，未来会将`dynamic-style`该配置完全迭代废弃掉。



4. 回调事件

**基本生命周期**

- created
- before-mount
- ready
- mounted
- before-update
- updated
- before-destroy
- destroyed

**甘特图配置**

- options-changed

**任务列表相关**

- tasks-changed
- task-row-click
- taskList-container-scroll-horizontal
- taskList-display-toggle
- taskList-view-width-change
- taskList-row-click
- taskList-column-width-change-start
- taskList-column-width-change
- taskList-column-width-change-stop

**时间日期相关**

- times-timeZoom-change
- calendar-recalculate

**图形图标相关**

- chart-row-click
- chart-refresh
- chart-position-recenter
- chart-scroll-horizontal
- chart-scroll-vertical
- chart-wheel







| 方法                  | 描述               | 返回值        |
| --------------------- | ------------------ | ------------- |
| tasks-changed         | 任务项发生改变     | tasks         |
| options-changed       | 配置项发生改变     | options       |
| dynamic-style-changed | 样式组发生改变     | style         |
| task-row-click        | 任务行点击事件     | {event, task} |
| chart-row-click       | 图形块的行点击事件 | {event, task} |
| calendar-recalculate  | 日期计算事件       | void          |
|                       |                    |               |

5. 插槽

| 插槽   | 描述                                   |
| ------ | -------------------------------------- |
| header | 甘特图头部插槽，可以覆盖默认头部工具栏 |
| footer | 甘特图尾部插槽                         |

除了 `header`和`footer`两个固定插槽，还提供了表格每一列的插槽，使用方法如下：

```js
// 确定 tasks 的数据，此时需要自定义 uuid_task_name 这个字段的组件插槽
const tasks = [
  {
    id: 'uuid_001',
    uuid_task_name: '任务为 1',
    percent: 85,
    type: 'task'
  }
]
// 定义 options 中的 columns
const options = {
  taskMapping: {
    id: 'id',
    label: 'uuid_task_name',
    plannedStart: 'uuid_planned_start',
    plannedEnd: 'uuid_planned_end',
    actualStart: 'uuid_actual_start',
    actualEnd: 'uuid_actual_end'
  },
  columns: [
    {
      id: 'uuid_task_name',
      label: '任务详情',
      value: 'uuid_task_name',
      display: true,
      customSlot: 'uuid_task_name'
    }
  ]
}
```

然后就可以通过以下方式来设置每一行的该字段组件插槽了

```vue
<gantt-elastic
  :options="options"
  :tasks="tasks"
>
  <template v-slot:uuid_planned_start="scopeSlot">
    <div>
      {{ scopeSlot.row.uuid_planned_start }}
    </div>
  </template>
</gantt-elastic>
```

