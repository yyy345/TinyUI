/*
定义按钮支持哪些参数
type：primary、success、info、warning、danger
size：large、medium、small
布尔开关：plain、round、circle、disabled、autofocus、loading
nativeType：button、submit、reset
icon：字符串
*/
// 导入 PropType 用来强行把 TS 的严谨类型“注入”到 Vue 的运行时声明中的
import type { PropType } from 'vue'
// 按钮类型
export type ButtonType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
// 按钮尺寸
export type ButtonSizeType = 'medium' | 'small' | 'large'
// 原生按钮类型
export type NativeType = 'button' | 'submit' | 'reset'
// 声明 buttonProps 对象，Vue 组件的 props 选项需要的类型声明
export const buttonProps = {
  // 按钮类型
  type: {
    // 字符串，受 ButtonType 约束，默认 primary。
    type: String as PropType<ButtonType>,
    default: 'primary'
  },
  // 尺寸
  size: {
    type: String as PropType<ButtonSizeType>,
    default: 'medium'
  },
  // 布尔开关
  plain: {
    type: Boolean,
  },
  round: {
    type: Boolean,
  },
  circle: {
    type: Boolean,
  },
  disabled: {
    type: Boolean,
  },
  autofocus: {
    type: Boolean,
  },
  loading: {
    type: Boolean,
  },
  // 原生按钮类型
  nativeType: {
    type: String as PropType<NativeType>,
    default: 'button'
  },
  // 图标
  icon: {
    type: String,
  }
}
