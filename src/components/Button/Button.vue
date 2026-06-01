<!-- button 组件 -->
<script setup lang="ts">
  // 导入类型限制
  import { buttonProps } from './types'
  import { computed, ref } from 'vue'
  // 引入Icon组件
  import ElIcon from '../Icon/Icon.vue'
  // 定义组件名称
  defineOptions({
    name: 'ElButton'
  })
  // 1. 接收props - 接受父组件传递的属性值
  const props = defineProps(buttonProps)

  // 2. 把子组件内部的 button DOM 引用，开放给父组件使用
  // 定义组件实例
  const _ref = ref<HTMLButtonElement>()
  // defineExpose暴露实例 允许父组件通过“组件实例 ref”拿到这个 ref
  defineExpose({
    ref: _ref
  })

  // 3. 计算button的样式类 - 动态类别
  const computedClass = computed(() => {
    // 解构获取props中的属性值
    const { type, size, round, loading, circle, disabled, plain } = props
    return [
      type ? 'el-button--' + type : '',
      size ? 'el-button--' + size : '',
      { 
        'is-round': round,
        'is-loading': loading,
        'is-circle': circle,
        'is-disabled': disabled,
        'is-plain': plain,
      }
    ]
  })

</script>
<!-- 按钮支持哪些参数
type：primary、success、info、warning、danger
size：large、medium、small
布尔开关：plain、round、circle、disabled、autofocus、loading
nativeType：button、submit、reset
icon：字符串 -->
<template>
  <!-- 原生button 进行属性绑定 -->
  <button
    class="el-button"
    ref="_ref"
    :class="computedClass"
    :disabled="disabled || loading"
    :autofocus="autofocus"
    :type="nativeType"
  >
    <!-- 如果按钮处于加载中 -->
    <el-icon icon="spinner" v-if="loading" spin/>
    <!-- 如果按钮传递图标 -->
    <el-icon :icon="icon" v-if="icon" />
    <!-- 插槽 放置用户自定义内容 -->
    <span>
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>

</style>