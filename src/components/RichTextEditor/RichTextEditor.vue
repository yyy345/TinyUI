<template>
  <div
    class="el-rich-text-editor"
    :class="{
      'is-disabled': disabled,
      'is-readonly': readonly,
      'is-focus': isFocus
    }"
  >
    <div v-if="toolbarItems.length > 0" class="el-rich-text-editor__toolbar">
      <button
        v-for="action in toolbarItems"
        :key="action"
        type="button"
        class="el-rich-text-editor__tool"
        :class="{ 'is-active': isActive(action) }"
        :title="toolbarActionMap[action].label"
        :aria-label="toolbarActionMap[action].label"
        :aria-pressed="isActive(action)"
        :disabled="!canEdit"
        @mousedown.prevent
        @click="exec(action)"
      >
        <el-icon :icon="toolbarActionMap[action].icon" />
      </button>
    </div>

    <div
      ref="editorRef"
      class="el-rich-text-editor__content"
      :class="{ 'is-empty': isEmpty }"
      :style="editorStyle"
      :contenteditable="canEdit"
      :data-placeholder="placeholder"
      :aria-disabled="disabled"
      :aria-readonly="readonly"
      role="textbox"
      tabindex="0"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @paste="handlePaste"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type {
  RichTextEditorEmits,
  RichTextEditorProps,
  RichTextToolbarAction
} from './types'
import ElIcon from '../Icon/Icon.vue'
import { formItemContextKey } from '../Form/types'

const toolbarActionMap: Record<RichTextToolbarAction, {
  icon: string
  label: string
  command?: string
}> = {
  bold: { icon: 'bold', label: '加粗', command: 'bold' },
  italic: { icon: 'italic', label: '斜体', command: 'italic' },
  underline: { icon: 'underline', label: '下划线', command: 'underline' },
  strike: { icon: 'strikethrough', label: '删除线', command: 'strikeThrough' },
  orderedList: { icon: 'list-ol', label: '有序列表', command: 'insertOrderedList' },
  unorderedList: { icon: 'list-ul', label: '无序列表', command: 'insertUnorderedList' },
  link: { icon: 'link', label: '插入链接' },
  clearFormat: { icon: 'eraser', label: '清除格式', command: 'removeFormat' }
}

const props = withDefaults(defineProps<RichTextEditorProps>(), {
  modelValue: '',
  placeholder: '请输入内容',
  toolbar: () => [
    'bold',
    'italic',
    'underline',
    'strike',
    'orderedList',
    'unorderedList',
    'link',
    'clearFormat'
  ],
  minHeight: 160,
  validateEvent: true,
  pasteAsPlainText: true
})

const emits = defineEmits<RichTextEditorEmits>()

defineOptions({
  name: 'ElRichTextEditor'
})

const editorRef = ref<HTMLDivElement>()
const currentHtml = ref(props.modelValue)
const activeActions = ref<RichTextToolbarAction[]>([])
const isFocus = ref(false)
const formItemContext = inject(formItemContextKey)

const toolbarItems = computed(() => props.toolbar)
const canEdit = computed(() => !props.disabled && !props.readonly)

const addUnit = (value?: string | number) => {
  if (value === undefined || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : value
}

const editorStyle = computed(() => ({
  minHeight: addUnit(props.minHeight),
  maxHeight: addUnit(props.maxHeight)
}))

const htmlToText = (html: string) => {
  return html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

const isEmpty = computed(() => htmlToText(currentHtml.value).length === 0)

const syncEditorContent = (value: string) => {
  currentHtml.value = value
  if (editorRef.value && editorRef.value.innerHTML !== value) {
    editorRef.value.innerHTML = value
  }
}

const emitValue = (eventName: 'input' | 'change' = 'input') => {
  const value = editorRef.value?.innerHTML || ''
  currentHtml.value = value
  emits('update:modelValue', value)
  if (eventName === 'input') {
    emits('input', value)
  } else {
    emits('change', value)
  }
}

const runValidation = (trigger: string) => {
  if (!props.validateEvent) return
  formItemContext?.validate(trigger).catch(() => undefined)
}

const handleInput = () => {
  emitValue('input')
  runValidation('input')
  updateActiveActions()
}

const handleFocus = (event: FocusEvent) => {
  isFocus.value = true
  emits('focus', event)
  updateActiveActions()
}

const handleBlur = (event: FocusEvent) => {
  isFocus.value = false
  emitValue('change')
  emits('blur', event)
  runValidation('blur')
}

const runDocumentCommand = (command: string, value?: string) => {
  if (typeof document.execCommand !== 'function') return
  document.execCommand(command, false, value)
}

const insertPlainText = (text: string) => {
  runDocumentCommand('insertText', text)
}

const handlePaste = (event: ClipboardEvent) => {
  if (!props.pasteAsPlainText || !canEdit.value) return
  event.preventDefault()
  insertPlainText(event.clipboardData?.getData('text/plain') || '')
  handleInput()
}

const createLink = () => {
  const url = window.prompt('请输入链接地址')
  if (!url) return
  const normalizedUrl = /^https?:\/\//.test(url) ? url : `https://${url}`
  runDocumentCommand('createLink', normalizedUrl)
}

const exec = (action: RichTextToolbarAction) => {
  if (!canEdit.value) return

  focus()

  if (action === 'link') {
    createLink()
  } else {
    const command = toolbarActionMap[action].command
    if (command) runDocumentCommand(command)
  }

  emitValue('input')
  runValidation('input')
  updateActiveActions()
}

const updateActiveActions = () => {
  if (!editorRef.value || typeof document.queryCommandState !== 'function') {
    activeActions.value = []
    return
  }

  activeActions.value = toolbarItems.value.filter((action) => {
    const command = toolbarActionMap[action].command
    return command ? document.queryCommandState(command) : false
  })
}

const isActive = (action: RichTextToolbarAction) => {
  return activeActions.value.includes(action)
}

const focus = () => {
  editorRef.value?.focus()
}

const blur = () => {
  editorRef.value?.blur()
}

const clear = () => {
  syncEditorContent('')
  emits('update:modelValue', '')
  emits('input', '')
  emits('change', '')
  runValidation('change')
}

const getHtml = () => currentHtml.value

const setHtml = (value: string) => {
  syncEditorContent(value)
  emits('update:modelValue', value)
  emits('input', value)
  runValidation('input')
}

watch(() => props.modelValue, (value) => {
  if (value !== currentHtml.value) {
    syncEditorContent(value)
  }
})

onMounted(() => {
  syncEditorContent(props.modelValue)
  document.addEventListener('selectionchange', updateActiveActions)
  if (props.autofocus) {
    nextTick(() => focus())
  }
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', updateActiveActions)
})

defineExpose({
  ref: editorRef,
  focus,
  blur,
  clear,
  getHtml,
  setHtml,
  exec
})
</script>
