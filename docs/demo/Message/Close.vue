<script setup>
  import ElButton from '@/components/Button/Button.vue'
  import ElMessage from '@/components/Message'

  const open = () => {
    ElMessage({
      message: 'message消息提示',
      showClose: true,
      duration: 0
    })
  }
</script>

<template>
  <el-button @click="open" type="info">Info</el-button>
</template>
