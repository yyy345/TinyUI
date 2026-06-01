<template>
  <div 
    class="el-form-item" 
    ref="formItemRef"
    :class="formItemClasses"
  >
    <div
      v-if="label || $slots.label"
      class="el-form-item__label"
      :style="labelStyle"
    >
      <slot name="label" :label="label">
        {{ label }}
      </slot>
    </div>

    <div class="el-form-item__content">
      <slot
        :validate="validate"
        :reset-field="resetField"
        :clear-validate="clearValidate"
      />
      <div
        v-if="validateStatus.state === 'error' && showMessage"
        class="el-form-item__error-msg"
        role="alert"
      >
        {{ validateStatus.errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, provide, reactive, ref } from 'vue'
import AsyncValidator from 'async-validator'
import type { RuleItem } from 'async-validator'
import { cloneDeep } from 'lodash-es'
import { formItemProps, formContextKey, formItemContextKey } from './types'
import type {
  Arrayable,
  FormItemContext,
  FormItemRule,
  FormValidateFailure
} from './types'

type ValidateState = 'init' | 'validating' | 'success' | 'error'

const props = defineProps(formItemProps)

defineOptions({
  name: 'ElFormItem'
})

const formContext = inject(formContextKey)
const formItemRef = ref<HTMLDivElement>()

const validateStatus = reactive({
  state: 'init' as ValidateState,
  errorMsg: '',
  loading: false
})

const normalizeRules = (rules?: Arrayable<FormItemRule>) => {
  if (!rules) return []
  return Array.isArray(rules) ? rules : [rules]
}

const addUnit = (value?: string | number) => {
  if (value === undefined || value === '') return ''
  return typeof value === 'number' ? `${value}px` : value
}

const pathToSegments = (path: string) => {
  return path
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/^\./, '')
    .split('.')
    .filter(Boolean)
}

const getValueByPath = (source: Record<string, any>, path: string) => {
  return pathToSegments(path).reduce<any>((current, key) => {
    return current == null ? undefined : current[key]
  }, source)
}

const setValueByPath = (source: Record<string, any>, path: string, value: any) => {
  const segments = pathToSegments(path)
  const lastKey = segments.pop()
  if (!lastKey) return

  const target = segments.reduce<any>((current, key) => {
    if (current[key] == null) current[key] = {}
    return current[key]
  }, source)

  target[lastKey] = value
}

const innerValue = computed(() => {
  const model = formContext?.model
  if (!model || !props.prop) return undefined
  return getValueByPath(model, props.prop)
})

let initialValue: any = undefined

const getItemRules = computed<FormItemRule[]>(() => {
  const formRules = props.prop && formContext?.rules
    ? normalizeRules(formContext.rules[props.prop])
    : []
  const selfRules = normalizeRules(props.rules)
  const rules = [...formRules, ...selfRules]

  if (props.required && !rules.some(rule => rule.required)) {
    return [
      {
        required: true,
        message: `请填写${props.label || props.prop}`,
        trigger: 'blur'
      },
      ...rules
    ]
  }

  return rules
})

const isRequired = computed(() => {
  return props.required || getItemRules.value.some(rule => rule.required)
})

const showMessage = computed(() => {
  return props.showMessage ?? formContext?.showMessage ?? true
})

const labelPosition = computed(() => formContext?.labelPosition ?? 'right')

const labelStyle = computed(() => {
  if (labelPosition.value === 'top') return {}
  const labelWidth = props.labelWidth ?? formContext?.labelWidth
  return labelWidth ? { width: addUnit(labelWidth) } : {}
})

const formItemClasses = computed(() => ({
  'is-error': validateStatus.state === 'error',
  'is-success': validateStatus.state === 'success',
  'is-loading': validateStatus.loading,
  'is-required': isRequired.value,
  [`el-form-item--label-${labelPosition.value}`]: labelPosition.value
}))

const shouldValidateByTrigger = (rule: FormItemRule, trigger?: string) => {
  if (!trigger) return true
  if (!rule.trigger) return true
  return Array.isArray(rule.trigger)
    ? rule.trigger.includes(trigger)
    : rule.trigger === trigger
}

const getTriggeredRules = (trigger?: string) => {
  return getItemRules.value
    .filter(rule => shouldValidateByTrigger(rule, trigger))
    .map(({ trigger, ...rule }): RuleItem => rule)
}

const validate: FormItemContext['validate'] = async (trigger = '') => {
  const modelName = props.prop
  const triggeredRules = getTriggeredRules(trigger)

  if (!modelName || triggeredRules.length === 0) return true

  const validator = new AsyncValidator({
    [modelName]: triggeredRules,
  })

  validateStatus.loading = true
  validateStatus.state = 'validating'

  try {
    await validator.validate({ [modelName]: innerValue.value })
    validateStatus.state = 'success'
    validateStatus.errorMsg = ''
    return true
  } catch (e) {
    const error = e as FormValidateFailure
    validateStatus.state = 'error'
    validateStatus.errorMsg = error.errors?.[0]?.message || ''
    return Promise.reject(e)
  } finally {
    validateStatus.loading = false
  }
}

const clearValidate = () => {
  validateStatus.state = 'init'
  validateStatus.errorMsg = ''
  validateStatus.loading = false
}

const resetField = () => {
  const model = formContext?.model
  clearValidate()
  if (!model || !props.prop) return
  setValueByPath(model, props.prop, cloneDeep(initialValue))
}

const context: FormItemContext = {
  get $el() {
    return formItemRef.value
  },
  get prop() {
    return props.prop || ''
  },
  resetField,
  clearValidate,
  validate
}

provide(formItemContextKey, context)

onMounted(() => {
  if (props.prop) {
    formContext?.addField(context)
    initialValue = cloneDeep(innerValue.value)
  }
})

onUnmounted(() => {
  formContext?.removeField(context)
})

defineExpose({
  /** @description 验证状态 */
  validateStatus,
  /** @description 验证表单项 */
  validate,
  /** @description 清除验证状态 */
  clearValidate,
  /** @description 重置字段值 */
  resetField,
})
</script>
