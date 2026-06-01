// 定义弹窗配置对象的接口
/**
 * 弹出框选项接口
 */
export interface MessageBoxOptions {
  // 弹出框标题
  title?: string;
  // 弹出框内容
  content?: string;
  // 是否显示取消按钮
  showCancelBtn?: boolean;
  // 取消按钮文本
  cancelBtnText?: string;
  // 确认按钮文本
  confirmBtnText?: string;
  // 额外字段，用于区分 confirm / alert 等类型
  field?: string;
  // 是否在点击模态框外部时关闭弹出框
  closeOnClickModal?: boolean;
  // 允许添加额外的自定义属性
  [key: string]: unknown;
}
// 用户操作类型
export type ActionType = 'confirm' | 'cancel' | 'close';
