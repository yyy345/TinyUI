<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

interface ChatTurn {
  role: 'assistant' | 'user'
  content: string
}

interface ChatMessage extends ChatTurn {
  id: number
  streaming?: boolean
  thinking?: boolean
}

interface PersistedChatState {
  route: string
  updatedAt: number
  messages: ChatTurn[]
}

interface VirtualRow {
  index: number
  top: number
  height: number
  message: ChatMessage
}

const STORAGE_KEY = 'tiny-element-ai-chat:v1'
const MAX_PERSISTED_MESSAGES = 80
const OVERSCAN = 6

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang }).value}</code></pre>`
      } catch {
        return ''
      }
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
  }
})

const text = {
  welcome: '\u53ef\u4ee5\u76f4\u63a5\u95ee\u6211\u7ec4\u4ef6\u5e93\u6587\u6863\u91cc\u7684\u95ee\u9898\uff0c\u6bd4\u5982\uff1aSelect \u652f\u6301\u7b5b\u9009\u5417\uff1f',
  open: 'AI \u95ee\u7b54',
  close: '\u5173\u95ed AI',
  title: '\u6587\u6863\u95ee\u7b54\u52a9\u624b',
  subtitle: '\u57fa\u4e8e\u7ec4\u4ef6\u6587\u6863\u3001\u793a\u4f8b\u4e0e\u7c7b\u578b\u5b9a\u4e49\u8fdb\u884c\u5411\u91cf\u68c0\u7d22\u56de\u7b54',
  unavailable: 'AI \u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528\u3002',
  failed: '\u8bf7\u6c42\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002',
  thinking: '\u6b63\u5728\u601d\u8003',
  restored: '\u5df2\u6062\u590d\u4e0a\u6b21\u5bf9\u8bdd',
  clear: '\u6e05\u7a7a',
  placeholder: '\u4f8b\u5982\uff1a\u6839\u636e\u5f53\u524d\u7ec4\u4ef6\u6587\u6863\u751f\u6210\u4e00\u4e2a\u8868\u5355\u573a\u666f\u793a\u4f8b',
  send: '\u53d1\u9001'
}

const formatRequestError = (requestError: unknown) => {
  const message = requestError instanceof Error ? requestError.message : text.failed

  if (message.includes('Unable to connect to Qdrant')) {
    return `向量检索服务还没准备好。\n请先启动 Qdrant，然后执行 npm run rag:index。\n\n${message}`
  }

  if (message.includes('Qdrant collection')) {
    return `向量索引还不存在。\n请在 Qdrant 启动后执行 npm run rag:index。\n\n${message}`
  }

  if (message.includes('EMBEDDING endpoint')) {
    return `Embedding 服务不可用。\n请检查 EMBEDDING_BASE_URL、EMBEDDING_API_KEY 和网络访问。\n\n${message}`
  }

  if (message.includes('LLM endpoint')) {
    return `大模型服务不可用。\n请检查 LLM_BASE_URL、LLM_API_KEY 和网络访问。\n\n${message}`
  }

  return message
}

const route = useRoute()
const open = ref(false)
const loading = ref(false)
const input = ref('')
const error = ref('')
const notice = ref('')
const viewport = ref<HTMLElement | null>(null)
const messages = ref<ChatMessage[]>([])
const scrollTop = ref(0)
const viewportHeight = ref(0)
const autoFollow = ref(true)
const messageHeights = ref<Record<number, number>>({})

let typewriterTimer: ReturnType<typeof window.setInterval> | null = null
let pendingTypewriterText = ''
let activeMessage: ChatMessage | null = null
let resizeObserver: ResizeObserver | null = null
const observedNodes = new Map<number, Element>()

const createWelcomeMessage = (): ChatMessage => ({
  id: Date.now(),
  role: 'assistant',
  content: text.welcome
})

const canSend = computed(() => input.value.trim().length > 0 && !loading.value)

const renderMarkdown = (content: string) => md.render(content)

const getStorageBucket = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, PersistedChatState>
  } catch {
    return {}
  }
}

const saveStorageBucket = (bucket: Record<string, PersistedChatState>) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bucket))
}

const sanitizedMessages = computed<ChatTurn[]>(() => {
  return messages.value
    .filter((message) => !message.streaming && !message.thinking && message.content.trim())
    .slice(-MAX_PERSISTED_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content
    }))
})

const persistMessages = () => {
  if (typeof window === 'undefined') {
    return
  }

  const bucket = getStorageBucket()
  bucket[route.path] = {
    route: route.path,
    updatedAt: Date.now(),
    messages: sanitizedMessages.value
  }
  saveStorageBucket(bucket)
}

const restoreMessagesForRoute = (targetRoute: string) => {
  const bucket = getStorageBucket()
  const saved = bucket[targetRoute]

  if (saved?.messages?.length) {
    messages.value = saved.messages.map((message, index) => ({
      id: Date.now() + index,
      role: message.role,
      content: message.content
    }))
    notice.value = text.restored
  } else {
    messages.value = [createWelcomeMessage()]
    notice.value = ''
  }

  messageHeights.value = {}
  scrollTop.value = 0
  autoFollow.value = true
}

const clearHistory = async () => {
  const bucket = getStorageBucket()
  delete bucket[route.path]
  saveStorageBucket(bucket)
  messages.value = [createWelcomeMessage()]
  messageHeights.value = {}
  error.value = ''
  notice.value = ''
  await nextTick()
  updateViewportMetrics()
  await scrollToBottom(true)
}

const estimateMessageHeight = (message: ChatMessage) => {
  if (message.thinking) {
    return 68
  }

  const base = message.role === 'user' ? 64 : 82
  const complexity = Math.ceil(message.content.length / 56) * 22
  return Math.min(Math.max(base + complexity, 64), 420)
}

const totalHeight = computed(() => {
  return messages.value.reduce((total, message) => {
    return total + (messageHeights.value[message.id] ?? estimateMessageHeight(message)) + 12
  }, 0)
})

const visibleRange = computed(() => {
  const currentScroll = scrollTop.value
  const currentViewportHeight = viewportHeight.value || 1
  let offset = 0
  let start = 0

  while (start < messages.value.length) {
    const message = messages.value[start]
    const size = (messageHeights.value[message.id] ?? estimateMessageHeight(message)) + 12
    if (offset + size >= currentScroll) {
      break
    }
    offset += size
    start += 1
  }

  let end = start
  let covered = 0
  while (end < messages.value.length && covered < currentViewportHeight) {
    const message = messages.value[end]
    covered += (messageHeights.value[message.id] ?? estimateMessageHeight(message)) + 12
    end += 1
  }

  return {
    start: Math.max(0, start - OVERSCAN),
    end: Math.min(messages.value.length, end + OVERSCAN)
  }
})

const virtualRows = computed<VirtualRow[]>(() => {
  const rows: VirtualRow[] = []
  let top = 0

  for (let index = 0; index < messages.value.length; index += 1) {
    const message = messages.value[index]
    const height = messageHeights.value[message.id] ?? estimateMessageHeight(message)

    if (index >= visibleRange.value.start && index < visibleRange.value.end) {
      rows.push({
        index,
        top,
        height,
        message
      })
    }

    top += height + 12
  }

  return rows
})

const updateViewportMetrics = () => {
  if (!viewport.value) {
    return
  }

  viewportHeight.value = viewport.value.clientHeight
}

const scrollToBottom = async (force = false) => {
  await nextTick()
  if (!viewport.value) {
    return
  }

  if (force || autoFollow.value) {
    viewport.value.scrollTop = Math.max(0, totalHeight.value - viewport.value.clientHeight)
    scrollTop.value = viewport.value.scrollTop
  }
}

const onViewportScroll = () => {
  if (!viewport.value) {
    return
  }

  scrollTop.value = viewport.value.scrollTop
  const distanceToBottom = totalHeight.value - (viewport.value.scrollTop + viewport.value.clientHeight)
  autoFollow.value = distanceToBottom < 96
}

watch(() => sanitizedMessages.value, () => {
  persistMessages()
}, { deep: true })

watch(() => route.path, async (nextRoute, previousRoute) => {
  if (nextRoute === previousRoute) {
    return
  }

  stopTypewriter()
  pendingTypewriterText = ''
  loading.value = false
  restoreMessagesForRoute(nextRoute)
  await nextTick()
  updateViewportMetrics()
  await scrollToBottom(true)
})

watch(messages, async () => {
  await nextTick()
  await scrollToBottom()
}, { deep: true })

const startTypewriter = (message: ChatMessage) => {
  activeMessage = message
  if (typewriterTimer) {
    return
  }

  typewriterTimer = window.setInterval(() => {
    if (!activeMessage || pendingTypewriterText.length === 0) {
      return
    }

    const step = pendingTypewriterText.length > 24 ? 3 : 1
    activeMessage.content += pendingTypewriterText.slice(0, step)
    pendingTypewriterText = pendingTypewriterText.slice(step)
  }, 22)
}

const stopTypewriter = () => {
  if (activeMessage && pendingTypewriterText) {
    activeMessage.content += pendingTypewriterText
  }
  pendingTypewriterText = ''
  activeMessage = null

  if (typewriterTimer) {
    window.clearInterval(typewriterTimer)
    typewriterTimer = null
  }
}

const parseSseEvent = (eventText: string, onDelta: (content: string) => void) => {
  const lines = eventText.replace(/\r\n/g, '\n').split('\n')
  const eventName = lines.find((line) => line.startsWith('event:'))?.slice(6).trim() || 'message'
  const dataText = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .join('')

  if (!dataText || dataText === '[DONE]') {
    return false
  }

  const payload = JSON.parse(dataText) as { content?: string, message?: string }
  if (eventName === 'delta' && payload.content) {
    onDelta(payload.content)
    return true
  }

  if (eventName === 'error') {
    throw new Error(payload.message || text.unavailable)
  }

  return false
}

const readSseStream = async (response: Response, onDelta: (content: string) => void) => {
  if (!response.body) {
    throw new Error(text.unavailable)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let hasDelta = false
  const startedAt = Date.now()

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    buffer = buffer.replace(/\r\n/g, '\n')
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const eventText of events) {
      if (!eventText.trim()) {
        continue
      }

      hasDelta = parseSseEvent(eventText, onDelta) || hasDelta
    }

    if (!hasDelta && Date.now() - startedAt > 30000) {
      throw new Error('AI did not return any stream chunk for 30 seconds. Please check the server terminal logs and retry.')
    }
  }

  if (buffer.trim()) {
    hasDelta = parseSseEvent(buffer, onDelta) || hasDelta
  }

  if (!hasDelta) {
    throw new Error('AI did not return displayable content. Please retry later.')
  }
}

const sendQuestion = async () => {
  const question = input.value.trim()
  if (!question || loading.value) {
    return
  }

  error.value = ''
  notice.value = ''
  loading.value = true
  pendingTypewriterText = ''
  const history = sanitizedMessages.value.slice(-8)

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: question
  })

  const assistantMessage = reactive<ChatMessage>({
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
    thinking: true,
    streaming: true
  })
  messages.value.push(assistantMessage)
  input.value = ''
  autoFollow.value = true

  try {
    const response = await fetch('/api/rag/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        history,
        route: route.path
      })
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: text.unavailable })) as { message?: string }
      throw new Error(payload.message || text.unavailable)
    }

    await readSseStream(response, (content) => {
      assistantMessage.thinking = false
      pendingTypewriterText += content
      startTypewriter(assistantMessage)
    })
    stopTypewriter()
  } catch (requestError) {
    stopTypewriter()
    assistantMessage.content = ''
    assistantMessage.thinking = false
    error.value = formatRequestError(requestError)
  } finally {
    assistantMessage.streaming = false
    loading.value = false
  }
}

const onKeydown = async (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    await sendQuestion()
  }
}

const setMessageRef = (messageId: number) => {
  return (element: Element | null) => {
    const previous = observedNodes.get(messageId)
    if (previous && resizeObserver) {
      resizeObserver.unobserve(previous)
      observedNodes.delete(messageId)
    }

    if (!element || !resizeObserver) {
      return
    }

    observedNodes.set(messageId, element)
    resizeObserver.observe(element)
  }
}

onMounted(async () => {
  resizeObserver = new ResizeObserver((entries) => {
    let changed = false
    for (const entry of entries) {
      const messageId = Number((entry.target as HTMLElement).dataset.messageId)
      if (!messageId) {
        continue
      }

      const nextHeight = Math.ceil(entry.target.getBoundingClientRect().height)
      if (messageHeights.value[messageId] !== nextHeight) {
        messageHeights.value = {
          ...messageHeights.value,
          [messageId]: nextHeight
        }
        changed = true
      }
    }

    if (changed && autoFollow.value) {
      void scrollToBottom()
    }
  })

  restoreMessagesForRoute(route.path)
  await nextTick()
  updateViewportMetrics()
  window.addEventListener('resize', updateViewportMetrics)
  await scrollToBottom(true)
})

onBeforeUnmount(() => {
  stopTypewriter()
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateViewportMetrics)
})
</script>

<template>
  <div class="rag-assistant">
    <button class="rag-assistant__trigger" type="button" @click="open = !open">
      {{ open ? text.close : text.open }}
    </button>

    <transition name="rag-panel">
      <section v-if="open" class="rag-assistant__panel">
        <header class="rag-assistant__header">
          <div>
            <strong>{{ text.title }}</strong>
            <p>{{ text.subtitle }}</p>
          </div>
          <div class="rag-assistant__header-actions">
            <button type="button" class="rag-assistant__clear" @click="clearHistory">
              {{ text.clear }}
            </button>
            <button type="button" class="rag-assistant__close" @click="open = false">x</button>
          </div>
        </header>

        <div
          ref="viewport"
          class="rag-assistant__messages"
          @scroll="onViewportScroll"
        >
          <div class="rag-assistant__spacer" :style="{ height: `${totalHeight}px` }">
            <article
              v-for="row in virtualRows"
              :key="row.message.id"
              :ref="setMessageRef(row.message.id)"
              class="rag-assistant__message"
              :class="[`is-${row.message.role}`, { 'is-streaming': row.message.streaming }]"
              :data-message-id="row.message.id"
              :style="{ transform: `translateY(${row.top}px)` }"
            >
              <div v-if="row.message.role === 'assistant'">
                <div v-if="row.message.thinking" class="rag-assistant__thinking" aria-live="polite">
                  <span class="rag-assistant__spinner" />
                  <span>{{ text.thinking }}</span>
                  <span class="rag-assistant__dots"><i /> <i /> <i /></span>
                </div>
                <div v-else class="rag-assistant__markdown" v-html="renderMarkdown(row.message.content)" />
              </div>
              <p v-else>{{ row.message.content }}</p>
            </article>
          </div>

          <p v-if="notice" class="rag-assistant__notice">{{ notice }}</p>
          <p v-if="error" class="rag-assistant__error">{{ error }}</p>
        </div>

        <footer class="rag-assistant__footer">
          <textarea
            v-model="input"
            class="rag-assistant__input"
            rows="3"
            :placeholder="text.placeholder"
            @keydown="onKeydown"
          />
          <button class="rag-assistant__send" type="button" :disabled="!canSend" @click="sendQuestion">
            {{ text.send }}
          </button>
        </footer>
      </section>
    </transition>
  </div>
</template>
