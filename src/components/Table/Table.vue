<template>
  <div
    class="el-table"
    :class="{
      'el-table--border': border,
      'el-table--striped': stripe
    }"
  >
    <table class="el-table__inner">
      <thead class="el-table__header">
        <tr>
          <th
            v-for="(column, columnIndex) in columns"
            :key="getColumnKey(column, columnIndex)"
            scope="col"
            class="el-table__cell"
            :class="[
              `is-${column.headerAlign || column.align || 'left'}`,
              { 'is-sortable': isSortable(column) }
            ]"
            :style="getColumnStyle(column)"
            :aria-sort="getAriaSort(column)"
          >
            <template v-if="column.type === 'selection'">
              <input
                class="el-table__checkbox"
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                :disabled="data.length === 0"
                aria-label="选择所有行"
                @change="handleSelectAll"
              />
            </template>
            <button
              v-else-if="isSortable(column)"
              class="el-table__sort-button"
              type="button"
              :aria-label="`按 ${column.label || column.prop} 排序`"
              @click="handleSort(column)"
            >
              <span>{{ column.label }}</span>
              <span
                class="el-table__sort-caret"
                :class="getSortClass(column)"
                aria-hidden="true"
              ></span>
            </button>
            <template v-else>
              {{ column.label }}
            </template>
          </th>
        </tr>
      </thead>

      <tbody class="el-table__body">
        <tr
          v-for="(row, rowIndex) in sortedData"
          :key="getRowKey(row, rowIndex)"
          class="el-table__row"
          :class="{ 'is-selected': isRowSelected(row) }"
          @click="emit('row-click', row, rowIndex, $event)"
        >
          <td
            v-for="(column, columnIndex) in columns"
            :key="getColumnKey(column, columnIndex)"
            class="el-table__cell"
            :class="`is-${column.align || 'left'}`"
            :style="getColumnStyle(column)"
          >
            <template v-if="column.type === 'selection'">
              <input
                class="el-table__checkbox"
                type="checkbox"
                :checked="isRowSelected(row)"
                :aria-label="`选择第 ${rowIndex + 1} 行`"
                @click.stop
                @change="handleSelectRow(row, $event)"
              />
            </template>
            <slot
              v-else-if="column.slot"
              :name="column.slot"
              :row="row"
              :column="column"
              :value="getCellValue(row, column)"
              v-bind="{ $index: rowIndex }"
            >
              {{ displayCellValue(row, column) }}
            </slot>
            <template v-else>
              {{ displayCellValue(row, column) }}
            </template>
          </td>
        </tr>

        <tr v-if="sortedData.length === 0">
          <td class="el-table__empty" :colspan="emptyColspan">
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import type {
  TableCellScope,
  TableColumn,
  TableEmits,
  TableInstance,
  TableProps,
  TableRow,
  TableSortOrder
} from './types'

defineOptions({
  name: 'ElTable'
})

const props = withDefaults(defineProps<TableProps>(), {
  columns: () => [],
  data: () => [],
  emptyText: '暂无数据',
  stripe: false,
  border: false
})

const emit = defineEmits<TableEmits>()

defineSlots<Record<string, (scope: TableCellScope) => any>>()

const sortField = ref(props.defaultSort?.prop || '')
const sortOrder = ref<TableSortOrder>(props.defaultSort?.order || null)
const selectedRows = ref<TableRow[]>([])

