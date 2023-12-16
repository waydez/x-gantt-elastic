// import dayjs from "dayjs"

// just helper to get current dates
function getDate(hours) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const currentDay = currentDate.getDate()
  const timeStamp = new Date(currentYear, currentMonth, currentDay, 0, 0, 0).getTime()
  return new Date(timeStamp + hours * 60 * 60 * 1000).getTime()
}
const dataRange = [
  '2023-11-11',
  '2023-03-01',
  '2023-05-01',
  '2023-09-01',
  '2023-11-19',
  '2023-11-13',
  '2023-11-21',
  '2023-11-27',
  '2023-11-28',
  '2023-11-29',
  '2023-11-30',
  '2023-12-01',
  '2023-12-02',
  '2023-12-06',
  '2023-12-12',
  '2023-12-22',
  '2023-12-30',
  '2023-12-31',
  '2024-01-01',
  '2024-01-05',
  '2024-01-08',
  '2024-01-11',
  '2024-01-15',
  '2024-01-16',
  '2024-01-27'
]
const n = 100
const tasks = []
const colorPool = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#303133', '#F2F6FC']

const randomDate = function () {
  const range = dataRange.length - 1
  const index = parseInt(Math.random() * range)
  return dataRange[index]
}

const randomPrevious = (max) => {
  // const arr = new Array(3).fill(0)
  const set = new Set()
  while (set.size < 2) {
    const id = 'uuid_' + parseInt(Math.random() * (max - 1))
    set.add(id)
  }
  return [...set]
}

const randomColor = () => {
  const range = colorPool.length - 1
  const index = parseInt(Math.random() * range)
  return colorPool[index]
}

for (let i = 0; i < n; i++) {
  let start = randomDate()
  let end = randomDate()
  while (new Date(end).getTime() <= new Date(start).getTime()) {
    start = randomDate()
    end = randomDate()
  }
  let actualStart = ''
  let actualEnd = ''
  let dependentOn = []
  const actual = Math.random() > 0.5
  if (actual) {
    actualStart = randomDate()
    actualEnd = randomDate()
    while (new Date(actualEnd).getTime() <= new Date(actualStart).getTime()) {
      actualStart = randomDate()
      actualEnd = randomDate()
    }
    // dependentOn = (i > 10 && randomPrevious(i)) || []
  }
  let type = 'task'
  const milestone = Math.random() > 0.9
  if (milestone) type = 'milestone'

  const fillColor = '' // randomColor()
  const task = {
    id: 'uuid_' + i,
    uuid_planned_start: start,
    uuid_planned_end: end,
    uuid_actual_start: actualStart,
    uuid_actual_end: actualEnd,
    uuid_task_name: '任务为 ' + i,
    type,
    dependentOn,
    fillColor,
    visible: true,
    direction: 'left'
  }
  tasks.push(task)
}

const options = {
  title: '自定义甘特视图',
  taskMapping: {
    id: 'id',
    progress: 'percent',
    label: 'uuid_task_name',
    // todo
    plannedStart: 'uuid_planned_start',
    plannedEnd: 'uuid_planned_end',
    actualStart: 'uuid_actual_start',
    actualEnd: 'uuid_actual_end'
  },
  // 若 maxHeight 为 0 或者 undefined，则使用 maxRows , horizontalGap 和 rowHeight 计算最大高度
  maxHeight: 0,
  maxRows: 18,
  rowHeight: 30,
  horizontalGap: 4,
  columns: [
    {
      id: 'uuid_task_name',
      label: '任务详情',
      value: 'uuid_task_name',
      display: true,
      expander: true,
      fixed: 'left',
      width: 100
    },
    {
      id: 'uuid_planned_start',
      label: '计划开始时间',
      value: 'uuid_planned_start',
      display: true,
      width: 100,
      // fixed: 'left',
      customSlot: 'uuid_planned_start'
    },
    {
      id: 'uuid_planned_end',
      label: '计划结束时间',
      value: 'uuid_planned_end',
      display: true,
      fixed: 'right',
      width: 100
    },
    {
      id: 'uuid_actual_start',
      label: '实际开始时间',
      value: 'uuid_actual_start',
      display: true,
      width: 100
    },
    {
      id: 'uuid_actual_end',
      label: '实际结束时间',
      value: 'uuid_actual_end',
      display: true,
      width: 100
    }
  ],
  times: {
    firstTime: new Date('2022-08-01').getTime(),
    lastTime: new Date('2024-05-31').getTime(),
    firstTaskTime: new Date('2023-03-01').getTime(),
    lastTaskTime: new Date('2023-11-30').getTime()
  },
  locale: {
    name: 'zh',
    Now: '当前时间',
    'X-Scale': '宽',
    'Y-Scale': '高',
    'Task list width': '列头宽度',
    'Before/After': '时间跨度',
    'Display task list': '显示列头',
    weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    months: [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月'
    ]
  }
}

export { getDate, tasks, options }
