<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'

const AiChatPanel = defineAsyncComponent(() => import('./ai/AiChatPanel.vue'))
const open = ref(false)
</script>

<template>
  <div class="ai-assistant">
    <Transition name="ai-panel">
      <AiChatPanel v-if="open" @close="open = false" />
    </Transition>
    <button
      class="ai-assistant__trigger"
      type="button"
      title="AI 组件助手"
      aria-label="打开 AI 组件助手"
      :aria-expanded="open"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a7 7 0 0 0-4.7 12.18L6 18h4l2 4 2-4h4l-1.3-3.82A7 7 0 0 0 12 2Zm-2.5 8.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
      </svg>
      <span>AI 助手</span>
    </button>
  </div>
</template>
