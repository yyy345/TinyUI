import type { KnowledgeChunk, SearchResult } from '../types.js'
import { buildKnowledgeChunks } from './knowledge.js'

const MAX_RESULTS = 5
let knowledgeCache: Promise<KnowledgeChunk[]> | undefined

const tokenize = (value: string) => {
  const normalized = value.toLowerCase()
  const words = normalized.match(/[a-z][a-z0-9-]{1,}|[\u4e00-\u9fff]{2,}/g) ?? []
  const chinesePairs = [...normalized.matchAll(/[\u4e00-\u9fff]{2,}/g)]
    .flatMap(([group]) => [...group].slice(0, -1).map((char, index) => `${char}${group[index + 1]}`))
  return [...new Set([...words, ...chinesePairs])]
}

const scoreChunk = (chunk: KnowledgeChunk, query: string, tokens: string[], page?: string, component?: string) => {
  const haystack = `${chunk.component} ${chunk.title} ${chunk.keywords.join(' ')} ${chunk.text}`.toLowerCase()
  let score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0)
  if (component && chunk.component.toLowerCase() === component.toLowerCase()) score += 8
  if (page && chunk.route === page) score += 6
  if (query.includes(chunk.component.toLowerCase())) score += 5
  if (chunk.sourceType === 'doc') score += 0.5
  if (chunk.title.toLowerCase().includes(query)) score += 2
  return score
}

export const getKnowledgeChunks = () => {
  knowledgeCache ??= buildKnowledgeChunks()
  return knowledgeCache
}

export const searchDocuments = async (
  question: string,
  options: { page?: string, component?: string, limit?: number } = {}
): Promise<SearchResult[]> => {
  const chunks = await getKnowledgeChunks()
  const query = question.trim().toLowerCase()
  const tokens = tokenize(`${question} ${options.component ?? ''}`)
  const ranked = chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, query, tokens, options.page, options.component) }))
    .filter((chunk) => chunk.score > 0)
    .sort((left, right) => right.score - left.score)
  const limit = Math.min(options.limit ?? MAX_RESULTS, MAX_RESULTS)
  const selected = ranked.slice(0, Math.max(0, limit - 2))

  for (const sourceType of ['demo', 'types'] as const) {
    const candidate = ranked.find((chunk) => chunk.sourceType === sourceType &&
      (!options.component || chunk.component.toLowerCase() === options.component.toLowerCase()))
    if (candidate && !selected.some((chunk) => chunk.id === candidate.id)) selected.push(candidate)
  }

  for (const candidate of ranked) {
    if (selected.length >= limit) break
    if (!selected.some((chunk) => chunk.id === candidate.id)) selected.push(candidate)
  }
  return selected.slice(0, limit)
}
