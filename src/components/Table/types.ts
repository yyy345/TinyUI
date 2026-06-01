export type TableRow = Record<string, any>

export type TableSortOrder = 'ascending' | 'descending' | null

export type TableColumnType = 'default' | 'selection'

export type TableAlign = 'left' | 'center' | 'right'

export interface TableColumn {
  type?: TableColumnType
  prop?: string
  label?: string
  width?: string | number
  minWidth?: string | number
  align?: TableAlign
  headerAlign?: TableAlign
  sortable?: boolean
  slot?: string
}

export interface TableSortState {
  prop: string
  order: TableSortOrder
}

export interface TableProps {
  columns?: TableColumn[]
  data?: TableRow[]
  rowKey?: string | ((row: TableRow) => string | number)
  stripe?: boolean
  border?: boolean
  emptyText?: string
  defaultSort?: TableSortState
}

export interface TableCellScope {
  row: TableRow
  column: TableColumn
  $index: number
  value: any
}

export interface TableEmits {
  (e: 'sort-change', state: TableSortState): void
  (e: 'selection-change', rows: TableRow[]): void
  (e: 'row-click', row: TableRow, index: number, event: MouseEvent): void
}

export interface TableInstance {
  clearSelection: () => void
  toggleRowSelection: (row: TableRow, selected?: boolean) => void
}
