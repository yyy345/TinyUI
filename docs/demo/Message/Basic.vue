<script setup>
  import ElButton from '@/components/Button/Button.vue'
  import ElMessage from '@/components/Message'

  const open = (type) => {
    ElMessage({
      message: 'message消息提示',
      type
    })
  }
</script>

<template>
  <el-button @click="open('success')" type="success">Success</el-button>
  <el-button @click="open('info')" type="info">Info</el-button>
  <el-button @click="open('warning')" type="warning">Warning</el-button>
  <el-button @click="open('error')" type="danger">Error</el-button>
</template>
