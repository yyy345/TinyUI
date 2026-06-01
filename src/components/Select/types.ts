import type { VNode } from 'vue'

export type SelectValue = string | number

export interface SelectOptions {
  label: string
  value: SelectValue
  disabled?: boolean
}

export type RenderLabelFunc = (option: SelectOptions) => VNode
export type CustomFilterFunc = (value: string) => SelectOptions[]
export type CustomFilterRemoteFunc = (value: string) => Promise<SelectOptions[]>

// props
export interface SelectProps {
  modelValue: SelectValue | ''
  options?: SelectOptions[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  renderLabel?: RenderLabelFunc
  filterable?: boolean
  filterMethod?: CustomFilterFunc
  remote?: boolean
  remoteMethod?: CustomFilterRemoteFunc
}

export interface SelectStates {
  inputValue: string
  selectOption: null | SelectOptions
  mouseHover: boolean
  loading: boolean
}

export interface SelectEmits {
  (e: 'change', value: SelectValue | ''): void
  (e: 'visible-change', value: boolean): void
  (e: 'update:modelValue', value: SelectValue | ''): void
  (e: 'clear'): void
}
