import Tooltip from '@/components/Tooltip/Tooltip.vue'
import type { App } from 'vue'



// 1. 注册成一个插件 -> 全局注册
Tooltip.install = (app: App) => {
  app.component(Tooltip.name || 'ElTooltip', Tooltip)
}
// 2. 默认导出
export default Tooltip

export * from './types'
