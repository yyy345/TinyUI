import { ensureConfig } from '../config.js'
import { reindexKnowledge } from '../services/rag.js'

const main = async () => {
  ensureConfig()
  const result = await reindexKnowledge()
  console.log(`Indexed ${result.totalChunks} chunks with vector size ${result.vectorSize}.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
