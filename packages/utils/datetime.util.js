export function getWeekdays(startDate, endDate) {
  // 字符串转为日期
  const start = new Date(startDate)
  const end = new Date(endDate)
  // 时间戳
  const startTime = start.getTime()
  const endTime = end.getTime()
  //共多少天
  const days = Math.abs((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1
  //开始是周几
  let startweek = start.getDay()
  //有几个周六或周日
  let weeks = 0
  for (var i = 0; i < days; i++) {
    //如果开始日期是周六日，weeks+1,否则，验证下一天
    if (startweek == 0 || startweek == 6) {
      weeks++
    }
    //下一天的时间戳
    startweek = startTime + 1000 * 60 * 60 * 24 * (i + 1)
    //下一天是周几
    startweek = new Date(startweek).getDay()
  }
  // 总天数-周日天数
  const num = days - weeks
  return num
}

export function minDateTime(dates) {
  if (!dates.length) return ''
  let minIndex = 0
  for (let i = 1; i < dates.length; i++) {
    if (new Date(dates[i]).getTime() < new Date(dates[minIndex]).getTime()) minIndex = i
  }
  return dates[minIndex]
}

export function maxDateTime(dates) {
  if (!dates.length) return ''
  let maxIndex = 0
  for (let i = 1; i < dates.length; i++) {
    if (new Date(dates[i]).getTime() > new Date(dates[maxIndex]).getTime()) maxIndex = i
  }
  return dates[maxIndex]
}

export function rangeDateTime(dates) {
  if (!dates.length) return ''
  let minIndex = 0
  let maxIndex = 0
  for (let i = 1; i < dates.length; i++) {
    if (new Date(dates[i]).getTime() < new Date(dates[minIndex]).getTime()) minIndex = i
    if (new Date(dates[i]).getTime() > new Date(dates[maxIndex]).getTime()) maxIndex = i
  }
  return {
    min: dates[minIndex],
    max: dates[maxIndex]
  }
}
