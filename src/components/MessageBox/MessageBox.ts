// 引入 MessageBox 组件本体
import MessageBoxComponent from "./MessageBox.vue";
// 引入 Vue 的创建应用和监听能力
import { createApp, watch } from "vue";
// 引入 MessageBox 的配置类型和动作类型
import type { ActionType, MessageBoxOptions } from "./types";

// 定义 MessageBox 函数本身以及其静态方法的类型
type MessageBoxMethod = {
  // 默认调用时，返回一个包含动作结果的 Promise
  (options: MessageBoxOptions): Promise<ActionType>;
  // confirm 静态方法，返回一个包含动作结果的 Promise
  confirm: (options: MessageBoxOptions) => Promise<ActionType>;
  // alert 静态方法，返回一个包含动作结果的 Promise
  alert: (options: MessageBoxOptions) => Promise<ActionType>;
};

/**
 * MessageBox - 创建MessageBox
 * @param {MessageBoxOptions} options - 弹窗的配置选项
 * @returns {Promise<ActionType>} - 返回一个 Promise 对象，表示弹窗的结果
 */
const MessageBox = ((options: MessageBoxOptions): Promise<ActionType> => {
  // 创建一个 Vue 应用实例，将弹窗组件和配置选项传入
  const messageBoxApp = createApp(MessageBoxComponent, options);
  // 返回一个 Promise，用于异步处理弹窗结果
  return new Promise((resolve) => {
    // 显示弹窗
    showMessageBox(messageBoxApp, { resolve });
  });
}) as MessageBoxMethod;

/**
 * MessageBox 的 confirm 静态方法 - 创建带有确认按钮的弹窗
 * @param {MessageBoxOptions} options - 弹窗的配置选项
 * @returns {Promise<ActionType>} - 返回一个 Promise 对象，表示弹窗的结果
 */
MessageBox["confirm"] = (options: MessageBoxOptions): Promise<ActionType> => {
  // 返回一个新的配置对象，避免直接修改调用方传入的原对象
  return MessageBox({
    // 复制调用方的原始配置
    ...options,
    // 设置额外字段，标识弹窗类型为确认对话框
    field: "confirm"
  });
};

/**
 * MessageBox 的 alert 静态方法 - 创建带有警告按钮的弹窗
 * @param {MessageBoxOptions} options - 弹窗的配置选项
 * @returns {Promise<ActionType>} - 返回一个 Promise 对象，表示弹窗的结果
 */
MessageBox["alert"] = (options: MessageBoxOptions): Promise<ActionType> => {
  // 返回一个新的配置对象，避免直接修改调用方传入的原对象
  return MessageBox({
    // 复制调用方的原始配置
    ...options,
    // 设置额外字段，标识弹窗类型为警告框
    field: "alert"
  });
};

/**
 * 显示弹窗的函数
 * @param {object} app - Vue 应用实例
 * @param {object} callbacks - 包含 resolve 回调的对象
 */
const showMessageBox = (
  // 接收创建好的 Vue 应用实例
  app: any,
  // 接收 Promise 的 resolve 回调
  { resolve }: { resolve: (action: ActionType) => void }
): void => {
  // 创建文档碎片
  const oFragment = document.createDocumentFragment();
  // 将弹窗组件挂载到文档碎片中
  const vm = app.mount(oFragment);
  // 将文档碎片添加到 body 中，显示弹窗
  document.body.appendChild(oFragment);
  // 设置弹窗可见
  vm.setVisible(true);

  // 使用 Vue 的 watch 监听弹窗状态变化
  watch(vm.state, (state) => {
    // 当弹窗被关闭时再处理动作结果
    if (!state.visible) {
      // 读取当前动作类型，如果没有记录则默认为 close
      const action = (state.type || "close") as ActionType;
      // 将 confirm / cancel / close 返回给调用方
      resolve(action);
      // 隐藏并销毁弹窗
      hideMessageBox(app);
    }
  });
};

/**
 * 隐藏并销毁弹窗的函数
 * @param {object} app - Vue 应用实例
 */
const hideMessageBox = (app: any): void => {
  // 使用 Vue 的 unmount 方法卸载组件
  app.unmount();
};

// 导出 MessageBox 函数
export default MessageBox;
