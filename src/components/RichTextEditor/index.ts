import type { App } from 'vue'
import RichTextEditor from './RichTextEditor.vue'

RichTextEditor.install = (app: App) => {
  app.component(RichTextEditor.name, RichTextEditor)
}

export default RichTextEditor
export * from './types'
