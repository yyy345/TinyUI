import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { sendAIMessage } from './ai-service'
import type { AiMessage, AiPageContext } from './types'

const STORAGE_KEY = 'component-doc-ai-messages'
const MAX_STORED_MESSAGES = 20
let sequence = 0
const createId = () => `${Date.now()}-${sequence++}`

const readStoredMessages = (): AiMessage[] => {
  if (typeof window === 'undefined') return []
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AiMessage[]
    return Array.isArray(value) ? value.slice(-MAX_STORED_MESSAGES) : []
  } catch {
    return []
  }
}

export const useAiChat = () => {
  const messages = ref<AiMessage[]>(readStoredMessages())
  const loading = ref(false)
  const error = ref('')
  let controller: AbortController | undefined

  const persistedMessages = computed(() => messages.value
    .filter((message) => !message.loading && message.content.trim())
    .slice(-MAX_STORED_MESSAGES)
    .map(({ id, role, content, error: hasError, retryQuestion, sources }) => ({
      id, role, content, error: hasError, retryQuestion, sources
    })))

  watch(persistedMessages, (value) => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  }, { deep: true })

  const stopGeneration = () => controller?.abort()

  const sendMessage = async (question: string, pageContext: AiPageContext) => {
    const content = question.trim()
    if (!content || loading.value) return
    error.value = ''
    const userMessage: AiMessage = { id: createId(), role: 'user', content }
    messages.value.push(userMessage)
    const history = messages.value
      .filter((message) => !message.error && !message.loading && message.content.trim())
      .slice(-10)
      .map(({ role, content }) => ({ role, content }))
    // Keep the same reactive proxy for the whole streaming lifecycle. Mutating the
    // raw object after pushing it into a reactive array would not trigger a render.
    const assistant = reactive<AiMessage>({ id: createId(), role: 'assistant', content: '', loading: true })
    messages.value.push(assistant)
    loading.value = true
    controller = new AbortController()

    try {
      await sendAIMessage(history, pageContext, controller.signal, {
        onDelta(delta) {
          assistant.loading = false
          assistant.content += delta
        },
        onSources(sources) {
          assistant.sources = sources
        }
      })
      if (!assistant.content.trim()) throw new Error('AI 没有返回可显示的内容。')
    } catch (requestError) {
      assistant.loading = false
      if (controller.signal.aborted) {
        if (!assistant.content) assistant.content = '已停止生成。'
      } else {
        const detail = requestError instanceof Error ? requestError.message : ''
        assistant.content = detail || 'AI 服务暂时不可用，请稍后重试。'
        assistant.error = true
        assistant.retryQuestion = content
        error.value = detail
      }
    } finally {
      loading.value = false
      controller = undefined
    }
  }

  const retryMessage = async (message: AiMessage, context: AiPageContext) => {
    const question = message.retryQuestion
    if (!question || loading.value) return
    const index = messages.value.findIndex((item) => item.id === message.id)
    if (index >= 0) {
      messages.value.splice(index, 1)
      if (messages.value[index - 1]?.role === 'user' && messages.value[index - 1].content === question) {
        messages.value.splice(index - 1, 1)
      }
    }
    await sendMessage(question, context)
  }

  const clearMessages = () => {
    stopGeneration()
    messages.value = []
    error.value = ''
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
  }

  onBeforeUnmount(stopGeneration)
  return { messages, loading, error, sendMessage, retryMessage, stopGeneration, clearMessages }
}
