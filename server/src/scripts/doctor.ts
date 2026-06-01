import { config } from '../config.js'
import { getCollectionStatus } from '../services/qdrant.js'

const printCheck = (label: string, ok: boolean, detail: string) => {
  const badge = ok ? 'OK  ' : 'FAIL'
  console.log(`[${badge}] ${label}: ${detail}`)
}

const main = async () => {
  console.log('TinyElement RAG doctor')
  console.log(`- port: ${config.port}`)
  console.log(`- qdrant: ${config.qdrantUrl}`)
  console.log(`- collection: ${config.qdrantCollection}`)
  console.log(`- embedding model: ${config.embeddingModel}`)
  console.log(`- llm model: ${config.llmModel}`)
  console.log('')

  const hasEmbeddingKey = Boolean(config.embeddingApiKey)
  const hasLlmKey = Boolean(config.llmApiKey)

  printCheck('EMBEDDING_API_KEY', hasEmbeddingKey, hasEmbeddingKey ? 'configured' : 'missing')
  printCheck('LLM_API_KEY', hasLlmKey, hasLlmKey ? 'configured' : 'missing')

  const collectionStatus = await getCollectionStatus()
  printCheck(
    'Qdrant connection',
    collectionStatus.reachable,
    collectionStatus.reachable ? 'reachable' : (collectionStatus.detail || 'unreachable')
  )
  printCheck(
    'Vector collection',
    collectionStatus.exists,
    collectionStatus.exists
      ? `"${config.qdrantCollection}" is ready`
      : (collectionStatus.detail || 'missing')
  )

  if (!hasEmbeddingKey || !hasLlmKey || !collectionStatus.reachable || !collectionStatus.exists) {
    process.exitCode = 1
    console.log('')
    console.log('Next steps:')
    if (!collectionStatus.reachable) {
      console.log('- Start Qdrant and confirm QDRANT_URL points to the running instance.')
    } else if (!collectionStatus.exists) {
      console.log('- Run "npm run rag:index" to build the vector index into Qdrant.')
    }
    if (!hasEmbeddingKey) {
      console.log('- Add EMBEDDING_API_KEY to server/.env.')
    }
    if (!hasLlmKey) {
      console.log('- Add LLM_API_KEY to server/.env.')
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