const addUnit = (value?: string | number) => {
  if (value === undefined || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : value
}

const getColumnStyle = (column: TableColumn): CSSProperties => ({
  width: addUnit(column.width),
  minWidth: addUnit(column.minWidth)
})

const getColumnKey = (column: TableColumn, index: number) => {
  return `${column.type || 'default'}-${column.prop || column.slot || index}-${index}`
}

const getCellValue = (row: TableRow, column: TableColumn) => {
  return column.prop ? row[column.prop] : ''
}

const displayCellValue = (row: TableRow, column: TableColumn) => {
  const value = getCellValue(row, column)
  return value === null || value === undefined ? '' : value
}

const compareCellValues = (left: any, right: any) => {
  if (left === null || left === undefined) {
    return right === null || right === undefined ? 0 : 1
  }
  if (right === null || right === undefined) return -1
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime()
  }
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const sortedData = computed(() => {
  const rows = props.data.map((row, originalIndex) => ({ row, originalIndex }))
  if (!sortField.value || !sortOrder.value) {
    return rows.map(item => item.row)
  }

  return rows.sort((left, right) => {
    const leftValue = left.row[sortField.value]
    const rightValue = right.row[sortField.value]
    const comparison = compareCellValues(leftValue, rightValue)
    const includesEmptyValue = leftValue == null || rightValue == null
    const orderedComparison = includesEmptyValue || sortOrder.value === 'ascending'
      ? comparison
      : -comparison

    return orderedComparison || left.originalIndex - right.originalIndex
  }).map(item => item.row)
})

const isSortable = (column: TableColumn) => {
  return Boolean(column.sortable && column.prop && column.type !== 'selection')
}

const getAriaSort = (column: TableColumn) => {
  if (!isSortable(column) || sortField.value !== column.prop || !sortOrder.value) {
    return 'none'
  }
  return sortOrder.value
}

const getSortClass = (column: TableColumn) => {
  if (sortField.value !== column.prop || !sortOrder.value) return ''
  return `is-${sortOrder.value}`
}

const handleSort = (column: TableColumn) => {
  if (!isSortable(column) || !column.prop) return

  if (sortField.value !== column.prop || sortOrder.value === null) {
    sortField.value = column.prop
    sortOrder.value = 'ascending'
  } else if (sortOrder.value === 'ascending') {
    sortOrder.value = 'descending'
  } else {
    sortField.value = ''
    sortOrder.value = null
  }

  emit('sort-change', {
    prop: sortField.value,
    order: sortOrder.value
  })
}

const getRowKey = (row: TableRow, index: number) => {
  const key = typeof props.rowKey === 'function'
    ? props.rowKey(row)
    : props.rowKey
      ? row[props.rowKey]
      : index

  return typeof key === 'string' || typeof key === 'number' ? key : index
}

const isSameRow = (left: TableRow, right: TableRow) => {
  if (!props.rowKey) return left === right
  const leftKey = typeof props.rowKey === 'function' ? props.rowKey(left) : left[props.rowKey]
  const rightKey = typeof props.rowKey === 'function' ? props.rowKey(right) : right[props.rowKey]
  return leftKey === rightKey
}

const isRowSelected = (row: TableRow) => {
  return selectedRows.value.some(selectedRow => isSameRow(selectedRow, row))
}

const emitSelectionChange = () => {
  emit('selection-change', [...selectedRows.value])
}

const toggleRowSelection = (row: TableRow, selected?: boolean) => {
  const hasSelected = isRowSelected(row)
  const shouldSelect = selected === undefined ? !hasSelected : selected

  if (shouldSelect && !hasSelected) {
    selectedRows.value = [...selectedRows.value, row]
    emitSelectionChange()
  } else if (!shouldSelect && hasSelected) {
    selectedRows.value = selectedRows.value.filter(selectedRow => !isSameRow(selectedRow, row))
    emitSelectionChange()
  }
}

const clearSelection = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value = []
  emitSelectionChange()
}

const isAllSelected = computed(() => {
  return props.data.length > 0 && props.data.every(row => isRowSelected(row))
})

const isIndeterminate = computed(() => {
  const selectedCount = props.data.filter(row => isRowSelected(row)).length
  return selectedCount > 0 && selectedCount < props.data.length
})

const handleSelectRow = (row: TableRow, event: Event) => {
  toggleRowSelection(row, (event.target as HTMLInputElement).checked)
}

const handleSelectAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  selectedRows.value = checked ? [...sortedData.value] : []
  emitSelectionChange()
}

watch(() => props.data, (data) => {
  const nextSelectedRows = selectedRows.value.reduce<TableRow[]>((rows, selectedRow) => {
    const currentRow = data.find(row => isSameRow(row, selectedRow))
    return currentRow ? [...rows, currentRow] : rows
  }, [])
  const changed = nextSelectedRows.length !== selectedRows.value.length ||
    nextSelectedRows.some((row, index) => row !== selectedRows.value[index])

  if (changed) {
    selectedRows.value = nextSelectedRows
    emitSelectionChange()
  }
})

const emptyColspan = computed(() => Math.max(props.columns.length, 1))

defineExpose<TableInstance>({
  clearSelection,
  toggleRowSelection
})
</script>
