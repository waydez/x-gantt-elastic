const _ = require('lodash')
// const arr = [
//   { status: 1, opp: 2, ad: '11' },
//   { status: 1, opp: 2, ad: '22' },
//   { status: 1, opp: 3, ad: '33' },
//   { status: 2, opp: 4, ad: '44' },
//   { status: 3, opp: 5, ad: '55' }
// ]

const tasks = []
const sum = 10

for (let i = 0; i < sum; i++) {
  tasks.push({
    id: 'uuid_' + i,
    name: 'Task:' + (i % 3),
    description: 'Desc:' + (i % 2)
    // status: 'done',
    // added_date: '2020-01-01'
  })
}

const conditions = ['name', 'description']

const gg = ganttFormatGroup(tasks, conditions)
console.log(JSON.stringify(gg, null, 2))

function ganttFormatGroup(tasks, conditions) {
  const r = ganttGroupBy(tasks, conditions)
  const g =  _.flatMapDeep(r)
  // const set = new Set()
  // g.forEach((item) => set.add(item.parentId))
  // const res = _.cloneDeep(g)
  // g.forEach((item, index) => {
  //   if (set.has(item.parentId)) {
  //     res.splice(index, 0, {
  //       id: item.parentId
  //     })
  //     set.delete(item.parentId)
  //   }
  // })
  return g
  // return res
}

function ganttGroupBy(targetList, conditions, parentKey) {
  if (!conditions || !conditions.length) return targetList
  const cloneConditions = _.cloneDeep(conditions)
  const condition = cloneConditions.shift()
  if (!condition) return targetList
  const groups = _.groupBy(targetList, condition)
  if (cloneConditions.length) {
    const groupObj = {}
    Object.entries(groups).forEach(([key, group]) => {
      const fullKey = (parentKey || '') + key
      const tmp = ganttGroupBy(group, cloneConditions, key)
      groupObj[fullKey] = Object.values(tmp)
      // console.log('groupObj[fullKey]', groupObj[fullKey])
      groupObj[fullKey].unshift({
        'uuid_task_name': fullKey,
        id: fullKey,
        parentId: parentKey
      })
    })
    return groupObj
    // return ganttGroupBy(group, cloneConditions, key)
    // return Object.values(groups).map((it) => ganttGroupBy(it, cloneConditions))
  }
  const groupsObj = {}
  Object.entries(groups).forEach(([key, group]) => {
    const fullKey = (parentKey || '') + key
    groupsObj[fullKey] = group.map((item) => {
      return {
        ...item,
        parentId: (parentKey || '') + key
      }
    })
    groupsObj[fullKey].unshift({
      'uuid_task_name': fullKey,
      id: fullKey,
      parentId: parentKey
    })
  })
  return groupsObj
  // const result = Object.entries(groups).map(([key, group]) => {
  //   return group.map((item) => {
  //     return {
  //       ...item,
  //       parentId: (parentKey || '') + key
  //     }
  //   })
  // })
  // return result
}
