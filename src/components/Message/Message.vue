<!-- UI呈现 -->

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  // 引入类型定义
  import type { MessageProps } from './types'
  // 渲染虚拟节点的组件
  import RenderVnode from '../Common/RenderVnode'
  // 图标组件
  import Icon from '../Icon/Icon.vue'
  // 计算当前消息应该显示的位置
  import { getLastBottomOffset } from './method'
  // 事件监听钩子 - 自定义
  import useEventListener from '../../hooks/useEventListener'

  // 接收props参数并设定默认值
  const props = withDefaults(defineProps<MessageProps>(), {
    // 未传值就设置为info类型
    type: 'info',
    // 未传值就设置为3000毫秒后自动关闭
    duration: 3000,
    // 未传值就设置为20像素的初始偏移量
    offset: 20
  })

  // 是否可见
  const visible = ref(false)
  // 消息元素的引用 —— 防止重叠
  // <HTMLDivElement>：这是 TypeScript 的泛型写法，
  // 表示 messageRef 是一个 HTMLDivElement 类型的引用
  const messageRef = ref<HTMLDivElement>()

  // 消息元素的高度
  const height = ref(0)
  // 调用方法，根据id计算前面的消息的底部位置
  const lastOffset = computed(() => getLastBottomOffset(props.id))
  // 计算当前消息的顶部位置
  const topOffset = computed(() => props.offset + lastOffset.value)
  // 计算当前消息的底部位置 = 顶部位置 + 消息高度
  const bottomOffset = computed(() => height.value + topOffset.value)

  // 计算样式
  const cssStyle = computed(() => ({
    // 决定位置
    top: `${topOffset.value}px`,
    // 决定显示层级
    zIndex: props.zIndex
  }))

  // 定时器 —— 自动销毁生命周期
  // ReturnType<...>：这是 TypeScript 自带的一个工具类型。
  // 它的作用是“提取一个函数的返回值类型”。
  let timer: ReturnType<typeof setTimeout> | undefined

  // 开始计时
  function startTimer() {
    // 不自动关闭
    if (props.duration === 0) return

    // 先清除之前的定时器
    clearTimer()
    // 设置当前的定时器
    timer = setTimeout(() => {
      visible.value = false
    }, props.duration)
  }

  // 清空定时器
  function clearTimer() {
    // 不存在
    if (!timer) return

    clearTimeout(timer)
    timer = undefined
  }

  // 挂载时 —— 显示消息，并开始计时
  onMounted(() => {
    visible.value = true
    startTimer()
  })

  // 按下Esc键关闭消息
  function keydown(e: Event) {
    // e as KeyboardEvent TypeScript 类型断言 是否是键盘事件
    const event = e as KeyboardEvent
    // 是ESC 就不显示
    if (event.code === 'Escape') {
      visible.value = false
    }
  }

  // 调用事件监听钩子 - 自定义钩子
  // 传入document对象 监听keydown事件 执行keydown函数
  // 形成快捷键, 无视焦点,在哪里点击esc 就可以关闭消息
  useEventListener(document, 'keydown', keydown)

  // 销毁组件
  function destroyComponent() {
    // 调用传入的props方法
    props.onClose()
  }

  // 更新消息高度
  function updateHeight() {
    // 如果消息不存在
    if (!messageRef.value) return
    // 消息获取他的高度，并更新height的值
    // getBoundingClientRect() 当前浏览器视口中的绝对位置和大小
    // 返回一个包含 top、bottom、left、right、width 和 height 的对象
    height.value = messageRef.value.getBoundingClientRect().height
  }

  // 设置组件名
  defineOptions({
    name: 'ElMessage'
  })

  // 暴露组件底部位置 和 可见状态
  defineExpose({
    bottomOffset,
    visible
  })
</script>

<template>
  <!-- 动画魔法盒子 Transition -->
  <!-- name="fade-up" 当内部的 div（因为 v-show="visible" 的变化）即将出现或消失时，
       Vue 会自动在特定的时机给这个 div 加上特定的 CSS class
       fade-up-enter-from fade-up-leave-to -->
  <!-- <Transition> 提供了 JavaScript 钩子 -->
  <!-- @enter 动画刚开始播放时执行 更新高度 -->
  <!-- @after-leave 当倒计时结束 销毁组件  -->
  <Transition
    name="fade-up"
    @after-leave="destroyComponent" 
    @enter="updateHeight"
  >
    <!-- 消息容器 -->
    <!-- 使用visible控制消息的显示/隐藏 -->
    <!-- 绑定ref属性 -->
    <!-- :class 动态绑定类名 -->
    <!-- role="alert" 无障碍访问 -->
    <!-- :style="cssStyle" 确定组件显示的位置 -->
    <!-- mouseenter 鼠标移入 就销毁定时器，防止消息被销毁 -->
    <!-- mouseleave 鼠标移出 就重新开始计时，重新进入销毁倒计时 -->
    <div
      v-show="visible"
      ref="messageRef"
      class="el-message"
      :class="{
        [`el-message--${type}`]: type,
        'is-close': showClose
      }"
      role="alert"
      :style="cssStyle"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <!-- 左侧消息内容 -->
      <div class="el-message__content">
        <!-- 默认插槽 -->
        <slot>
          <!-- 如果传入虚拟DOM，就会渲染，否则直接显示字符串 -->
          <RenderVnode v-if="message" :v-node="message" />
        </slot>
      </div>
      <div v-if="showClose" class="el-message__close">
        <!-- 显示关闭图标 点击关闭消息 等待离场动画执行完就销毁 -->
        <Icon icon="xmark" @click.stop="visible = false" />
      </div>
    </div>
  </Transition>
</template>
