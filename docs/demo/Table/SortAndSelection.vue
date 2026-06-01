<template>
  <div class="table-demo">
    <el-table
      :columns="columns"
      :data="tableData"
      row-key="id"
      stripe
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    />

    <div class="table-demo__state">
      <span>{{ sortDescription }}</span>
      <span>已选择：{{ selectedNames || '无' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ElTable from '@/components/Table/Table.vue'
import type { TableColumn, TableRow, TableSortState } from '@/components/Table/types'

const columns: TableColumn[] = [
  { type: 'selection', width: 48, align: 'center' },
  { prop: 'name', label: '成员', width: 120 },
  { prop: 'completed', label: '完成任务数', sortable: true, align: 'right' },
  { prop: 'score', label: '代码评分', sortable: true, align: 'right' }
]

const tableData = [
  { id: 1, name: '陈知行', completed: 8, score: 91 },
  { id: 2, name: '林溪', completed: 12, score: 95 },
  { id: 3, name: '江遥', completed: 6, score: 86 },
  { id: 4, name: '沈初', completed: 10, score: 89 }
]

const sortDescription = ref('当前未排序')
const selectedNames = ref('')

const handleSortChange = ({ prop, order }: TableSortState) => {
  const label = columns.find(column => column.prop === prop)?.label
  if (!order) {
    sortDescription.value = '当前未排序'
    return
  }
  sortDescription.value = `${label}：${order === 'ascending' ? '升序' : '降序'}`
}

const handleSelectionChange = (rows: TableRow[]) => {
  selectedNames.value = rows.map(row => row.name).join('、')
}
</script>

<style scoped>
.table-demo {
  display: grid;
  gap: 14px;
}

.table-demo__state {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  background: var(--el-fill-color-extra-light);
}
</style>
