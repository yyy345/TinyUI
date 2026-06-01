export type RichTextToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'orderedList'
  | 'unorderedList'
  | 'link'
  | 'clearFormat'

export interface RichTextEditorProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
  toolbar?: RichTextToolbarAction[]
  minHeight?: string | number
  maxHeight?: string | number
  validateEvent?: boolean
  pasteAsPlainText?: boolean
}

export interface RichTextEditorEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
  (e: 'change', value: string): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
}

export interface RichTextEditorInstance {
  ref: HTMLDivElement | undefined
  focus: () => void
  blur: () => void
  clear: () => void
  getHtml: () => string
  setHtml: (value: string) => void
  exec: (action: RichTextToolbarAction) => void
}
