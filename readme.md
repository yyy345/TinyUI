# TinyUI

TinyUI 是一个基于 Vue 3 + TypeScript 的组件库练习项目，设计思路参考 Element Plus。

## 项目定位

- 学习 Vue 3 组件库的基础架构：组件目录、统一入口、全局注册、按需导出、样式组织
- 练习可复用组件设计：props、emits、slots、expose、provide/inject、组合式 hooks
- 沉淀面试表达：能讲清楚一个组件从 API 设计到工程发布的完整链路
- 形成简历亮点：组件库、文档站、单元测试，并预留 RAG 知识助手等工程化扩展方向

## 技术栈

- Vue 3 + TypeScript
- Vite / Vite library mode
- VitePress 文档站
- Vitest + Vue Test Utils + jsdom
- async-validator 表单校验、Popper 浮层定位
- Express + Qdrant + OpenAI-compatible API，RAG 文档问答服务规划中（正在学习中...）

## 已实现组件

基础组件：

- Button / ButtonGroup
- Icon
- Link
- Container

反馈组件：

- Alert
- Dialog
- Message
- MessageBox
- Tooltip

数据录入：

- Input
- Select
- Switch
- Rate
- DatePicker
- Form / FormItem
- RichTextEditor 正在学习中...

数据展示：

- Collapse / CollapseItem
- Dropdown
- Table 正在学习中...

## 目录结构

```text
TinyUI
├─ docs/                  # VitePress 文档与组件 demo
│  ├─ components/          # 组件说明文档
│  └─ demo/                # 可运行的组件示例
├─ server/                 # RAG 服务预研目录，当前仍在实现中
├─ src/
│  ├─ components/          # 组件源码
│  ├─ hooks/               # 通用组合式逻辑
│  ├─ styles/              # 全局样式与变量
│  ├─ views/               # 本地调试页面
│  ├─ router/              # demo 页面路由
│  └─ index.ts             # 组件库统一入口
├─ vite.config.ts          # 应用模式与库模式构建配置
└─ vitest.config.ts        # 单元测试配置
```

经典Button组件目录包含：

```text
Button/
├─ Button.vue              # 组件实现
├─ types.ts                # props、emits、类型定义
├─ style.css               # 组件样式
├─ index.ts                # install 包装与类型导出
└─ Button.test.ts          # 单元测试
```

## 快速开始

安装依赖：

```shell
npm install
```

启动本地调试页面：

```shell
npm run dev
```

启动组件文档站：

```shell
npm run docs:dev
```

构建组件库产物：

```shell
npm run build:lib
```

构建文档站：

```shell
npm run docs:build
```

## 使用方式

### 全量引入

```ts
import { createApp } from 'vue'
import TinyUI from 'my-elem'
import 'my-elem/style.css'
import App from './App.vue'

const app = createApp(App)

app.use(TinyUI)
app.mount('#app')
```

### 按需引入

```ts
import { createApp } from 'vue'
import { Button, Form, FormItem, Message } from 'my-elem'
import 'my-elem/style.css'
import App from './App.vue'

const app = createApp(App)

app.use(Button)
app.use(Form)
app.use(FormItem)

Message.success('保存成功')

app.mount('#app')
```

## 架构设计要点

### 统一入口

`src/index.ts` 是组件库的对外入口，负责三件事：

- 导入全局样式
- 组织组件列表，支持 `app.use(TinyUI)` 一次性注册
- 导出单个组件和类型，支持按需使用

这也是组件库和普通业务项目最大的区别之一：业务项目更关注页面功能，组件库更关注“别人怎么安装、怎么引用、怎么获得类型提示”。

### install 机制

普通 `.vue` 文件本身不能直接被 `app.use()` 安装，所以项目中会给组件补充 `install(app)` 方法：

```ts
Button.install = function (app) {
  app.component(Button.name, Button)
}
```

这样同一个组件既可以局部注册，也可以作为 Vue 插件全局注册。、

### 类型设计

组件的 props 和公共类型集中放在 `types.ts` 中，再由组件入口统一导出。

- 组件内部可以复用类型定义，减少散落的类型声明
- 使用者可以从库入口获得类型提示，提高 TypeScript 体验

### 表单设计

`Form` 和 `FormItem` 使用 `provide/inject` 建立父子通信，由 `Form` 统一收集字段实例，再通过 `async-validator` 执行校验。这个设计能很好地解释组件库里的“跨层级协作”：

- `Form` 管理 model、rules、校验方法
- `FormItem` 负责单个字段的校验、错误展示和重置
- 外部通过 `formRef.validate()`、`resetFields()` 等方法控制表单

### 命令式组件

`Message` 和 `MessageBox` 属于命令式组件，不完全依赖模板声明，而是通过函数调用动态创建实例：

```ts
Message.success('操作成功')
```

这类组件适合用来理解 Vue 应用上下文、动态渲染、实例销毁、队列管理和全局方法挂载。

## AI 组件助手

文档站右下角提供 AI 组件助手。它会结合当前路由和页面内容，在服务端检索 Markdown 文档、Vue 示例与 TypeScript 类型定义，并通过 SSE 实时返回回答。API Key 仅存放在 `server/.env`，不会暴露给浏览器。

首次使用时复制 `server/.env.example` 为 `server/.env`，填写 DeepSeek 平台的 `LLM_API_KEY`。默认接口为 `https://api.deepseek.com`，模型为 `deepseek-v4-flash`，然后分别启动 AI 服务和文档站：

```shell
npm run ai:doctor
npm run ai:start
npm run docs:dev
```

默认问答链路使用轻量级本地关键词检索，不依赖 Qdrant。仓库仍保留 `npm run rag:index`，用于后续学习和试验 Embedding + Qdrant 向量检索。
