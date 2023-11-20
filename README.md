# x-gantt-elastic

> 方便快速构建、启动项目工程

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

1. 组件


```vue
<gantt-elastic
  :options="options"
  :tasks="tasks"
  :dynamic-style="dynamicStyle"
  @tasks-changed="tasksUpdate"
  @options-changed="optionsUpdate"
  @dynamic-style-changed="styleUpdate"
>
  <template slot="header"></template>
  <template slot="footer"></template>
</gantt-elastic>
```

2. 参数

| 字段          | 类型   | 默认值 |
| ------------- | ------ | ------ |
| tasks         | Array  | []     |
|               |        |        |
| options       | Object |        |
| - taskMapping | Object | {}     |
| - maxRows     | Number | 100    |
| - maxHeight   | Number | 900    |
| - columns     | Array  | []     |
| - locale      | Object | {}     |
|               |        |        |
| dynamic-style | Object | {}     |

3. 方法

| 方法                  | 描述           | 返回值  |
| --------------------- | -------------- | ------- |
| tasks-changed         | 任务项发生改变 | tasks   |
| options-changed       | 配置项发生改变 | options |
| dynamic-style-changed | 样式组发生改变 | style   |

4. 插槽

| 插槽   | 描述           |
| ------ | -------------- |
| header | 甘特图头部插槽 |
| footer | 甘特图尾部插槽 |

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
optiton: {
  taskMapping: {
    label: 'uuid_task_name'
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

