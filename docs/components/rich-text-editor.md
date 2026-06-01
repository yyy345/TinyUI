---
title: RichTextEditor
description: RichTextEditor 富文本编辑器文档
---

# RichTextEditor 富文本编辑器

`RichTextEditor` 用于编辑和输出 HTML 片段，适合文章摘要、项目说明、评论内容等轻量富文本场景。当前实现没有引入第三方编辑器内核，而是基于 `contenteditable`、受控 `v-model` 和常用格式命令完成，重点放在组件库 API 设计、表单联动和可维护性上。

## 基础用法

通过 `v-model` 获取编辑器输出的 HTML 字符串。

<preview path="../demo/RichTextEditor/Basic.vue" title="基础用法" description="展示富文本编辑器的受控值、工具栏和 HTML 输出。"></preview>

## 在 Form 中使用

富文本编辑器会注入 `FormItem` 上下文，默认在输入和失焦时触发表单校验。

<preview path="../demo/RichTextEditor/Form.vue" title="表单校验" description="展示 RichTextEditor 与 Form / FormItem 的联动方式。"></preview>

## 设计说明

这个组件刻意选择轻量实现：它不解决复杂协同编辑、Markdown 转换、图片上传等高级场景，而是先把组件库中最关键的能力打通：受控值、工具栏命令、禁用只读状态、表单校验和实例方法。

面试里可以这样展开：富文本本质上是一个“受控 HTML 输入组件”，难点不是渲染一个 `contenteditable`，而是如何处理外部值同步、光标稳定、命令触发、输入事件、表单校验和安全边界。真实业务如果需要复杂文档模型，可以再升级到 ProseMirror、TipTap 或 Slate 这类编辑器内核。
