<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue: string, loading: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
  stop: []
}>()
const canSend = computed(() => props.modelValue.trim().length > 0 && !props.loading)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (canSend.value) emit('send')
  }
}
</script>

<template>
  <footer class="ai-input">
    <textarea
      :value="modelValue"
      rows="3"
      maxlength="4000"
      placeholder="请输入你想了解的组件问题，例如：Table 如何实现分页？"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @keydown="onKeydown"
    />
    <div class="ai-input__actions">
      <span>{{ modelValue.length }}/4000 · Shift + Enter 换行</span>
      <button v-if="loading" class="is-stop" type="button" @click="$emit('stop')">停止生成</button>
      <button v-else type="button" :disabled="!canSend" @click="$emit('send')">发送</button>
    </div>
  </footer>
</template>
