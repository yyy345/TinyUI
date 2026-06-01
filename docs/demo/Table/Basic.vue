<template>
  <el-table
    :columns="columns"
    :data="tableData"
    row-key="id"
    stripe
    border
  />
</template>

<script setup lang="ts">
import ElTable from '@/components/Table/Table.vue'
import type { TableColumn } from '@/components/Table/types'

const columns: TableColumn[] = [
  { prop: 'date', label: '日期', width: 140 },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'address', label: '地址' }
]

const tableData = [
  { id: 1, date: '2026-05-20', name: '王小虎', address: '上海市普陀区金沙江路' },
  { id: 2, date: '2026-05-21', name: '周予安', address: '杭州市西湖区文三路' },
  { id: 3, date: '2026-05-22', name: '林一', address: '深圳市南山区科技园' }
]
</script>
