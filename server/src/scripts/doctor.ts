import { config } from '../config.js'
import { getKnowledgeChunks } from '../services/document-search.js'

const main = async () => {
  const chunks = await getKnowledgeChunks()
  const hasLlmKey = Boolean(config.llmApiKey)
  console.log('TinyElement AI doctor')
  console.log(`- port: ${config.port}`)
  console.log(`- llm model: ${config.llmModel}`)
  console.log(`- LLM_API_KEY: ${hasLlmKey ? 'configured' : 'missing'}`)
  console.log(`- local document chunks: ${chunks.length}`)
  if (!hasLlmKey || chunks.length === 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
