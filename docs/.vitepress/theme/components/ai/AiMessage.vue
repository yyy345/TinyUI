<script setup lang="ts">
import { withBase } from 'vitepress'
import type { AiMessage } from './types'
import AiMarkdown from './AiMarkdown.vue'

defineProps<{ message: AiMessage }>()
defineEmits<{ retry: [message: AiMessage] }>()
</script>

<template>
  <article class="ai-message" :class="`is-${message.role}`">
    <div v-if="message.loading" class="ai-message__thinking" aria-live="polite">
      <span /><span /><span />
      <em>正在思考</em>
    </div>
    <AiMarkdown v-else-if="message.role === 'assistant'" :content="message.content" />
    <p v-else>{{ message.content }}</p>

    <div v-if="message.error" class="ai-message__error">
      <button type="button" @click="$emit('retry', message)">重新生成</button>
    </div>
    <div v-if="message.sources?.length && !message.loading" class="ai-message__sources">
      <strong>参考文档</strong>
      <a
        v-for="source in message.sources"
        :key="`${source.url}-${source.title}`"
        :href="withBase(source.url)"
      >{{ source.title }}</a>
    </div>
  </article>
</template>
