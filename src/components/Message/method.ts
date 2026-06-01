//  Message 组件的核心逻辑，主要负责消息的创建、管理和销毁

// h函数 创建虚拟Dom
// isVNode 判断外部传入内容是不是虚拟节点
// render 渲染
// shallowReactive 浅响应式
// appContext Vue上下文类型
import { h, isVNode, render, shallowReactive, type AppContext } from 'vue'
// 导入类型
import type {
  CreateMessageProps, // 创建消息组件的props
  MessageContext, // 内部维护的消息实例
  MessageExposed, // 组件暴露给外部的内容
  MessageParams // 外部用户传入参数
} from './types'

import MessageConstructor from './Message.vue'
// 管理显示层级
import useZIndex from '../../hooks/useZIndex'

// 计数器 - 用来生成唯一id
let seed = 1

// 保存当前页面上所有还活着的消息实例
// 而且只需要获取数组长度的变化,而不需要内部深层数据的修改,所以用shallowReactive
const instances: MessageContext[] = shallowReactive([])

// 统一参数入口
const normalizeOptions = (options?: MessageParams): CreateMessageProps => {
  if (options == null) return {}

  if (typeof options === 'string' || isVNode(options)) {
    // 包装成对象
    return {
      message: options
    }
  }

  return options
}

// 让外部可以访问组件内部的状态
// bottomOffset  visible
const getExposed = (instance: MessageContext) => {
  // 这个组件暴露给外部的对象
  // as MessageExposed
  return instance.vm.exposed as MessageExposed | null
}

// 创建组件
export const createMessage = (
  options?: MessageParams,
  appContext: AppContext | null = null
) => {
  // 处理用户输入
  const props = normalizeOptions(options)
  // 获取nextZIndex方法 显示更高层级
  const { nextZIndex } = useZIndex()
  // 设置唯一id
  const id = `message_${seed++}`
  // 创建div标签
  const container = document.createElement('div')

  // 1. 销毁逻辑 - 卸载vue组件
  const destroy = () => {
    // 从实例池里面找到当前id的的索引
    const idx = instances.findIndex((instance) => instance.id === id)
    console.log(idx)

    // 没有
    if (idx === -1) return

    // 去掉这个索引
    instances.splice(idx, 1)
    console.log(container)
    // 当前的实例就不要再渲染 并没有移除
    render(null, container)
    // 移除
    // el.remove()
    container.remove()
  }

  // 2. 关闭消息
  //            1) 修改 visible
  //            2) 播放离场动画
  //            3) 动画结束
  //            4) destroy()
  const close = () => {
    // 获取id对应实例
    const instance = instances.find((item) => item.id === id)
    // 没有
    if (!instance) return

    // 获取这个实例返回的暴露状态
    const exposed = getExposed(instance)
    if (!exposed) return

    // 将visible设置为false
    exposed.visible.value = false
  }

  // 4. 用户传入的数据”和“内部补充的数据”合并成最终 props
  const messageProps = {
    ...props,
    id,
    zIndex: nextZIndex(),
    onClose: destroy
  }

  // 创建组件 <MessageConstructor v-bind="messageProps" />
  const vnode = h(MessageConstructor, messageProps)
  // 传递上下文
  vnode.appContext = appContext

  // vnode 渲染到 container
  render(vnode, container)
  // 只把container第一个子元素，也就是消息组件Message放入到body里面
  // ! 是 TypeScript 非空断言
  // document.body.appendChild(container.firstElementChild!)
  // const el = container.firstElementChild as HTMLElement
  // document.body.appendChild(el)
  document.body.appendChild(container!)

  // 拿到组件实例
  const vm = vnode.component!
  // 设置当前的组件信息
  const instance: MessageContext = {
    id,
    vnode,
    vm,
    props: messageProps,
    destroy,
    close
  }

  // 将当前组件放入组件池中
  instances.push(instance)

  // 并返回当前组件信息
  return instance
}

// 获取最后一条消息
export const getLastInstance = () => {
  // .at(-1)
  return instances.at(-1)
}

// 3. 消息不重叠
export const getLastBottomOffset = (id: string) => {
  // 通过当前id找到在组件池里面的位置
  const idx = instances.findIndex((instance) => instance.id === id)
  if (idx <= 0) return 0

  // 获取选择当前组件的前一个组件
  const prev = instances[idx - 1]
  // 获取前一个组件的底部位置
  const exposed = getExposed(prev)

  // 返回前一条消息的底部位置
  // 如果拿不到，就兜底返回 0
  return exposed?.bottomOffset.value ?? 0
}

// 关闭所有消息
export const closeAll = () => {
  // 先拷贝出一个数组instances.slice() 
  // 避免在原数组被修改
  instances.slice().forEach((instance) => {
    // 关闭消息
    instance.close()
  })
}
