import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RichTextEditor from './RichTextEditor.vue'

describe('RichTextEditor.vue', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn(() => true),
      configurable: true
    })
    Object.defineProperty(document, 'queryCommandState', {
      value: vi.fn(() => false),
      configurable: true
    })
  })

  test('renders modelValue and emits updates on input', async () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '<p>Hello</p>'
      },
      global: {
        stubs: ['FontAwesomeIcon']
      }
    })

    const editor = wrapper.get('.el-rich-text-editor__content')
    expect(editor.element.innerHTML).toBe('<p>Hello</p>')

    editor.element.innerHTML = '<p>Updated</p>'
    await editor.trigger('input')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['<p>Updated</p>'])
    expect(wrapper.emitted('input')?.[0]).toEqual(['<p>Updated</p>'])
  })

  test('runs toolbar command', async () => {
    const wrapper = mount(RichTextEditor, {
      global: {
        stubs: ['FontAwesomeIcon']
      }
    })

    await wrapper.get('button[aria-label="加粗"]').trigger('click')

    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined)
  })

  test('supports disabled state', () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        disabled: true
      },
      global: {
        stubs: ['FontAwesomeIcon']
      }
    })

    expect(wrapper.classes()).toContain('is-disabled')
    expect(wrapper.get('.el-rich-text-editor__content').attributes('contenteditable')).toBe('false')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  test('exposes clear method', async () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '<p>Hello</p>'
      },
      global: {
        stubs: ['FontAwesomeIcon']
      }
    })

    ;(wrapper.vm as any).clear()

    expect(wrapper.get('.el-rich-text-editor__content').element.innerHTML).toBe('')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    expect(wrapper.emitted('change')?.[0]).toEqual([''])
  })
})
