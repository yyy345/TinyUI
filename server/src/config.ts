import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const envFile = path.join(rootDir, 'server', '.env')

if (fs.existsSync(envFile)) {
  const raw = fs.readFileSync(envFile, 'utf8')
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      return
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      return
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}

const getEnv = (key: string, fallback = '') => process.env[key]?.trim() || fallback

export const config = {
  port: Number(getEnv('RAG_PORT', getEnv('AI_SERVER_PORT', '3030'))),
  rootDir,
  docsDir: path.join(rootDir, 'docs'),
  componentsDir: path.join(rootDir, 'src', 'components'),
  qdrantUrl: getEnv('QDRANT_URL', 'http://127.0.0.1:6333'),
  qdrantCollection: getEnv('QDRANT_COLLECTION', 'tiny_element_docs'),
  qdrantApiKey: getEnv('QDRANT_API_KEY'),
  embeddingBaseUrl: getEnv('EMBEDDING_BASE_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
  embeddingApiKey: getEnv('EMBEDDING_API_KEY'),
  embeddingModel: getEnv('EMBEDDING_MODEL', 'text-embedding-v4'),
  llmBaseUrl: getEnv('LLM_BASE_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
  llmApiKey: getEnv('LLM_API_KEY'),
  llmModel: getEnv('LLM_MODEL', 'qwen-plus')
}

export const ensureConfig = () => {
  if (!config.embeddingApiKey) {
    throw new Error('Missing EMBEDDING_API_KEY environment variable.')
  }

  if (!config.llmApiKey) {
    throw new Error('Missing LLM_API_KEY environment variable.')
  }
}
