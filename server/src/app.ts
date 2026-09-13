import express from 'express'
import { config, ensureConfig } from './config.js'
import { searchDocuments } from './services/document-search.js'
import { streamAnswer } from './services/llm.js'
import type { ChatRequestBody, ChatTurn, DocumentSource } from './types.js'

const app = express()
const MAX_MESSAGE_LENGTH = 4000
const MAX_HISTORY_MESSAGES = 10
const MAX_CONTEXT_ITEMS = 5
const REQUEST_TIMEOUT_MS = 60_000
const RATE_LIMIT = 12
const RATE_WINDOW_MS = 60_000
const rateBuckets = new Map<string, number[]>()

app.use(express.json({ limit: '64kb' }))
app.use((_, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  next()
})
app.options('*', (_, response) => response.sendStatus(204))

const sendSse = (response: express.Response, event: string, data: unknown) => {
  if (!response.writableEnded) response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

const getPublicErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('401')) return '模型服务鉴权失败，请确认 API Key 与接口地址属于同一平台。'
  if (message.includes('404')) return '当前接口不支持配置的模型，请检查 LLM_MODEL。'
  if (message.includes('429')) return '模型服务请求过于频繁或账户余额不足，请稍后重试。'
  if (message.includes('Unable to reach')) return '服务端无法连接模型接口，请检查网络和 LLM_BASE_URL。'
  if (message.includes('timed out') || (error instanceof Error && error.name === 'AbortError')) return '模型响应超时，请稍后重试。'
  return 'AI 服务暂时不可用，请稍后重试。'
}

const isChatTurn = (value: unknown): value is ChatTurn => {
  if (!value || typeof value !== 'object') return false
  const turn = value as Partial<ChatTurn>
  return (turn.role === 'user' || turn.role === 'assistant') &&
    typeof turn.content === 'string' && turn.content.trim().length > 0 &&
    turn.content.length <= MAX_MESSAGE_LENGTH
}

const validateBody = (value: unknown): ChatRequestBody | null => {
  if (!value || typeof value !== 'object') return null
  const body = value as Partial<ChatRequestBody>
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_HISTORY_MESSAGES) return null
  if (!body.messages.every(isChatTurn) || body.messages.at(-1)?.role !== 'user') return null
  if (body.context && (!Array.isArray(body.context) || body.context.length > MAX_CONTEXT_ITEMS)) return null
  if (body.pageContent && body.pageContent.length > 8000) return null
  return body as ChatRequestBody
}

const consumeRateLimit = (key: string) => {
  const now = Date.now()
  const recent = (rateBuckets.get(key) ?? []).filter((time) => now - time < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) return false
  recent.push(now)
  rateBuckets.set(key, recent)
  return true
}

const handleChat = async (request: express.Request, response: express.Response) => {
  const body = validateBody(request.body)
  if (!body) {
    response.status(400).json({ message: '请求格式无效，消息不能为空且单条不能超过 4000 字。' })
    return
  }
  if (!consumeRateLimit(request.ip || 'unknown')) {
    response.status(429).json({ message: '请求过于频繁，请一分钟后重试。' })
    return
  }

  response.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  response.setHeader('Cache-Control', 'no-cache, no-transform')
  response.setHeader('Connection', 'keep-alive')
  response.setHeader('X-Accel-Buffering', 'no')
  response.flushHeaders?.()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(new Error('AI request timed out.')), REQUEST_TIMEOUT_MS)
  response.on('close', () => {
    if (!response.writableEnded) controller.abort()
  })

  try {
    const question = body.messages.at(-1)?.content ?? ''
    const ranked = await searchDocuments(question, { page: body.page, component: body.component })
    const sources: DocumentSource[] = ranked.map((item) => ({
      title: item.title,
      url: item.route,
      component: item.component,
      sourceType: item.sourceType
    }))
    sendSse(response, 'sources', { sources })
    await streamAnswer(body.messages, ranked, {
      page: body.page,
      component: body.component,
      pageContent: body.pageContent,
      signal: controller.signal,
      onDelta: (content) => sendSse(response, 'delta', { content })
    })
    sendSse(response, 'done', {})
  } catch (error) {
    if (!response.destroyed) {
      console.error('[AI chat]', error)
      sendSse(response, 'error', { message: getPublicErrorMessage(error) })
    }
  } finally {
    clearTimeout(timeout)
    response.end()
  }
}

app.get('/api/ai/health', (_, response) => {
  response.json({ ok: Boolean(config.llmApiKey), model: config.llmModel, search: 'local-keyword' })
})
app.post('/api/ai/chat', handleChat)

ensureConfig()
app.listen(config.port, () => {
  console.log(`AI server listening on http://127.0.0.1:${config.port}`)
})
