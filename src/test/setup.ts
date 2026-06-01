import { afterEach, vi } from 'vitest'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
library.add(fas)

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})
