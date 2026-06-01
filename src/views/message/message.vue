<script setup lang="ts">
  import ElButton from '../../components/Button/Button.vue'
  import ElMessage from '@/components/Message'

  defineOptions({
    name: 'MessageView'
  })
</script>

<template>
  <div>
    <el-button type="success" @click="ElMessage.success('This is a success text')">success</el-button>
    <el-button type="warning" @click="ElMessage.warning('This is a warning text')">warning</el-button>
    <el-button type="info" @click="ElMessage('This is an info text')">message</el-button>
    <el-button type="danger" @click="ElMessage.error('This is an error text')">error</el-button>
  </div>
</template>

<style lang="">
</style>
