---
title: MessageBox
description: MessageBox组件文档
---

# MessageBox

模拟系统消息提示框而实现的一套模态对话框组件，用于消息提示、确认消息。

现在 `ElMessageBox`、`ElMessageBox.confirm`、`ElMessageBox.alert` 都会返回一个 `Promise`，并且会把用户动作直接返回给调用方。

可返回的动作值有 3 种：

- `confirm`
- `cancel`
- `close`

## 消息提示

当用户进行操作时会被触发，该对话框中断用户操作，直到用户确认知晓后才可关闭。

调用 `ElMessageBox.alert` 方法以打开 alert 框。它模拟了系统的 `alert`。

通过 `title` 属性设置 `MessageBox` 的标题，`content` 设置正文内容，`confirmBtnText` 设置确定按钮的文本内容。

调用方可以通过 `await` 拿到最终动作，例如：

```ts
const action = await ElMessageBox.alert({
  title: '提示',
  content: '操作已经完成'
})

if (action === 'confirm') {
  console.log('用户点击了确定')
}
```

<preview path="../demo/MessageBox/Basic.vue"></preview>

## 确认消息

提示用户确认其已经触发的动作，并询问是否进行此操作时会用到此对话框。

调用 `ElMessageBox.confirm` 方法以打开 confirm 框。它模拟了系统的 `confirm`。

`showCancelBtn` 设置是否显示取消按钮，`cancelBtnText` 设置取消按钮的文本内容。

调用方同样可以直接拿到动作结果，例如：

```ts
const action = await ElMessageBox.confirm({
  title: '删除提示',
  content: '确定删除这条数据吗？',
  showCancelBtn: true
})

if (action === 'confirm') {
  console.log('执行删除')
}

if (action === 'cancel') {
  console.log('用户取消删除')
}

if (action === 'close') {
  console.log('用户关闭了弹窗')
}
```

<preview path="../demo/MessageBox/Confirm.vue"></preview>
