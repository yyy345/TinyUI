import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from './Button.vue'
import ElIcon from '../Icon/Icon.vue'

describe('Button.vue', () => {
  test('basic button', async () => {
    const wrapper = mount(Button, {
      props: {
        type: 'primary'
      },
      slots: {
        default: 'button'
      }
    })

    const button = wrapper.get('button')
    expect(button.classes()).toContain('el-button--primary')
    expect(button.text()).toBe('button')

    await button.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })

  test('disable button', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      },
      slots: {
        default: 'disabled'
      }
    })

    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.find('button').element.disabled).toBeDefined()

    await button.trigger('click')
    expect(wrapper.emitted()).not.toHaveProperty('click')
  })

  test('icon', () => {
    const wrapper = mount(Button, {
      props: {
        icon: 'arrow-up'
      },
      slots: {
        default: 'icon'
      },
      global: {
        stubs: ['FontAwesomeIcon']
      }
    })

    const iconElement = wrapper.findComponent(FontAwesomeIcon)
    expect(iconElement.exists()).toBeTruthy()
    expect(iconElement.attributes('icon')).toBe('arrow-up')
  })

  test('loading', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      },
      slots: {
        default: 'loading'
      },
      global: {
        stubs: ['ElIcon']
      }
    })

    const iconElement = wrapper.findComponent(ElIcon)
    expect(iconElement.exists()).toBeTruthy()
    expect(iconElement.attributes('icon')).toBe('spinner')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })
})
