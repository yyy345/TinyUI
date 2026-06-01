import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { NaiveUIContainer } from '@vitepress-demo-preview/component'
import '@vitepress-demo-preview/component/dist/style.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import '../../../src/styles/index.css'
import './index.css'
import './components/ai-assistant.css'
import AiAssistant from './components/AiAssistant.vue'

library.add(fas)

export default {
  ...DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(AiAssistant)
    })
  },
  enhanceApp({ app }) {
    app.component('demo-preview', NaiveUIContainer)
  }
}
