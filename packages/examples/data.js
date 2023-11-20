const colsConfig = {
  uuid_task_name: {
    label: '任务详情',
    customSlot: 'uuid_task_name'
  },
  uuid_planned_start: {
    label: '计划开始时间',
    customSlot: 'uuid_planned_start'
  },
  uuid_planned_end: {
    label: '计划结束时间',
    customSlot: 'uuid_planned_end'
  },
  uuid_actual_start: {
    label: '实际开始时间',
    customSlot: 'uuid_actual_start'
  },
  uuid_actual_end: {
    label: '实际结束时间',
    customSlot: 'uuid_actual_end'
  }
}
const template = {
  uuid_planned_start: '2019-01-01',
  uuid_planned_end: '2019-01-01',
  uuid_actual_start: '2019-01-01',
  uuid_actual_end: '2019-01-01',
  uuid_task_name: '任务为 xxxxxxxx'
}
const businessData = []
for (let i = 0 ; i < 30; i++) {
  businessData.push(template)
}
// console.log(businessData)
module.exports = {
  colsConfig,
	businessData
}