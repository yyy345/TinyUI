// 自定义监听事件钩子
// 全自动地管理 DOM 事件的绑定与销毁

import { onMounted, onBeforeUnmount, isRef, watch, unref } from 'vue'
// Vue 提供的 TypeScript 类型接口 (Interface)
import type { Ref } from 'vue'

// 默认导出方法
export default function useEventListener(
  // 接收参数
  // 纯 DOM 节点 (EventTarget)：比如全局的 window 或者 document
  // 响应式引用 (Ref<EventTarget | null>)：
  //  比如我们在 Message.vue 里用 const messageRef = ref() 绑定的那个 div 本身
  target: Ref<EventTarget | null> | EventTarget,
  // 事件类型
  event: string,
  // 函数类型 定义“函数类型”的专属写法
  // 这个函数要接收一个参数 e，且 e 必须是原生 DOM 的 Event（事件）对象。
  // => any 表示这个函数执行完后，可以返回任何东西（any）
  // 就是监听事件的回调函数
  handler: (e: Event) => any
) {
  // 如果是响应式引用,监听变化
  if (isRef(target)) {
    watch(target, (value, oldValue) => {
      // 可选链,如果 oldValue 存在 就移除事件监听
      oldValue?.removeEventListener(event, handler)
      // 如果 value 存在 就添加事件监听
      value?.addEventListener(event, handler)
    })
  } else {
    // 如果不是响应式
    onMounted(() => {
      // 在挂载时添加事件监听
      target.addEventListener(event, handler)
    })
  }

  // 在组件卸载前 移除监听器
  onBeforeUnmount(() => {
    // unref(target) 处理 target 可能是响应式引用的情况,如果是响应式引用 就取它的值
    unref(target)?.removeEventListener(event, handler)
  })
}
