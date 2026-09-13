import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendAIMessage } from './ai-service'
import { useAiChat } from './useAiChat'

vi.mock('./ai-service', () => ({
  sendAIMessage: vi.fn()
}))

describe('useAiChat', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the first streamed delta before the request finishes', async () => {
    let emitDelta: (() => void) | undefined
    let finishRequest: (() => void) | undefined

    vi.mocked(sendAIMessage).mockImplementation(async (_messages, _context, _signal, callbacks) => {
      await new Promise<void>((resolve) => {
        emitDelta = () => {
          callbacks.onDelta('流式回答')
          resolve()
        }
      })
      await new Promise<void>((resolve) => {
        finishRequest = resolve
      })
    })

    let chat: ReturnType<typeof useAiChat>
    const wrapper = mount(defineComponent({
      setup() {
        chat = useAiChat()
        return () => h('div', chat.messages.value.map((message) => h(
          'span',
          {
            class: message.loading ? 'thinking' : 'content',
            'data-role': message.role
          },
          message.loading ? '正在思考' : message.content
        )))
      }
    }))

    const sending = chat!.sendMessage('Button 如何使用？', { page: '/components/button' })
    await nextTick()
    expect(wrapper.find('.thinking').text()).toBe('正在思考')

    emitDelta!()
    await Promise.resolve()
    await nextTick()
    expect(wrapper.find('[data-role="assistant"].content').text()).toBe('流式回答')

    finishRequest!()
    await sending
    wrapper.unmount()
  })
})
