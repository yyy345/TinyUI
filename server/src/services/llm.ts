import { config } from '../config.js'
import type { ChatTurn, SearchResult } from '../types.js'
import { OpenAICompatibleClient } from './openai-compatible.js'

const client = new OpenAICompatibleClient(config.llmBaseUrl, config.llmApiKey)

const formatContext = (results: SearchResult[], pageContent?: string) => {
  const documents = results.map((item, index) => [
    `【资料 ${index + 1}】`,
    `组件：${item.component}`,
    `标题：${item.title}`,
    `路由：${item.route}`,
    item.text
  ].join('\n'))
  if (pageContent) documents.unshift(`【当前页面可见内容】\n${pageContent.slice(0, 6000)}`)
  return documents.join('\n\n') || '未检索到相关文档。'
}

const buildMessages = (
  history: ChatTurn[],
  results: SearchResult[],
  page?: string,
  component?: string,
  pageContent?: string
) => [{
  role: 'system',
  content: [
    '你是 TinyElement 组件库官方网站的 AI 技术助手，帮助开发者理解和使用当前组件库。',
    '回答规则：',
    '1. 优先且严格依据提供的组件库文档，不得编造 Props、Events、Slots 或 API。',
    '2. 文档没有相关内容时，明确回答“当前文档中未找到相关说明”。',
    '3. 使用问题优先给出可运行的 Vue 3 代码示例；组件标签、导入路径和 API 必须原样沿用资料中的写法，禁止自行改名。',
    '4. 先给结论再解释，API 名称用行内代码突出；不要重复输出参考来源列表，界面会单独展示。',
    '5. 当前页面存在组件时优先结合该组件；拒绝与 TinyElement 完全无关的问题。',
    `当前页面：${page || '未知'}`,
    `当前组件：${component || '未知'}`,
    '', '组件库相关文档：', formatContext(results, pageContent)
  ].join('\n')
}, ...history.slice(-10)]

export const streamAnswer = async (
  history: ChatTurn[],
  results: SearchResult[],
  options: {
    page?: string
    component?: string
    pageContent?: string
    signal: AbortSignal
    onDelta: (content: string) => void
  }
) => client.streamChatCompletion(
  config.llmModel,
  buildMessages(history, results, options.page, options.component, options.pageContent),
  options.signal,
  options.onDelta
)

// 保留给可选的 Qdrant 索引实验使用；默认问答链路走上面的真实流式接口。
export const generateAnswer = async (
  question: string,
  results: SearchResult[],
  history: ChatTurn[] = []
) => client.chatCompletion(
  config.llmModel,
  buildMessages([...history, { role: 'user', content: question }], results)
)
