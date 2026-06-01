import { config } from '../config.js'
import { OpenAICompatibleClient } from './openai-compatible.js'

const client = new OpenAICompatibleClient(config.embeddingBaseUrl, config.embeddingApiKey)

export const embedTexts = async (texts: string[]) => {
  if (texts.length === 0) {
    return []
  }

  // DashScope embeddings currently accept at most 10 inputs per request.
  const batchSize = 10
  const vectors: number[][] = []

  for (let index = 0; index < texts.length; index += batchSize) {
    const batch = texts.slice(index, index + batchSize)
    const batchVectors = await client.embeddings(config.embeddingModel, batch)
    vectors.push(...batchVectors)
  }

  return vectors
}
