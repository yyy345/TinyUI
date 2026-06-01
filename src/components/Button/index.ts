// 把一个普通的 .vue 组件，包装成一个既能“全局安装”，
// 又能“局部引入”的工程化模块

import type { App } from 'vue'
// 导入按钮组件本体 Button.vue
import Button from "./Button.vue"
// 2. 注册组件 - 支持用户按需app.use() 全局注册
Button.install = function (app: App) {
  // Button.name 是组件的 name 属性值 - TinyButton
  app.component(Button.name, Button)
}
// 1. 默认导出组件 - 支持局部引入
export default Button
// 把类型二次导出，外部可直接从 Button 入口拿类型
export * from './types'