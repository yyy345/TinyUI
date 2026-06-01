import type { PropType, InjectionKey, ExtractPropTypes } from 'vue'
import type { RuleItem, ValidateError, ValidateFieldsError } from 'async-validator'

export type Arrayable<T> = T | T[]
export type FormItemProp = string
export type FormLabelPosition = 'left' | 'right' | 'top'

// FormItemRule 在 async-validator 规则上补充 trigger，
// 让输入类组件可以按 blur / change / input 等时机触发局部校验。
export interface FormItemRule extends RuleItem {
  trigger?: Arrayable<string>
}

export type FormRules = Partial<Record<FormItemProp, Arrayable<FormItemRule>>>
export type FormValidationResult = Promise<boolean>

export const formProps = {
  model: {
    type: Object as PropType<Record<string, any>>
  },
  rules: {
    type: Object as PropType<FormRules>
  },
  labelWidth: {
    type: [String, Number] as PropType<string | number>
  },
  labelPosition: {
    type: String as PropType<FormLabelPosition>,
    default: 'right'
  },
  inline: {
    type: Boolean
  },
  showMessage: {
    type: Boolean,
    default: true
  },
  scrollToError: {
    type: Boolean
  },
  scrollIntoViewOptions: {
    type: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
    default: () => ({ block: 'center', behavior: 'smooth' })
  }
}

export const formItemProps = {
  label: {
    type: String
  },
  prop: {
    type: String
  },
  rules: {
    type: [Object, Array] as PropType<Arrayable<FormItemRule>>
  },
  required: {
    type: Boolean
  },
  labelWidth: {
    type: [String, Number] as PropType<string | number>
  },
  showMessage: {
    type: Boolean,
    default: undefined
  }
}

export type FormItemProps = ExtractPropTypes<typeof formItemProps>
export type FormProps = ExtractPropTypes<typeof formProps>

// Form 是调度中心，FormItem 是字段节点；上下文把两者解耦。
export interface FormContext extends FormProps {
  addField: (field: FormItemContext) => void
  removeField: (field: FormItemContext) => void
  resetFields: (props?: Arrayable<FormItemProp>) => void
  clearValidate: (props?: Arrayable<FormItemProp>) => void
  validate: (props?: Arrayable<FormItemProp>) => FormValidationResult
  validateField: (props?: Arrayable<FormItemProp>) => FormValidationResult
  scrollToField: (prop: FormItemProp) => void
}

export interface FormItemContext {
  $el?: HTMLDivElement
  prop: FormItemProp
  resetField: () => void
  clearValidate: () => void
  validate: (trigger?: string) => FormValidationResult
}

export interface FormValidateFailure {
  errors: ValidateError[] | null
  fields: ValidateFieldsError
}

export const formContextKey: InjectionKey<FormContext> =
  Symbol('formContextKey')

export const formItemContextKey: InjectionKey<FormItemContext> =
  Symbol('formItemContextKey')
