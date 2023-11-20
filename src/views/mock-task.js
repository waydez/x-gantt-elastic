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
const tasks = [
  {
    id: 'uuid_001',
    uuid_planned_start: '2023-11-11',
    uuid_planned_end: '2023-11-19',
    // uuid_actual_start: '2023-11-13',
    // uuid_actual_end: '2023-11-21',
    uuid_task_name: '任务为 1',
    // duration: 15 * 24 * 60 * 60 * 1000,
    percent: 85,
    type: 'task'
  },
  {
    id: 'uuid_002',
    uuid_planned_start: '2023-03-01',
    uuid_planned_end: '2023-05-01',
    uuid_actual_start: '2023-05-05',
    uuid_actual_end: '2023-09-01',
    uuid_task_name: '任务为 2',
    // duration: 15 * 24 * 60 * 60 * 1000,
    percent: 85,
    type: 'task'
  },
  {
    id: 'uuid_003',
    uuid_planned_start: '2023-11-11',
    uuid_planned_end: '2023-11-19',
    uuid_actual_start: '2023-11-13',
    uuid_actual_end: '2023-11-21',
    uuid_task_name: '任务为 3',
    // duration: 15 * 24 * 60 * 60 * 1000,
    percent: 85,
    type: 'task'
  },
  {
    id: 'uuid_004',
    uuid_planned_start: '2023-05-01',
    uuid_planned_end: '2023-07-01',
    uuid_actual_start: '2023-05-01',
    uuid_actual_end: '2023-09-01',
    uuid_task_name: '任务为 4',
    // duration: 15 * 24 * 60 * 60 * 1000,
    percent: 85,
    type: 'task'
  },
  {
    id: 'uuid_005',
    uuid_planned_start: '2023-11-01',
    uuid_planned_end: '2023-11-06',
    uuid_actual_start: '2023-11-07',
    uuid_actual_end: '2023-11-11',
    uuid_task_name: '任务为 5',
    // duration: 15 * 24 * 60 * 60 * 1000,
    percent: 75,
    type: 'task'
  },
  {
    id: 'uuid_006',
    uuid_planned_start: '2023-11-20',
    uuid_planned_end: '2023-11-27',
    uuid_actual_start: '2023-11-21',
    uuid_actual_end: '2023-11-28',
    uuid_task_name: '任务为 6',
    // duration: 15 * 24 * 60 * 60 * 1000,
    percent: 65,
    type: 'task',
    parentId: 'uuid_005'
  },
  {
    id: 'uuid_007',
    parentId: 'uuid_006',
    dependentOn: ['uuid_003', 'uuid_005'],
    uuid_planned_start: '2023-11-22',
    uuid_planned_end: '2023-11-29',
    uuid_actual_start: '2023-11-23',
    uuid_actual_end: '2023-11-30',
    uuid_task_name: '任务为 7',
    // duration: 15 * 24 * 60 * 60 * 1000,
    percent: 35,
    type: 'task'
  },
  {
    id: 'uuid_008',
    parentId: 'uuid_007',
    uuid_planned_start: '2023-12-01',
    uuid_planned_end: '2023-12-04',
    uuid_actual_start: '2023-12-02',
    uuid_actual_end: '2023-12-05',
    uuid_task_name: '任务为 8',
    // duration: 15 * 24 * 60 * 60 * 1000,
    percent: 15,
    type: 'task'
  }
]

const options = {
  taskMapping: {
    progress: 'percent',
    label: 'uuid_task_name',
    // todo
    plannedStart: 'uuid_planned_start',
    plannedEnd: 'uuid_planned_end',
    actualStart: 'uuid_actual_start',
    actualEnd: 'uuid_actual_end'
  },
  maxRows: 100,
  maxHeight: 900,
  columns: [
    {
      id: 'uuid_task_name',
      label: '任务详情',
      value: 'uuid_task_name',
      display: true,
      expander: true,
      width: 100
    },
    {
      id: 'uuid_planned_start',
      label: '计划开始时间',
      value: 'uuid_planned_start',
      display: true,
      width: 100,
      customSlot: 'uuid_planned_start'
    },
    {
      id: 'uuid_planned_end',
      label: '计划结束时间',
      value: 'uuid_planned_end',
      display: true,
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
