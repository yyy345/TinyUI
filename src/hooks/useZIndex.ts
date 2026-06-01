// 统一管理层级的 hook
// 全局 z-index 管理器

import { computed, ref } from 'vue'

// 全局的总层数
const zIndex = ref(0)

// 设置zIndex
const useZIndex = (initialValue = 2000) => {
  // 包装为响应式数据
  const initialZIndex = ref(initialValue)
  // 计算属性 - 当前可用层级 = 全局偏移量 + 基础层级
  const currentZIndex = computed(
    () => zIndex.value + initialZIndex.value
  )

  // 申请下一个层级
  const nextZIndex = () => {
    zIndex.value++
    return currentZIndex.value
  }

  // 返回出数据
  return {
    currentZIndex,
    nextZIndex,
    initialZIndex
  }
}

export default useZIndex