---
title: Form
description: Form 组件文档
---

# Form 表单

`Form` 组件用于组织和校验表单内容，通常与 `FormItem`、`Input` 一起使用。当前实现已经支持基础布局、字段级校验、整表校验、重置字段、清空校验状态，以及 `label` 插槽和错误信息开关。

## 普通表单展示

最基础的表单使用方式只需要传入 `model`。`FormItem` 负责字段容器和标签展示，`Input` 负责通过 `v-model` 和表单数据联动。

<preview path="../demo/Form/Basic.vue" title="普通表单展示" description="展示 Form、FormItem 和 Input 的基础组合方式，以及表单数据的双向绑定效果。"></preview>

## 提交前校验

为 `Form` 传入 `rules` 后，可以在输入框失焦时触发单项校验，也可以通过 `formRef.validate()` 主动执行整表校验。

<preview path="../demo/Form/Validate.vue" title="提交前校验" description="演示 blur 单项校验和按钮触发的整表校验，适合提交前检查输入合法性。"></preview>

## 重置字段与清空校验

`resetFields()` 会把字段恢复到初始值并清空校验状态，`clearValidate()` 则只清空校验结果，保留当前输入值。

<preview path="../demo/Form/Reset.vue" title="重置字段与清空校验" description="演示 validate、resetFields 和 clearValidate 三个核心表单方法的区别。"></preview>

## 自定义标签与隐藏错误文案

`FormItem` 支持通过 `label` 插槽自定义标签展示，也支持用 `show-message="false"` 隐藏错误文本，仅保留错误态样式。

<preview path="../demo/Form/CustomLabel.vue" title="自定义标签与隐藏错误文案" description="演示 FormItem 的 label 插槽和 show-message 属性，适合更灵活的表单项展示。"></preview>
