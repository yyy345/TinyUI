import type { AiPageContext } from './types'

const specialNames: Record<string, string> = {
  messagebox: 'MessageBox',
  datepicker: 'DatePicker',
  'rich-text-editor': 'RichTextEditor'
}

export const componentFromPath = (page: string) => {
  const match = page.match(/\/components\/([^/]+)/)
  if (!match) return undefined
  const slug = match[1]
  return specialNames[slug] ?? slug.split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

export const getPageContext = (page: string): AiPageContext => {
  const content = typeof document === 'undefined'
    ? ''
    : document.querySelector<HTMLElement>('.vp-doc')?.innerText.trim() ?? ''
  return {
    page,
    component: componentFromPath(page),
    pageContent: content.slice(0, 6000) || undefined
  }
}

const commonQuestions = ['这个组件有哪些 Props？', '有哪些事件和插槽？', '帮我生成一个基础示例']
const questionMap: Record<string, string[]> = {
  Table: ['如何实现分页？', '如何自定义列？', '如何实现排序和多选？'],
  Form: ['如何进行表单校验？', '如何重置表单？', '如何自定义标签？'],
  Dialog: ['如何关闭 Dialog？', '如何实现可拖拽弹窗？', '帮我生成一个 Dialog 示例'],
  Button: ['Button 有哪些类型？', '如何使用加载状态？', '如何组合多个按钮？']
}

export const getRecommendedQuestions = (component?: string) => questionMap[component ?? ''] ?? commonQuestions
