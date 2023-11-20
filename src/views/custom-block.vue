<template>
  <div class="custom-block">
    <el-divider>{{ message }}</el-divider>
  </div>
</template>

<script>
export default {
  name: 'CustomBlock',
  data() {
    return {
      message: '自定义区域'
    }
  }
}
</script>

<style>
.custom-block {
  width: 100%;
  height: 32px;
}
</style>
