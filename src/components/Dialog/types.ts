import type { CSSProperties } from 'vue'

export interface DialogProps {
  modelValue: boolean
  title?: string
  width?: string | number
  top?: string
  modal?: boolean
  showClose?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  lockScroll?: boolean
  draggable?: boolean
  center?: boolean
  destroyOnClose?: boolean
  beforeClose?: (done: () => void) => void
  customStyle?: CSSProperties
}

export interface DialogEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'close'): void
  (e: 'closed'): void
  (e: 'confirm'): void
}

export interface DialogInstance {
  handleClose: () => void
  resetPosition: () => void
}
