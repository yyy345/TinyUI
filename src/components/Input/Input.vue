/**
 * Input组件，用于输入文本的组件
 * 支持 v-model
 * 支持 label
 * 支持前后插槽
 * 支持清空按钮
 * 支持密码显隐切换
 * 支持尺寸、禁用、只读等状态
 * 支持和表单组件联动做校验
 * 对外暴露原生 input 实例
 */
<script setup lang="ts">
  import type { InputProps, InputEmits } from './types'
  // inject 从祖先组件里注入依赖，获取表单组件提供的上下文对象
  import { ref, computed, useSlots, watch, inject } from 'vue';
  import type { Ref } from 'vue'
  import { formItemContextKey } from '../Form/types'
  import ElIcon from '../Icon/Icon.vue'

  // 输入框是否聚焦状态
  const isFocus = ref(false)
  // 拿到当前组件接收到的插槽对象
  const slots = useSlots()

  // 定义组件名称
  defineOptions({
    name: 'ElInput'
  })
  // 定义Props,并设置默认值
  // withDefaults 给 defineProps() 定义的 props 设置默认值。
  const props = withDefaults(defineProps<InputProps>(), {
    type: 'input',
    size: 'default',
    modelValue: '',
    placeholder: 'Please input'
  })

  // 定义emits
  const emits = defineEmits<InputEmits>()

  // 1. 计算属性：根据props设置input组件类名
  const computedClass = computed(() => {
    return {
      [`el-input--${props.type}`]: props.type,
      'is-disabled': props.disabled,
      'is-focus': isFocus.value,
      [`el-input--${props.size}`]: props.size
    }
  })


  // 2. 在input上绑定 modelValue
  // 传入的props是不可以修改的，所以需要内部维护一个响应式数据
  // 让原生input v-model与inputValue进行绑定
  const inputValue = ref(props.modelValue)
  // 并且监听props.modelValue的value变化
  watch(() => props.modelValue, (newValue: string) => {
    inputValue.value = newValue
  })


  // 3. 处理输入事件，触发父组件的更新
  const handleInput = (event: Event) => {
    // 拿到原生 input对象
    const target = event.target as HTMLInputElement
    // 获取最新输入值，并且更新本地的inputValue
    inputValue.value = target.value
    // 通知父组件更新 v-model 的值，触发父组件的 input 事件
    emits('update:modelValue', target.value)

    // 触发父组件的 input 事件，传入最新输入值
    emits('input', target.value)

    // 触发表单验证
    runValidation('input')
  }

  // 4. 处理change事件：改了值之后输入框失去焦点时触发
  const handleChange = () => {
    emits('change', inputValue.value)
    runValidation('change')
  }

  // 5. 处理focus和blur事件，改变输入框聚焦状态，并触发父组件事件
  const handleFocus = (event: FocusEvent) => {
    isFocus.value = true
    emits('focus', event)
  }
  const handleBlur = (event: FocusEvent) => {
    isFocus.value = false
    emits('blur', event)
    runValidation('blur')
  }


  // 6. 实现清空内容逻辑
  // 是否显示 clear 图标 判断输入框是否输入
  const clearable = computed(() => {
    return inputValue.value.length > 0
  })
  // 清空输入内容
  const clearInput = () => {
    inputValue.value = ''
    emits('update:modelValue', '')
    emits('input', '')
    emits('change', '')
    emits('clear')
    runValidation('change')
  }

  // 7. 后缀图标是否显示
  const showSuffixIcon = computed(() => {
    // 有传入后缀插槽，没有显示清除按钮，没有显示隐藏密码
    return slots.suffix && !props.showClear && !props.showPassword
  })

  // 8. 是否展示eye 图标
  const inputType = ref(props.type)
  watch(() => props.type, (newType) => {
    inputType.value = newType
  })
  const isEyeShow = computed(() => {
    return props.showPassword && !props.showClear && clearable.value
  })
  // 图标显示: 最初表现为隐藏密码，点击eye图标后显示密码
  const eyeIcon = ref('eye')

  // 9. 点击事件切换眼睛类型
  const changeInputType = () => {
    if (inputType.value === 'password') {
      // 本来就是隐藏状态，就显示密码
      eyeIcon.value = 'eye-slash';
      inputType.value = 'text'
      return
    }
    // 改变输入类型为 password, 隐藏输入
    inputType.value = 'password'
    eyeIcon.value = 'eye'
  }

  // 暴露input实例, 类型为HTMLInputElement
  const inputInstance = ref() as Ref<HTMLInputElement>

  // 10. 实现和表单组件联动做校验
  // 收到组件传入的数据
  const formItemContext = inject(formItemContextKey)
  // 表单验证
  const runValidation = (trigger: string) => {
    if (props.validateEvent) {
      // 调用表单组件提供的validate方法，传入触发验证的事件类型（input、change、blur等）
      formItemContext?.validate?.(trigger).catch(
        (err: unknown) => console.error(err)
      )
    }
  }

  // 暴露input实例
  defineExpose({
    inputInstance
  })
</script>





<template lang="">
  <!-- 增加一个外壳 - 实现前后插槽、清空按钮、密码显隐按钮 -->
  <!-- computedClass 动态绑定类名 -->
  <div class="el-input" :class="computedClass">
    <!-- label 显示额外信息 -->
    <label v-if="label" class="el-input-label">
      {{ label }}
    </label>
    <!-- Prepend slot 前缀 $slots.prepend 父组件有没有传prepend插槽内容 -->
    <div v-if="$slots.prepend" class="el-input-prepend">
      <slot name="prepend"/>
    </div>

    <!-- 重点：渲染Input -->
    <div class="el-input-container">
      <!-- Prefix Slot 前缀图标 具名插槽 实现插入图标 -->
      <span v-if="$slots.prefix" class="el-input-prefix">
        <slot name="prefix"/>
      </span>

      <!-- 原生input -->
      <!-- 
        ref属性：用于获取input元素的引用，方便在组件外部访问原生input实例
        v-model：实现双向绑定，inputValue是组件内部维护的输入值
        属性透传：:type：根据props.type动态设置输入类型，支持普通文本和密码输入
      -->
      <input
        ref="inputInstance"
        v-model="inputValue"
        class="el-input-content"
        :type="inputType"
        :disabled="disabled"
        :placeholder="placeholder"
        :readonly="readonly"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :form="form"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />


      <!-- clear 清除全部内容 clearable 表明当前文本框确实有内容才显示清空按钮 -->
      <span 
        v-show="showClear && clearable" 
        @click="clearInput"
        class="el-input-clear"
      >
        <!-- 传入Icon图标 -->
        <el-icon icon="circle-xmark"></el-icon>
      </span>
      <!-- eye 图标 显示密码 -->
      <span 
        v-show="isEyeShow" 
        @click="changeInputType"
        class="el-input-eye"
      >
        <el-icon :icon="eyeIcon"></el-icon>
      </span>
      <!-- Suffix Slot 后缀图标 具名插槽 -->
      <span v-if="showSuffixIcon" class="el-input-suffix">
        <slot name="suffix"/>
      </span>
    </div>

    <!-- Prepend slot 后缀slot -->
    <div v-if="$slots.append" class="el-input-append">
      <slot name="append"/>
    </div>
  </div>
</template>
