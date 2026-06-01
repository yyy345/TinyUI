import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, reactive, ref } from 'vue'
import Form from './Form.vue'
import FormItem from './FormItem.vue'
import ElInput from '../Input/Input.vue'

const createFormWrapper = () => {
  return mount(defineComponent({
    components: {
      ElForm: Form,
      ElFormItem: FormItem,
      ElInput
    },
    setup() {
      const formRef = ref()
      const model = reactive({
        email: '',
        password: '123456',
        profile: {
          title: 'frontend'
        }
      })
      const rules = {
        email: [
          { required: true, message: 'Email required', trigger: 'blur' }
        ],
        password: [
          { min: 6, max: 12, message: 'Password length invalid', trigger: 'blur' }
        ],
        'profile.title': [
          { required: true, message: 'Title required', trigger: 'blur' }
        ]
      }

      return {
        formRef,
        model,
        rules
      }
    },
    template: `
      <el-form ref="formRef" :model="model" :rules="rules">
        <el-form-item label="Email" prop="email">
          <el-input v-model="model.email" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="model.password" />
        </el-form-item>
        <el-form-item label="Title" prop="profile.title">
          <el-input v-model="model.profile.title" />
        </el-form-item>
      </el-form>
    `
  }))
}

describe('Form.vue', () => {
  test('validates form fields and renders error message', async () => {
    const wrapper = createFormWrapper()
    const vm = wrapper.vm as any

    await expect(vm.formRef.validate()).rejects.toMatchObject({
      email: expect.any(Array)
    })
    await nextTick()

    expect(wrapper.find('.el-form-item.is-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Email required')
  })

  test('validates a specific field', async () => {
    const wrapper = createFormWrapper()
    const vm = wrapper.vm as any

    vm.model.password = '123'
    await expect(vm.formRef.validateField('password')).rejects.toMatchObject({
      password: expect.any(Array)
    })
    await nextTick()

    expect(wrapper.text()).toContain('Password length invalid')
  })

  test('resets falsy and nested initial values', async () => {
    const wrapper = createFormWrapper()
    const vm = wrapper.vm as any

    vm.model.email = 'demo@example.com'
    vm.model.profile.title = ''
    await nextTick()

    vm.formRef.resetFields(['email', 'profile.title'])

    expect(vm.model.email).toBe('')
    expect(vm.model.profile.title).toBe('frontend')
  })
})
