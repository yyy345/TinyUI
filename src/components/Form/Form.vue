<template>
  <form class="el-form" :class="formClasses">
    <slot />
  </form>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import type { ValidateFieldsError } from 'async-validator'
import { formProps, formContextKey } from './types'
import type {
  Arrayable,
  FormContext,
  FormItemContext,
  FormItemProp,
  FormValidateFailure
} from './types'

const props = defineProps(formProps)

defineOptions({
  name: 'ElForm'
})

const fields: FormItemContext[] = []

const formClasses = computed(() => ({
  'el-form--inline': props.inline,
  [`el-form--label-${props.labelPosition}`]: props.labelPosition
}))

const normalizeProps = (fieldProps?: Arrayable<FormItemProp>) => {
  if (!fieldProps) return []
  return Array.isArray(fieldProps) ? fieldProps : [fieldProps]
}

const getFilteredFields = (fieldProps?: Arrayable<FormItemProp>) => {
  const fieldKeys = normalizeProps(fieldProps)
  if (fieldKeys.length === 0) return fields
  return fields.filter(field => fieldKeys.includes(field.prop))
}

const addField: FormContext['addField'] = (field) => {
  if (field.prop && !fields.includes(field)) {
    fields.push(field)
  }
}

const removeField: FormContext['removeField'] = (field) => {
  const index = fields.indexOf(field)
  if (index > -1) {
    fields.splice(index, 1)
  }
}

const resetFields: FormContext['resetFields'] = (fieldProps) => {
  getFilteredFields(fieldProps).forEach(field => field.resetField())
}

const clearValidate: FormContext['clearValidate'] = (fieldProps) => {
  getFilteredFields(fieldProps).forEach(field => field.clearValidate())
}

const scrollToField: FormContext['scrollToField'] = (fieldProp) => {
  const field = getFilteredFields(fieldProp)[0]
  field?.$el?.scrollIntoView(props.scrollIntoViewOptions)
}

// Form 只聚合各个 FormItem 的结果，不直接关心具体规则怎么校验。
const validate: FormContext['validate'] = async (fieldProps) => {
  const targetFields = getFilteredFields(fieldProps)
  let validationErrors: ValidateFieldsError = {}

  for (const field of targetFields) {
    try {
      await field.validate('')
    } catch (e) {
      const error = e as FormValidateFailure
      if (error.fields) {
        validationErrors = {
          ...validationErrors,
          ...error.fields
        }
      }
    }
  }

  if (Object.keys(validationErrors).length === 0) return true

  if (props.scrollToError) {
    const firstErrorProp = Object.keys(validationErrors)[0]
    if (firstErrorProp) scrollToField(firstErrorProp)
  }

  return Promise.reject(validationErrors)
}

const validateField: FormContext['validateField'] = (fieldProps) => {
  return validate(fieldProps)
}

defineExpose({
  /** @description 验证表单 */
  validate,
  /** @description 验证指定字段 */
  validateField,
  /** @description 重置字段 */
  resetFields,
  /** @description 清除验证状态 */
  clearValidate,
  /** @description 滚动到指定字段 */
  scrollToField,
})

provide(
  formContextKey,
  {
    get model() {
      return props.model
    },
    get rules() {
      return props.rules
    },
    get labelWidth() {
      return props.labelWidth
    },
    get labelPosition() {
      return props.labelPosition
    },
    get inline() {
      return props.inline
    },
    get showMessage() {
      return props.showMessage
    },
    get scrollToError() {
      return props.scrollToError
    },
    get scrollIntoViewOptions() {
      return props.scrollIntoViewOptions
    },
    addField,
    removeField,
    resetFields,
    clearValidate,
    validate,
    validateField,
    scrollToField
  }
)
</script>
