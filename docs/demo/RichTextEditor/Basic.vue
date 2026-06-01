<template>
  <div class="demo-rich-text">
    <el-rich-text-editor
      v-model="content"
      placeholder="写一点项目介绍、发布说明或面试复盘"
    />

    <div class="demo-preview">
      <p class="demo-preview__title">当前 HTML</p>
      <pre>{{ content }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ElRichTextEditor from '@/components/RichTextEditor/RichTextEditor.vue'

const content = ref('<p><strong>TinyElement</strong> 是一个用于学习 Vue 3 组件库设计的项目。</p>')
</script>

<style scoped>
.demo-rich-text {
  display: grid;
  gap: 16px;
}

.demo-preview {
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.demo-preview__title {
  margin: 0 0 8px;
  font-size: 13px;
  color: #64748b;
}

.demo-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.6;
}
</style>
