<template>
  <!-- 展示确认框 MessageBox 的按钮 -->
  <el-button @click="showConfirmMessageBox" type="danger">ConfirmMessageBox</el-button>
</template>
<script setup>
// 引入 MessageBox 服务
import ElMessageBox from '@/components/MessageBox/MessageBox'
// 引入按钮组件
import ElButton from '@/components/Button/Button.vue'

// 点击后展示确认框 MessageBox
const showConfirmMessageBox = async () => {
  // 等待用户动作结果
  const action = await ElMessageBox.confirm({
    // 是否显示取消按钮
    showCancelBtn: true,
    // 确认按钮文字
    confirmBtnText: '确定',
    // 取消按钮文字
    cancelBtnText: '取消',
    // 弹窗标题
    title: 'ConfirmMessageBox',
    // 弹窗内容
    content: 'This is ConfirmMessageBox content'
  })
  // 输出用户最终动作结果
  console.log('ConfirmMessageBox action:', action)
}
</script>
