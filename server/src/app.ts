import express from 'express'
import { ensureConfig, config } from './config.js'
import { answerQuestion } from './services/rag.js'
import { getCollectionStatus } from './services/qdrant.js'
import type { ChatRequestBody } from './types.js'

const app = express()

app.use(express.json({ limit: '1mb' }))
app.use((_, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  next()
})

app.options('*', (_, response) => {
  response.sendStatus(204)
})

const sendSse = (response: express.Response, event: string, data: unknown) => {
  response.write(`event: ${event}\n`)
  response.write(`data: ${JSON.stringify(data)}\n\n`)
}

const splitAnswerIntoChunks = (answer: string, chunkSize = 96) => {
  const normalized = answer.replace(/\r\n/g, '\n')
  const chunks: string[] = []

  for (let index = 0; index < normalized.length; index += chunkSize) {
    chunks.push(normalized.slice(index, index + chunkSize))
  }

  return chunks.length > 0 ? chunks : ['']
}

const streamAnswer = async (body: ChatRequestBody, response: express.Response) => {
  const result = await answerQuestion(
    body.question,
    body.history ?? [],
    body.route
  )

  sendSse(response, 'sources', {
    sources: result.sources
  })

  for (const chunk of splitAnswerIntoChunks(result.answer)) {
    if (chunk) {
      sendSse(response, 'delta', { content: chunk })
    }
  }

  sendSse(response, 'done', {})
}

app.get('/api/rag/health', async (_, response) => {
  const configReady = Boolean(config.embeddingApiKey && config.llmApiKey)
  const collectionStatus = await getCollectionStatus()
  const ready = configReady && collectionStatus.reachable && collectionStatus.exists

  response.status(ready ? 200 : 503).json({
    ok: ready,
    model: config.llmModel,
    embeddingModel: config.embeddingModel,
    collection: config.qdrantCollection,
    rag: 'vector-search',
    checks: {
      configReady,
      qdrantReachable: collectionStatus.reachable,
      collectionReady: collectionStatus.exists,
      detail: collectionStatus.detail || null
    }
  })
})

app.post('/api/rag/ask', async (request, response) => {
  const body = request.body as ChatRequestBody
  const question = body.question?.trim()

  if (!question) {
    response.status(400).json({ message: 'question is required' })
    return
  }

  response.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  response.setHeader('Cache-Control', 'no-cache, no-transform')
  response.setHeader('Connection', 'keep-alive')
  response.flushHeaders?.()

  try {
    await streamAnswer({ ...body, question }, response)
  } catch (error) {
    sendSse(response, 'error', {
      message: error instanceof Error ? error.message : 'Unknown server error'
    })
  } finally {
    response.end()
  }
})

ensureConfig()

app.listen(config.port, () => {
  console.log(`RAG server listening on http://127.0.0.1:${config.port}`)
})
