const config = require('./config')
const { colsConfig } = require('./data')
const columns = Object.keys(colsConfig).map((key) => {
  const found = Object.keys(config).find((c) => config[c] === key)
  if (found)
    return {
      id: key,
      label: colsConfig[key].label,
      value: key,
      display: true,
      width: 100,
      customSlot: colsConfig[key].customSlot
    }
})
console.log(columns)
// const options = {
//   taskMapping: {
//     progress: 'percent',
//     start: 'plannedStart',
//     label: 'taskName'
//   },
//   maxRows: 100,
//   maxHeight: 900,
//   title: {
//     label: 'Your project title as html (link or whatever...)',
//     html: false
//   },
//   row: {
//     height: 24
//   },
//   times: {
//     timeScale: 24 * 60 * 1000,
//     timeZoom: 4, //*
//     timePerPixel: 0,
//     firstTime: new Date('2023-4-30').getTime().valueOf(),
//     lastTime: new Date('2024-5-31').getTime().valueOf(),
//     firstTaskTime: new Date('2023-3-1').getTime().valueOf(),
//     lastTaskTime: new Date('2023-11-30').getTime().valueOf(),
//     totalViewDurationMs: 0,
//     totalViewDurationPx: 0,
//     stepDuration: 'day'
//   },
//   calendar: {
//     month: {
//       display: false
//     },
//     day: {
//       display: true
//     },
//     hour: {
//       display: false
//     }
//   },
//   chart: {
//     progress: {
//       bar: true
//     },
//     expander: {
//       display: true
//     }
//   },
//   taskList: {
//     display: true, //*
//     resizeAfterThreshold: false, //*
//     widthThreshold: 75, //*
//     expander: {
//       straight: false
//     },
//     columns: columns
//   },
//   locale: {
//     name: 'zh',
//     Now: '当前时间',
//     'X-Scale': '宽',
//     'Y-Scale': '高',
//     'Task list width': '列头宽度',
//     'Before/After': '时间跨度',
//     'Display task list': '显示列头',
//     weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
//     months: [
//       '一月',
//       '二月',
//       '三月',
//       '四月',
//       '五月',
//       '六月',
//       '七月',
//       '八月',
//       '九月',
//       '十月',
//       '十一月',
//       '十二月'
//     ]
//   }
// }

// console.log('options', options)
