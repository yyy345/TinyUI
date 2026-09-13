import type { AiChatCallbacks, AiPageContext, AiSource } from './types'

interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

const parseEvent = (raw: string, callbacks: AiChatCallbacks) => {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const name = lines.find((line) => line.startsWith('event:'))?.slice(6).trim() ?? 'message'
  const data = lines.filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('')
  if (!data) return
  const payload = JSON.parse(data) as { content?: string, message?: string, sources?: AiSource[] }
  if (name === 'delta' && payload.content) callbacks.onDelta(payload.content)
  if (name === 'sources') callbacks.onSources(payload.sources ?? [])
  if (name === 'error') throw new Error(payload.message || 'AI 服务暂时不可用，请稍后重试。')
}

export const sendAIMessage = async (
  messages: ChatTurn[],
  context: AiPageContext,
  signal: AbortSignal,
  callbacks: AiChatCallbacks
) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messages.slice(-10), ...context, context: [] }),
    signal
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(payload.message || `AI 服务请求失败（${response.status}）`)
  }
  if (!response.body) throw new Error('浏览器无法读取 AI 流式响应。')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let streamDone = false
  while (!streamDone) {
    const { done, value } = await reader.read()
    streamDone = done
    if (done) continue
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''
    for (const event of events) if (event.trim()) parseEvent(event, callbacks)
  }
  if (buffer.trim()) parseEvent(buffer, callbacks)
}
