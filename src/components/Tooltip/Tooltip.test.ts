import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Tooltip 依赖 Popper.js 计算浮层位置。
// 单元测试只关心“有没有调用定位能力”，不测试 Popper.js 自己的坐标算法，所以这里 mock 掉。
const mocks = vi.hoisted(() => ({
  createPopper: vi.fn(() => ({
    destroy: vi.fn()
  }))
}))

vi.mock('@popperjs/core', () => ({
  createPopper: mocks.createPopper
}))

import Tooltip from './Tooltip.vue'
import type { TooltipInstance } from './types'

const flushTooltip = async () => {
  // Tooltip 内部使用 debounce 控制打开/关闭，需要先推进定时器。
  vi.runAllTimers()
  // isOpen 变更后，v-if 会渲染浮层；watch(..., { flush: 'post' }) 会在 DOM 更新后创建 Popper。
  await nextTick()
  await nextTick()
}

describe('Tooltip.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mocks.createPopper.mockClear()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  test('click 触发时显示内容并创建 Popper 实例', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'tooltip-body',
        trigger: 'click'
      },
      slots: {
        default: '<button>trigger</button>'
      }
    })

    // 点击触发区后，Tooltip 应该打开。
    await wrapper.get('.el-tooltip__trigger').trigger('click')
    await flushTooltip()

    expect(wrapper.find('.el-tooltip__popper').exists()).toBe(true)
    expect(wrapper.text()).toContain('tooltip-body')
    expect(wrapper.emitted('visible-change')?.[0]).toEqual([true])
    expect(mocks.createPopper).toHaveBeenCalledTimes(1)
  })

  test('hover 触发时支持显示和关闭', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'hover-content'
      },
      slots: {
        default: '<span>hover trigger</span>'
      }
    })

    // 默认 trigger 是 hover，鼠标进入触发区后打开。
    await wrapper.get('.el-tooltip__trigger').trigger('mouseenter')
    await flushTooltip()

    expect(wrapper.find('.el-tooltip__popper').exists()).toBe(true)
    expect(wrapper.text()).toContain('hover-content')
    expect(wrapper.emitted('visible-change')?.[0]).toEqual([true])

    // 鼠标离开外层容器后关闭；组件里 hover 默认有 50ms closeDelay。
    await wrapper.get('.el-tooltip').trigger('mouseleave')
    await flushTooltip()

    expect(wrapper.find('.el-tooltip__popper').exists()).toBe(false)
    expect(wrapper.emitted('visible-change')?.[1]).toEqual([false])
  })

  test('content 插槽优先于 content prop 渲染', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'prop-content',
        trigger: 'click'
      },
      slots: {
        default: '<button>trigger</button>',
        content: '<strong>slot-content</strong>'
      }
    })

    // 同时传 content prop 和 content slot 时，浮层应该渲染插槽内容。
    await wrapper.get('.el-tooltip__trigger').trigger('click')
    await flushTooltip()

    expect(wrapper.text()).toContain('slot-content')
    expect(wrapper.text()).not.toContain('prop-content')
  })

  test('manual 模式下不自动绑定 click 事件，但可以通过 expose 手动打开和关闭', async () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'manual-content',
        trigger: 'click',
        manual: true
      },
      slots: {
        default: '<button>trigger</button>'
      }
    })

    // manual=true 时，点击触发区不会自动打开 Tooltip。
    await wrapper.get('.el-tooltip__trigger').trigger('click')
    await flushTooltip()
    expect(wrapper.find('.el-tooltip__popper').exists()).toBe(false)

    // 但组件通过 defineExpose 暴露了 show/hide，可以给 Select、Dropdown 等复合组件手动控制。
    const tooltipVm = wrapper.vm as unknown as TooltipInstance
    tooltipVm.show()
    await flushTooltip()
    expect(wrapper.find('.el-tooltip__popper').exists()).toBe(true)

    tooltipVm.hide()
    await flushTooltip()
    expect(wrapper.find('.el-tooltip__popper').exists()).toBe(false)
  })

  test('click 模式下点击外部会关闭并触发 click-outside 事件', async () => {
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        content: 'outside-content',
        trigger: 'click'
      },
      slots: {
        default: '<button>trigger</button>'
      }
    })

    await wrapper.get('.el-tooltip__trigger').trigger('click')
    await flushTooltip()
    expect(wrapper.find('.el-tooltip__popper').exists()).toBe(true)

    // useClickOutside 监听 document click，点击组件外部后应关闭浮层。
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushTooltip()

    expect(wrapper.find('.el-tooltip__popper').exists()).toBe(false)
    expect(wrapper.emitted('click-outside')?.[0]).toEqual([true])
    wrapper.unmount()
  })
})
