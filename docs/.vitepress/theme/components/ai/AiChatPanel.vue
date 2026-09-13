<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import AiInput from './AiInput.vue'
import AiMessageView from './AiMessage.vue'
import { getPageContext, getRecommendedQuestions } from './page-context'
import { useAiChat } from './useAiChat'
import type { AiMessage } from './types'

const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const input = ref('')
const viewport = ref<HTMLElement>()
const followOutput = ref(true)
const { messages, loading, error, sendMessage, retryMessage, stopGeneration, clearMessages } = useAiChat()
const currentContext = () => getPageContext(route.path)
const suggestions = computed(() => getRecommendedQuestions(currentContext().component))

const submit = async (question = input.value) => {
  if (!question.trim() || loading.value) return
  input.value = ''
  followOutput.value = true
  await sendMessage(question, currentContext())
}

const retry = (message: AiMessage) => retryMessage(message, currentContext())
const close = () => {
  stopGeneration()
  emit('close')
}
const onScroll = () => {
  if (!viewport.value) return
  const distance = viewport.value.scrollHeight - viewport.value.scrollTop - viewport.value.clientHeight
  followOutput.value = distance < 80
}

watch(messages, async () => {
  await nextTick()
  if (viewport.value && followOutput.value) viewport.value.scrollTop = viewport.value.scrollHeight
}, { deep: true, flush: 'post' })
</script>

<template>
  <section class="ai-panel" role="dialog" aria-label="组件库 AI 助手">
    <header class="ai-panel__header">
      <div class="ai-panel__identity">
        <span class="ai-panel__logo">AI</span>
        <div><strong>组件库 AI 助手</strong><p>询问组件用法、API、示例代码等问题</p></div>
      </div>
      <div class="ai-panel__header-actions">
        <button type="button" title="清空会话" @click="clearMessages">清空</button>
        <button class="ai-panel__close" type="button" title="关闭" @click="close">×</button>
      </div>
    </header>

    <main ref="viewport" class="ai-panel__messages" @scroll="onScroll">
      <div v-if="messages.length === 0" class="ai-welcome">
        <span class="ai-welcome__icon">✦</span>
        <h3>你好，我是组件库 AI 助手 👋</h3>
        <p>你可以询问组件用法、API、示例代码和常见问题。</p>
        <div class="ai-suggestions">
          <button v-for="question in suggestions" :key="question" type="button" @click="submit(question)">
            {{ question }}
          </button>
        </div>
      </div>
      <AiMessageView
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @retry="retry"
      />
      <div v-if="messages.length && !loading" class="ai-suggestions is-followup">
        <button v-for="question in suggestions.slice(0, 3)" :key="question" type="button" @click="submit(question)">
          {{ question }}
        </button>
      </div>
    </main>
    <AiInput v-model="input" :loading="loading" @send="submit()" @stop="stopGeneration" />
  </section>
</template>
