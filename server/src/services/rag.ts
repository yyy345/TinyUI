import { buildKnowledgeChunks } from './knowledge.js'
import { embedTexts } from './embeddings.js'
import { generateAnswer } from './llm.js'
import { assertCollectionReady, ensureCollection, searchChunks, upsertChunks } from './qdrant.js'
import type { AskResponseBody, ChatTurn, SearchResult } from '../types.js'

const detectComponent = (question: string, candidates: string[]) => {
  const normalized = question.toLowerCase()
  return candidates.find((candidate) => normalized.includes(candidate.toLowerCase()))
}

const rerank = (question: string, results: SearchResult[]) => {
  const lowered = question.toLowerCase()
  return results
    .map((result) => {
      const keywordBoost = result.keywords.reduce((total, keyword) => {
        return total + (lowered.includes(keyword) ? 0.03 : 0)
      }, 0)

      const sourceBoost = result.sourceType === 'doc'
        ? 0.05
        : result.sourceType === 'demo'
          ? 0.03
          : 0.01

      return {
        ...result,
        score: result.score + keywordBoost + sourceBoost
      }
    })
    .sort((a, b) => b.score - a.score)
}

export const reindexKnowledge = async () => {
  const chunks = await buildKnowledgeChunks()
  const vectors = await embedTexts(chunks.map((chunk) => chunk.text))
  if (vectors.length === 0) {
    throw new Error('No vectors generated from knowledge chunks.')
  }

  await ensureCollection(vectors[0].length)
  await upsertChunks(chunks, vectors)

  return {
    totalChunks: chunks.length,
    vectorSize: vectors[0].length
  }
}

export const answerQuestion = async (
  question: string,
  history: ChatTurn[] = [],
  route?: string
): Promise<AskResponseBody> => {
  await assertCollectionReady()
  const chunks = await buildKnowledgeChunks()
  const components = [...new Set(chunks.map((chunk) => chunk.component))]
  const detectedComponent = detectComponent(question, components)
  const [queryVector] = await embedTexts([question])

  const primaryResults = await searchChunks(queryVector, {
    component: detectedComponent,
    route,
    limit: 8
  })

  const fallbackResults = primaryResults.length >= 4
    ? primaryResults
    : await searchChunks(queryVector, {
        route,
        limit: 8
      })

  const ranked = rerank(question, fallbackResults).slice(0, 5)
  const answer = await generateAnswer(question, ranked, history)

  return {
    answer,
    sources: ranked.map((result) => ({
      title: result.title,
      route: result.route,
      filePath: result.filePath,
      sourceType: result.sourceType,
      score: Number(result.score.toFixed(4))
    }))
  }
}
