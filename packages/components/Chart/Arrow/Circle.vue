<template>
  <circle
    :key="dependencyLine.task_id + '__suffix'"
    :cx="getTaskById(dependencyLine.to_task_id).plannedX"
    :cy="
      getTaskById(dependencyLine.to_task_id).plannedY +
      getTaskById(dependencyLine.to_task_id).height / 2
    "
    r="2"
    stroke="#848484"
    fill="transparent"
    stroke-width="1"
  />
</template>

<script>
export default {
  name: 'Circle'
}
</script>

<style></style>
