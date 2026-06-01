import type { App, Plugin } from 'vue'
import Table from './Table.vue'

type SFCWithInstall<T> = T & Plugin

const ElTable = Table as SFCWithInstall<typeof Table>

ElTable.install = (app: App) => {
  app.component(ElTable.name, ElTable)
}

export default ElTable
export * from './types'
