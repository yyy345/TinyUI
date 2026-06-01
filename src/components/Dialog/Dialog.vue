<template>
  <Transition
    name="el-dialog-fade"
    @after-enter="emit('opened')"
    @after-leave="handleAfterLeave"
  >
    <div
      v-if="rendered"
      v-show="visible"
      class="el-dialog"
    >
      <div
        v-if="modal"
        class="el-dialog__overlay"
        @click="handleOverlayClick"
      ></div>
      <div class="el-dialog__wrapper">
        <div
          ref="dialogRef"
          class="el-dialog__content"
          :class="{ 'is-center': center }"
          :style="dialogStyle"
          @click.stop
        >
          <div
            class="el-dialog__header"
            :class="{ 'is-draggable': draggable }"
            @mousedown="handleDragStart"
          >
            <slot name="header">
              <span class="el-dialog__title">{{ title }}</span>
            </slot>
            <button
              v-if="showClose"
              class="el-dialog__headerbtn"
              type="button"
              aria-label="close"
              @click="handleClose"
            >
              <el-icon icon="xmark" />
            </button>
          </div>

          <div class="el-dialog__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="el-dialog__footer">
            <slot name="footer" :close="handleClose" :confirm="handleConfirm" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import ElIcon from '../Icon/Icon.vue'
import type { DialogEmits, DialogInstance, DialogProps } from './types'

defineOptions({
  name: 'ElDialog'
})

const props = withDefaults(defineProps<DialogProps>(), {
  title: '',
  width: '50%',
  top: '15vh',
  modal: true,
  showClose: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  lockScroll: true,
  draggable: false,
  center: false,
  destroyOnClose: false
})

const emit = defineEmits<DialogEmits>()
const visible = ref(props.modelValue)
const rendered = ref(props.modelValue)
const dialogRef = ref<HTMLDivElement>()
const bodyOverflow = ref('')
const dragState = reactive({
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
  dragging: false
})

const normalizeWidth = (width: string | number) => {
  return typeof width === 'number' ? `${width}px` : width
}

const dialogStyle = computed<CSSProperties>(() => ({
  width: normalizeWidth(props.width),
  marginTop: props.top,
  transform: `translate(${dragState.x}px, ${dragState.y}px)`,
  ...props.customStyle
}))

const lockBodyScroll = () => {
  if (!props.lockScroll || typeof document === 'undefined') return
  bodyOverflow.value = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

const unlockBodyScroll = () => {
  if (!props.lockScroll || typeof document === 'undefined') return
  document.body.style.overflow = bodyOverflow.value
}

const openDialog = () => {
  rendered.value = true
  visible.value = true
  emit('open')
  lockBodyScroll()
}

const closeDialog = () => {
  emit('close')
  visible.value = false
}

const doClose = () => {
  emit('update:modelValue', false)
}

const handleClose = () => {
  if (props.beforeClose) {
    props.beforeClose(doClose)
    return
  }
  doClose()
}

const handleConfirm = () => {
  emit('confirm')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (!props.closeOnClickModal) return
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!visible.value || !props.closeOnPressEscape) return
  if (event.code === 'Escape') {
    handleClose()
  }
}

const resetPosition = () => {
  dragState.x = 0
  dragState.y = 0
}

const stopDragging = () => {
  dragState.dragging = false
}

const handleDragging = (event: MouseEvent) => {
  if (!dragState.dragging) return
  dragState.x = event.clientX - dragState.startX
  dragState.y = event.clientY - dragState.startY
}

const handleDragStart = (event: MouseEvent) => {
  if (!props.draggable) return
  dragState.dragging = true
  dragState.startX = event.clientX - dragState.x
  dragState.startY = event.clientY - dragState.y
}

const handleAfterLeave = () => {
  unlockBodyScroll()
  if (props.destroyOnClose) {
    rendered.value = false
  }
  emit('closed')
}

watch(() => props.modelValue, (value) => {
  if (value) {
    openDialog()
  } else if (visible.value) {
    closeDialog()
  }
}, { immediate: true })

if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', handleDragging)
  window.addEventListener('mouseup', stopDragging)
  document.addEventListener('keydown', handleKeydown)
}

onBeforeUnmount(() => {
  unlockBodyScroll()
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', handleDragging)
    window.removeEventListener('mouseup', stopDragging)
    document.removeEventListener('keydown', handleKeydown)
  }
})

defineExpose<DialogInstance>({
  handleClose,
  resetPosition
})
</script>
