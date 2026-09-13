<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

defineProps<{ content: string }>()

const escape = (value: string) => MarkdownIt().utils.escapeHtml(value)
const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true })
markdown.renderer.rules.fence = (tokens, index) => {
  const token = tokens[index]
  const language = token.info.trim().split(/\s+/)[0] || 'text'
  const code = language !== 'text' && hljs.getLanguage(language)
    ? hljs.highlight(token.content, { language }).value
    : escape(token.content)
  return `<div class="ai-code-block"><div class="ai-code-block__bar"><span>${escape(language)}</span><button type="button" data-copy-code>复制</button></div><pre class="hljs"><code>${code}</code></pre></div>`
}

const copyCode = async (event: MouseEvent) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-copy-code]')
  if (!button) return
  const code = button.closest('.ai-code-block')?.querySelector('code')?.textContent ?? ''
  try {
    await navigator.clipboard.writeText(code)
    button.textContent = '已复制'
    window.setTimeout(() => { button.textContent = '复制' }, 1500)
  } catch {
    button.textContent = '复制失败'
  }
}
</script>

<template>
  <div class="ai-markdown" @click="copyCode" v-html="markdown.render(content)" />
</template>
