// 导入Vue相关类型
// AppContext：Vue 应用上下文类型，包含了应用的全局配置、组件注册等信息
// ComponentInternalInstance：Vue 组件实例的内部类型，包含了组件的状态、生命周期等信息
// VNode：Vue 虚拟节点类型，表示 Vue 组件树中的一个节点，可以是元素、组件或文本等
import type { AppContext, ComponentInternalInstance, VNode } from 'vue'

// 消息类型
export type MessageType = 'success' | 'info' | 'warning' | 'error'

// 消息内容
export type MessageContent = string | VNode

// 消息属性 带问号表示传递的时候可以有，也可以没有
export interface MessageProps {
  id: string // 消息唯一标识
  message?: MessageContent // 消息内容
  duration?: number // 持续时间
  showClose?: boolean //是否显示关闭按钮
  type?: MessageType // 消息类型
  zIndex: number // z-index 层级
  offset?: number // 消息距离页面顶部的偏移量 是“输入参数”
  onClose: () => void // 关闭回调函数
}

// interface 约束对象/函数/class 的形状
// 暴露给外部的消息实例接口
// Message.vue 通过 defineExpose 暴露给外部控制层的数据结构
export interface MessageExposed {
  // 堆叠定位 是“输出结果”
  bottomOffset: {
    value: number
  }
  // 控制显示/关闭
  visible: {
    value: boolean
  }
}

// Message暴露的接口，包含了关闭方法
export interface MessageHandler {
  close: () => void
}

// 内部管理动态创建的 Message 消息实例
// 用来维护和追踪每一条正在显示的消息的完全状态的
export interface MessageContext extends MessageHandler {
  id: string // 消息唯一标识
  vnode: VNode // 消息的虚拟节点
  vm: ComponentInternalInstance // 组件实例
  props: MessageProps // 消息属性
  destroy: () => void // 销毁实例的方法
}

// 从MessageProps 去除id, zIndex 和 onClose 这三个属性，
// 其他的属性都是用户可以传递的选项
export type MessageOptions = Omit<MessageProps, 'id' | 'zIndex' | 'onClose'>

// 消息参数类型 - 用户调用Message时可以传递什么参数
// 调用Message('Hello') 或者 Message({ message: 'Hello', type: 'success' }) 都是合法的
export type MessageParams = MessageOptions | MessageContent

// 定义一个接口，表示消息组件的安装方法和创建消息的方法
export interface MessageFn {
  // 调用Message(Options)
  (options?: MessageParams, appContext?: AppContext | null): MessageHandler
  // 快捷方法
  success: (options?: MessageParams, appContext?: AppContext | null) => MessageHandler
  warning: (options?: MessageParams, appContext?: AppContext | null) => MessageHandler
  info: (options?: MessageParams, appContext?: AppContext | null) => MessageHandler
  error: (options?: MessageParams, appContext?: AppContext | null) => MessageHandler
  // 全局关闭方法
  closeAll: () => void
}

// 给创建消息提供的别名，方便外部调用
export type CreateMessageProps = MessageOptions
