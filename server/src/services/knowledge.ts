import path from 'node:path'
import { config } from '../config.js'
import type { KnowledgeChunk } from '../types.js'
import { readUtf8, toPosixPath, walkFiles } from '../utils/fs.js'
import {
  extractKeywords,
  normalizeWhitespace,
  snippet,
  stripCodeFence,
  stripFrontmatter,
  stripHtmlTags
} from '../utils/text.js'

const componentNameMap = new Map<string, string>([
  ['messagebox', 'MessageBox'],
  ['datepicker', 'DatePicker']
])

const guessComponentName = (name: string) => {
  const plain = name.replace(/\.md$/i, '').replace(/\.vue$/i, '')
  const compact = plain.replace(/[^a-zA-Z0-9]/g, '')
  const lower = compact.toLowerCase()
  if (componentNameMap.has(lower)) {
    return componentNameMap.get(lower) as string
  }
  return compact.charAt(0).toUpperCase() + compact.slice(1)
}

const componentRoute = (componentName: string) => `/components/${componentName.toLowerCase()}`

const makeId = (parts: string[]) => parts.join(':').replace(/[^\w:/-]+/g, '-').toLowerCase()

const buildDocChunks = async () => {
  const docFiles = await walkFiles(
    path.join(config.docsDir, 'components'),
    (filePath) => filePath.endsWith('.md')
  )

  const chunks: KnowledgeChunk[] = []

  for (const filePath of docFiles) {
    const raw = await readUtf8(filePath)
    const componentName = guessComponentName(path.basename(filePath))
    const route = componentRoute(componentName)
    const content = normalizeWhitespace(stripHtmlTags(stripCodeFence(stripFrontmatter(raw))))
    const sections = content.split(/\n(?=##\s+)/g)

    sections.forEach((sectionText, index) => {
      const lines = sectionText.split('\n').map((line) => line.trim()).filter(Boolean)
      if (lines.length === 0) {
        return
      }

      const heading = lines[0].replace(/^#+\s*/, '')
      const title = index === 0 ? `${componentName} 文档概览` : heading
      const body = index === 0 ? lines.join('\n') : lines.slice(1).join('\n')
      const text = normalizeWhitespace(`${componentName}\n${title}\n${body}`)

      if (!text) {
        return
      }

      chunks.push({
        id: makeId(['doc', componentName, String(index)]),
        text,
        component: componentName,
        title,
        section: title,
        sourceType: 'doc',
        filePath: toPosixPath(path.relative(config.rootDir, filePath)),
        route,
        keywords: extractKeywords(`${componentName} ${title} ${text}`)
      })
    })
  }

  return chunks
}

const buildDemoChunks = async () => {
  const demoFiles = await walkFiles(
    path.join(config.docsDir, 'demo'),
    (filePath) => filePath.endsWith('.vue')
  )

  const chunks: KnowledgeChunk[] = []

  for (const filePath of demoFiles) {
    const relative = path.relative(path.join(config.docsDir, 'demo'), filePath)
    const [componentFolder, fileName] = toPosixPath(relative).split('/')
    const componentName = guessComponentName(componentFolder)
    const exampleName = fileName.replace(/\.vue$/i, '')
    const code = normalizeWhitespace(await readUtf8(filePath))
    const text = normalizeWhitespace(
      [
        `${componentName} 示例 ${exampleName}`,
        `这个片段来自 ${componentName} 组件的示例代码。`,
        snippet(code, 1500)
      ].join('\n')
    )

    chunks.push({
      id: makeId(['demo', componentName, exampleName]),
      text,
      component: componentName,
      title: `${componentName} ${exampleName} 示例`,
      section: exampleName,
      sourceType: 'demo',
      filePath: toPosixPath(path.relative(config.rootDir, filePath)),
      route: componentRoute(componentName),
      keywords: extractKeywords(`${componentName} ${exampleName} ${text}`)
    })
  }

  return chunks
}

const buildTypeChunks = async () => {
  const typeFiles = await walkFiles(
    config.componentsDir,
    (filePath) => filePath.endsWith(`${path.sep}types.ts`) || filePath.endsWith('/types.ts')
  )

  const chunks: KnowledgeChunk[] = []

  for (const filePath of typeFiles) {
    const componentName = guessComponentName(path.basename(path.dirname(filePath)))
    const raw = normalizeWhitespace(await readUtf8(filePath))
    const text = normalizeWhitespace(
      [
        `${componentName} 类型定义`,
        '以下内容来自组件的 props / emits / 类型声明。',
        snippet(raw, 1800)
      ].join('\n')
    )

    chunks.push({
      id: makeId(['types', componentName]),
      text,
      component: componentName,
      title: `${componentName} 类型定义`,
      section: 'types',
      sourceType: 'types',
      filePath: toPosixPath(path.relative(config.rootDir, filePath)),
      route: componentRoute(componentName),
      keywords: extractKeywords(`${componentName} types props emits ${text}`)
    })
  }

  return chunks
}

export const buildKnowledgeChunks = async () => {
  const [docChunks, demoChunks, typeChunks] = await Promise.all([
    buildDocChunks(),
    buildDemoChunks(),
    buildTypeChunks()
  ])

  return [...docChunks, ...demoChunks, ...typeChunks]
}
