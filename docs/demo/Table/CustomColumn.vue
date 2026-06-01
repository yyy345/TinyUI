<template>
  <div class="table-demo">
    <el-table :columns="columns" :data="tableData" row-key="id" border>
      <template #status="{ row }">
        <span
          class="status-tag"
          :class="`is-${row.status}`"
        >
          {{ statusMap[row.status] }}
        </span>
      </template>

      <template #actions="{ row }">
        <button class="action-button" type="button" @click="viewDetail(row)">
          查看
        </button>
      </template>
    </el-table>

    <p class="table-demo__message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ElTable from '@/components/Table/Table.vue'
import type { TableColumn, TableRow } from '@/components/Table/types'

const columns: TableColumn[] = [
  { prop: 'task', label: '任务名称', minWidth: 200 },
  { prop: 'owner', label: '负责人', width: 100 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { label: '操作', width: 88, align: 'center', slot: 'actions' }
]

const tableData = [
  { id: 1, task: '完成 Table 数据映射', owner: '小许', status: 'done' },
  { id: 2, task: '补充作用域插槽示例', owner: '小周', status: 'doing' },
  { id: 3, task: '规划虚拟滚动', owner: '小林', status: 'todo' }
]

const statusMap: Record<string, string> = {
  done: '已完成',
  doing: '进行中',
  todo: '待处理'
}

const message = ref('点击操作列可访问当前行数据。')

const viewDetail = (row: TableRow) => {
  message.value = `当前查看：${row.task}，负责人 ${row.owner}`
}
</script>

<style scoped>
.table-demo {
  display: grid;
  gap: 12px;
}

.status-tag {
  display: inline-flex;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
}

.status-tag.is-done {
  color: #067647;
  background: #dcfae6;
}

.status-tag.is-doing {
  color: #175cd3;
  background: #eff8ff;
}

.status-tag.is-todo {
  color: #475467;
  background: #f2f4f7;
}

.action-button {
  border: 0;
  color: var(--el-color-primary);
  background: transparent;
  cursor: pointer;
}

.table-demo__message {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
