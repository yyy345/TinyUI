<template>
  <!-- 展示基础 MessageBox 的按钮 -->
  <el-button @click="showMessageBox">showMessageBox</el-button>
</template>
<script setup>
// 引入 MessageBox 服务
import ElMessageBox from '@/components/MessageBox/MessageBox'
// 引入按钮组件
import ElButton from '@/components/Button/Button.vue'

// 点击后展示基础 MessageBox
const showMessageBox = async () => {
  // 等待用户动作结果
  const action = await ElMessageBox({
    // 确认文字、标题和内容
    confirmBtnText: 'Ok',
    title: 'MessageBox',
    content: 'This is ConfirmMessageBox content'
  })
  // 输出用户最终动作结果
  console.log('MessageBox action:', action)
}
</script>
