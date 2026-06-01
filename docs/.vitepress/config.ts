import { defineConfig } from 'vitepress'
import { containerPreview, componentPreview } from '@vitepress-demo-preview/plugin'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  title: 'TinyElement',
  description: 'A VitePress Site',
  vite: {
    server: {
      proxy: {
        '/api/rag': {
          target: 'http://127.0.0.1:3030',
          changeOrigin: true
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url))
      }
    }
  },
  themeConfig: {
    nav: [
      { text: '\u6307\u5357', link: '/' },
      { text: '\u7ec4\u4ef6', link: '/components/button' }
    ],
    sidebar: [
      {
        text: '\u57fa\u7840',
        items: [
          { text: '\u6309\u94ae Button', link: '/components/button' },
          { text: '\u5e03\u5c40\u5bb9\u5668 Container', link: '/components/container' },
          { text: '\u56fe\u6807 Icon', link: '/components/icon' },
          { text: '\u94fe\u63a5 Link', link: '/components/link' },
          { text: '\u6298\u53e0\u9762\u677f Collapse', link: '/components/collapse' }
        ]
      },
      {
        text: '\u53cd\u9988',
        items: [
          { text: '\u8b66\u544a Alert', link: '/components/alert' },
          { text: '\u6d88\u606f\u63d0\u793a Message', link: '/components/message' },
          { text: '\u6d88\u606f\u5f39\u6846 MessageBox', link: '/components/messagebox' },
          { text: '\u5bf9\u8bdd\u6846 Dialog', link: '/components/dialog' },
          { text: '\u6587\u5b57\u63d0\u793a Tooltip', link: '/components/tooltip' },
          { text: '\u4e0b\u62c9\u83dc\u5355 Dropdown', link: '/components/dropdown' }
        ]
      },
      {
        text: '\u6570\u636e\u8f93\u5165',
        items: [
          { text: '\u5f00\u5173 Switch', link: '/components/switch' },
          { text: '\u8bc4\u5206 Rate', link: '/components/rate' },
          { text: '\u8f93\u5165\u6846 Input', link: '/components/input' },
          { text: '\u9009\u62e9\u5668 Select', link: '/components/select' },
          { text: '\u8868\u5355 Form', link: '/components/form' },
          { text: '\u5bcc\u6587\u672c\u7f16\u8f91\u5668 RichTextEditor', link: '/components/rich-text-editor' },
          { text: '\u65e5\u671f\u9009\u62e9\u5668 DatePicker', link: '/components/datepicker' }
        ]
      },
      {
        text: '\u6570\u636e\u5c55\u793a',
        items: [
          { text: '\u8868\u683c Table', link: '/components/table' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  markdown: {
    config(md) {
      md.use(containerPreview)
      md.use(componentPreview)
    }
  },
  base: '/element-ui/'
})
