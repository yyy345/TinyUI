import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Table from './Table.vue'
import type { TableColumn, TableRow } from './types'

const columns: TableColumn[] = [
  { prop: 'name', label: '姓名' },
  { prop: 'department', label: '部门' }
]

const data: TableRow[] = [
  { id: 1, name: '张三', department: '前端' },
  { id: 2, name: '李四', department: '设计' }
]

describe('Table.vue', () => {
  test('renders headers and cells from columns and data', async () => {
    const wrapper = mount(Table, {
      props: {
        columns,
        data
      }
    })

    expect(wrapper.findAll('thead th').map(cell => cell.text())).toEqual(['姓名', '部门'])
    expect(wrapper.findAll('tbody tr')[0].text()).toContain('张三')
    expect(wrapper.findAll('tbody tr')[1].text()).toContain('设计')

    await wrapper.setProps({ data: [] })
    expect(wrapper.get('.el-table__empty').text()).toBe('暂无数据')
  })

  test('provides row context to a named cell slot', () => {
    const wrapper = mount(Table, {
      props: {
        columns: [
          { prop: 'name', label: '姓名' },
          { prop: 'status', label: '状态', slot: 'status' }
        ],
        data: [{ id: 1, name: '张三', status: '在线' }]
      },
      slots: {
        status: ({ row }: { row: TableRow }) => h(
          'span',
          { class: 'status-tag' },
          `状态: ${row.status}`
        )
      }
    })

    expect(wrapper.get('.status-tag').text()).toBe('状态: 在线')
  })

  test('sorts a data copy and emits sort state changes', async () => {
    const source = [
      { id: 1, score: 92 },
      { id: 2, score: 76 },
      { id: 3, score: 88 }
    ]
    const wrapper = mount(Table, {
      props: {
        columns: [{ prop: 'score', label: '分数', sortable: true }],
        data: source
      }
    })
    const renderedScores = () => wrapper.findAll('.el-table__body .el-table__row')
      .map(row => row.text())

    await wrapper.get('.el-table__sort-button').trigger('click')
    expect(renderedScores()).toEqual(['76', '88', '92'])
    expect(wrapper.emitted('sort-change')?.[0]).toEqual([
      { prop: 'score', order: 'ascending' }
    ])

    await wrapper.get('.el-table__sort-button').trigger('click')
    expect(renderedScores()).toEqual(['92', '88', '76'])

    await wrapper.get('.el-table__sort-button').trigger('click')
    expect(renderedScores()).toEqual(['92', '76', '88'])
    expect(source.map(row => row.score)).toEqual([92, 76, 88])
  })

  test('emits selected rows for single and all-row selection', async () => {
    const wrapper = mount(Table, {
      props: {
        rowKey: 'id',
        columns: [
          { type: 'selection', width: 48 },
          { prop: 'name', label: '姓名' }
        ],
        data
      }
    })
    const rowCheckboxes = wrapper.findAll('.el-table__body .el-table__checkbox')

    await rowCheckboxes[0].setValue(true)
    expect(wrapper.emitted('selection-change')?.[0]).toEqual([[data[0]]])
    expect(wrapper.findAll('.el-table__row')[0].classes()).toContain('is-selected')

    await wrapper.get('.el-table__header .el-table__checkbox').setValue(true)
    expect(wrapper.emitted('selection-change')?.[1]).toEqual([[data[0], data[1]]])
  })
})
