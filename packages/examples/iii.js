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
    description: 'Desc:' + (i % 2),
    status: 'done' + (i % 5),
    // added_date: '2020-01-01'
  })
}

const conditions = ['name', 'description', 'status']

const gg = ganttFormatGroup(tasks, conditions)
console.log(JSON.stringify(gg, null, 2))

function ganttFormatGroup(tasks, conditions) {
  const r = ganttGroupBy(tasks, conditions)
  const g = r // _.flatMapDeep(r)
  return g
}

function ganttGroupBy(targetList, conditions, parentKey) {
  // console.log('parentKey', parentKey)
  if (!conditions || !conditions.length) return targetList
  const cloneConditions = _.cloneDeep(conditions)
  const condition = cloneConditions.shift()
  if (!condition) return targetList
  const groups = _.groupBy(targetList, condition)

  const recursively = !!cloneConditions.length
  const result = Object.entries(groups).map(([key, group]) => {
    // console.log('parentKey', parentKey)
    const fullKey = (parentKey || '') + key
    const tmpGroup = recursively
      ? ganttGroupBy(group, cloneConditions, fullKey)
      : group.map((item) => {
          return {
            ...item,
            parentId: (parentKey || '') + key
          }
        })
    tmpGroup.unshift({
      uuid_task_name: fullKey,
      id: fullKey,
      parentId: parentKey
    })
    return tmpGroup
  })
  return result
}
