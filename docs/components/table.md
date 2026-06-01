---
title: Table
description: Table 表格组件文档
---

# Table 表格

`Table` 用于展示结构化列表数据。本项目的初版 API 受到 Element Plus 表格设计启发，但选择了更适合学习和快速配置的 `columns + data` 模式：`columns` 描述列，`data` 提供行，单元格默认读取 `row[column.prop]`。

## 基础表格

设置 `columns` 与 `data` 就能生成表头和数据行；`stripe` 与 `border` 用于增强阅读性。

<preview path="../demo/Table/Basic.vue" title="基础表格" description="通过 columns 描述列，通过 data 提供当前需要展示的行数据。"></preview>

## 自定义列内容

给列声明 `slot` 后，可以使用同名作用域插槽。插槽能够获得 `row`、`column`、`value` 和 `$index`，因此状态标签、操作按钮、头像图片等展示逻辑都留在使用方。

<preview path="../demo/Table/CustomColumn.vue" title="作用域插槽" description="使用列插槽绘制状态标签和操作按钮。"></preview>

## 排序与多选

列设置 `sortable: true` 后，点击表头会按升序、降序、取消排序循环切换。添加 `{ type: 'selection' }` 列即可开启多选，并通过 `selection-change` 获取选中行。

<preview path="../demo/Table/SortAndSelection.vue" title="排序与多选" description="本地排序使用数据副本，多选把结果通过事件交给父组件。"></preview>

## Table 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `columns` | 列配置数组 | `TableColumn[]` | `[]` |
| `data` | 当前展示的数据数组 | `TableRow[]` | `[]` |
| `row-key` | 行唯一标识，多选或更新数据时建议设置 | `string \| ((row) => string \| number)` | - |
| `stripe` | 是否显示斑马纹 | `boolean` | `false` |
| `border` | 是否显示纵向边框 | `boolean` | `false` |
| `empty-text` | 空数据提示 | `string` | `暂无数据` |
| `default-sort` | 初始排序状态 | `TableSortState` | - |

## Column 配置

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| `type` | 普通列或多选列 | `'default' \| 'selection'` |
| `prop` | 对应行数据字段 | `string` |
| `label` | 表头文本 | `string` |
| `width` / `minWidth` | 列宽度，数字会转成 `px` | `string \| number` |
| `align` / `headerAlign` | 内容或表头对齐方式 | `'left' \| 'center' \| 'right'` |
| `sortable` | 是否允许本地排序 | `boolean` |
| `slot` | 自定义单元格的具名插槽名称 | `string` |

## 事件与方法

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| `sort-change` | 排序状态变化 | `{ prop: string, order: 'ascending' \| 'descending' \| null }` |
| `selection-change` | 当前展示数据的选中结果变化 | `TableRow[]` |
| `row-click` | 点击一行 | `(row, index, event)` |
| `clearSelection()` | 清除选择，可通过组件实例调用 | - |
| `toggleRowSelection(row, selected?)` | 切换指定行的选择状态 | `TableRow, boolean?` |

## 边界设计

当前 `Table` 只负责渲染父组件传入的当前数据集。分页适合拆成独立的 `Pagination`，由父组件监听页码变化、请求新数据后重新传入 `data`；这样服务端分页不会被表格内部状态绑死。

虚拟滚动也没有塞入初版：它会引入滚动容器、高度估算、可见区计算、固定表头等新的职责。先稳定列配置、插槽、排序和选择 API，后续再以独立能力扩展，组件演进路径会更清楚。
