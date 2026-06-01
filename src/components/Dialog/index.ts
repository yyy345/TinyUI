import type { App, Plugin } from 'vue'
import Dialog from './Dialog.vue'

type SFCWithInstall<T> = T & Plugin

const ElDialog = Dialog as SFCWithInstall<typeof Dialog>

ElDialog.install = (app: App) => {
  app.component(ElDialog.name, ElDialog)
}

export default ElDialog
export * from './types'
