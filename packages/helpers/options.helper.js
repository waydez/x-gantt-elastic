/**
 * Helper function to fill out empty options in user settings
 *
 * @param {object} userOptions - initial user options that will merge with those below
 * @returns {object} merged options
 */
export function getOptions(localeName) {
  return {
    title: '甘特视图',
    slots: {
      header: {}
    },
    taskMapping: {
      // todo
      id: 'id',
      label: 'label',
      // todo
      plannedStart: 'plannedStart',
      plannedEnd: 'plannedEnd',
      actualStart: 'actualStart',
      actualEnd: 'actualEnd',
      // duration: 'duration',
      progress: 'progress',
      type: 'type',
      style: 'style',
      collapsed: 'collapsed'
    },
    width: 0,
    height: 0,
    clientWidth: 0,
    outerHeight: 0,
    rowsHeight: 0,
    allVisibleTasksHeight: 0,
    scroll: {
      scrolling: false,
      dragXMoveMultiplier: 3, //*
      dragYMoveMultiplier: 2, //*
      top: 0,
      taskList: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      chart: {
        left: 0,
        right: 0,
        percent: 0,
        timePercent: 0,
        top: 0,
        bottom: 0,
        time: 0,
        timeCenter: 0,
        dateTime: {
          left: '',
          right: ''
        }
      }
    },
    scope: {
      // 最大时间范围区间的 buffer 时间
      before: 0,
      after: 0
    },
    // todo
    times: {
      timeScale: 24 * 60 * 1000,
      timeZoom: 2.5,
      timePerPixel: 1,
      firstTime: new Date('2022-08-01').getTime(),
      lastTime: new Date('2024-05-31').getTime(),
      firstTaskTime: new Date('2023-03-01').getTime(),
      lastTaskTime: new Date('2023-11-30').getTime(),
      totalViewDurationMs: 0,
      totalViewDurationPx: 0,
      stepDuration: 'day', // 时间精度范围
      steps: []
    },
    row: {
      // 甘特图中图形的单行高度
      height: 24
    },
    maxRows: 20, //*
    maxHeight: 0, //*
    chart: {
      grid: {
        buffer: 20,
        horizontal: {
          gap: 7 //*
        }
      },
      progress: {
        width: 20, // 宽度占比
        height: 6, // 高度
        pattern: false, // 图形占比类型
        bar: false // 滚动条类型
      },
      text: {
        offset: 4, //*
        xPadding: 10, //*
        display: true //*
      },
      expander: {
        type: 'chart',
        display: true, //*
        displayIfTaskListHidden: true, //*
        offset: 4, //*
        size: 18
      },
      line: {
        horizontal: false,
        vertical: true
      }
    },
    taskList: {
      display: true, // 控制任务列表是否展示
      resizeAfterThreshold: false, // 在临界值之后调整大小
      widthThreshold: 75, //*
      columns: [
        //*
        {
          id: 0,
          label: 'ID',
          value: 'id',
          width: 40
        }
      ],
      scrollLeft: 0,
      percent: 100, // 任务列表的宽度百分比
      width: 0,
      finalWidth: 0,
      widthFromPercentage: 0,
      minWidth: 180,
      viewWidth: 400,
      expander: {
        type: 'task-list',
        size: 16,
        columnWidth: 24,
        padding: 16,
        margin: 10,
        straight: false
      }
    },
    calendar: {
      // onlyDisplayWorkDay: false,
      workingDays: [1, 2, 3, 4, 5], // 工作日 [1, 2, 3, 4, 5, 6, 0]
      gap: 0, // 日期 和 甘特图下方 的间距
      height: 0,
      strokeWidth: 1,
      hour: {
        height: 20, //*
        display: false, //*
        widths: [],
        maxWidths: { short: 0, medium: 0, long: 0 },
        formatted: {
          long: [],
          medium: [],
          short: []
        },
        format: {
          //*
          long(date) {
            return date.format('HH:mm')
          },
          medium(date) {
            return date.format('HH:mm')
          },
          short(date) {
            return date.format('HH')
          }
        }
      },
      day: {
        height: 20, //*
        display: true, //*
        widths: [],
        maxWidths: { short: 0, medium: 0, long: 0 },
        // 默认自适应，设置后使用对应格式
        // 配置为简洁版内容
        useFormat: 'short',
        format: {
          long(date) {
            return date.format('DD dddd')
          },
          medium(date) {
            return date.format('DD ddd')
          },
          short(date) {
            return date.format('DD')
          }
        }
      },
      month: {
        height: 20, //*
        display: true, //*
        widths: [],
        maxWidths: { short: 0, medium: 0, long: 0 },
        // 默认自适应，设置后使用对应格式
        // 配置为简洁版内容
        useFormat: 'short',
        format: {
          //*
          short(date) {
            return date.format('MM')
          },
          medium(date) {
            return date.format("MMM 'YY")
          },
          long(date) {
            return date.format('MMMM YYYY')
          }
        }
      }
    },
    locale: {
      //*
      name: 'en' || localeName,
      weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
      weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
      weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
      months:
        'January_February_March_April_May_June_July_August_September_October_November_December'.split(
          '_'
        ),
      monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
      weekStart: 1,
      relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
      },
      formats: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd, D MMMM YYYY HH:mm'
      },
      ordinal: (n) => {
        const s = ['th', 'st', 'nd', 'rd']
        const v = n % 100
        return `[${n}${s[(v - 20) % 10] || s[v] || s[0]}]`
      }
    }
  }
}
