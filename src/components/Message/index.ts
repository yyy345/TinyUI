// 导出Messsage组件和相关类型定义
// getCurrentInstance：拿到当前组件实例（如果你在组件上下文里调用 ElMessage，它可用于取当前 appContext）
// isVNode：判断传入值是不是 Vue 的 VNode
// type App：Vue 应用实例类型，常用于 install(app: App) 的类型标注
// type AppContext：Vue 应用上下文类型，包含了应用的全局配置、组件注册等信息
import { getCurrentInstance, isVNode, type App, type AppContext } from 'vue'
import { closeAll, createMessage } from './method'
// 这是类型专用导入
import type { MessageFn, MessageHandler, MessageParams, MessageType } from './types'

// 定义函数传入参数的类型
type MessageMethod = (
  options?: MessageParams,
  appContext?: AppContext | null
) => MessageHandler

// 函数 + 对象属性
type MessageWithInstall = MessageFn & {
  install: (app: App) => void
  createMessage: MessageMethod
  _context: AppContext | null
}
// 1. 把 createMessage 包装成用户能直接调用的 Message 函数
// 2. 封装 Message.success / warning / info / error 快捷方法
// 3. 提供 install 方法，让 Message 可以挂到 app.config.globalProperties 上

// 将createMessage()进行包装
const message = ((options?: MessageParams, appContext?: AppContext | null) => {
  const instance = getCurrentInstance()
  return createMessage(options, appContext ?? instance?.appContext ?? message._context)
}) as unknown as MessageWithInstall

// 快捷方法：message.success = createTypedMessage('success')
// 将success, error这些作为type类型传入，再调用createMessage()方法
const createTypedMessage = (type: MessageType): MessageMethod => {
  return (options?: MessageParams, appContext?: AppContext | null) => {
    const normalizedOptions =
      options == null || typeof options === 'string' || isVNode(options)
        ? { message: options, type }
        : { ...options, type: options.type ?? type }
    // 调用message方法
    return message(normalizedOptions, appContext)
  }
}

message._context = null

// 全局注册
message.install = (app: App) => {
  message._context = app._context
  // 要把message方法挂载在全局方法上
  app.config.globalProperties.$message = message
}

message.createMessage = (options?: MessageParams, appContext?: AppContext | null) => {
  return message(options, appContext)
}

message.success = createTypedMessage('success')
message.warning = createTypedMessage('warning')
message.info = createTypedMessage('info')
message.error = createTypedMessage('error')
message.closeAll = closeAll

export default message
export {
  closeAll,
  createMessage
}
export * from './types'
