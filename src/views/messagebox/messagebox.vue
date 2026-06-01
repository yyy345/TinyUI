<template lang="">
  <!-- 页面根节点 -->
  <div>
    <!-- 普通 MessageBox 按钮 -->
    <el-button @click="showMessageBox">showMessageBox</el-button>
    <!-- Confirm MessageBox 按钮 -->
    <el-button @click="showConfirmMessageBox">showConfirmMessageBox</el-button>
    <!-- Alert MessageBox 按钮 -->
    <el-button @click="showAlertMessageBox">showAlertMessageBox</el-button>
    <!-- 展示最近一次用户操作结果 -->
    <p>last action: {{ actionText }}</p>
  </div>
</template>
<script lang="ts" setup>
// 引入 ref，用来保存页面展示的动作结果
import { ref } from 'vue'
// 引入 MessageBox 服务
import ElMessageBox from '../../components/MessageBox/MessageBox'
// 引入按钮组件
import ElButton from '../../components/Button/Button.vue'
// 引入动作类型，保证结果值受类型约束
import type { ActionType } from '../../components/MessageBox/types'

// 定义当前页面组件名称
defineOptions({
  name: 'ElMessageBoxView'
})

// 保存最近一次动作结果，默认显示 none
const actionText = ref<ActionType | 'none'>('none')

// 展示普通 MessageBox
const showMessageBox = async () => {
  // 调用 MessageBox，并等待用户的实际动作结果
  const action = await ElMessageBox({
    // 确认文字、标题和内容
    confirmBtnText: 'Ok',
    title: 'MessageBox',
    content: 'This is ConfirmMessageBox content'
  })
  // 将动作结果同步到页面上
  actionText.value = action
}

// 展示确认框 MessageBox
const showConfirmMessageBox = async () => {
  // 调用 confirm 方法，并等待用户的实际动作结果
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
  // 将动作结果同步到页面上
  actionText.value = action
}

// 展示警告框 MessageBox
const showAlertMessageBox = async () => {
  // 调用 alert 方法，并等待用户的实际动作结果
  const action = await ElMessageBox.alert({
    // 确认按钮文字
    confirmBtnText: '我知道了',
    // 弹窗标题
    title: 'AlertMessageBox',
    // 弹窗内容
    content: 'This is AlertMessageBox content',
    // 允许点击遮罩关闭
    closeOnClickModal: true
  })
  // 将动作结果同步到页面上
  actionText.value = action
}
</script>
<style lang="">
</style>
