import { config } from '../config.js'
import type { KnowledgeChunk, SearchResult } from '../types.js'

interface QdrantSearchPoint {
  score: number
  payload?: KnowledgeChunk
}

interface CollectionStatus {
  reachable: boolean
  exists: boolean
  detail?: string
}

const qdrantHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (config.qdrantApiKey) {
    headers['api-key'] = config.qdrantApiKey
  }

  return headers
}

const getQdrantUrl = (endpoint: string) => `${config.qdrantUrl}${endpoint}`

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Unknown error'
}

const createConnectionError = (endpoint: string, error: unknown) => {
  return new Error(
    `Unable to connect to Qdrant at ${getQdrantUrl(endpoint)}. ` +
    'Start Qdrant and verify QDRANT_URL before using AI search. ' +
    `Original error: ${getErrorMessage(error)}`
  )
}

const createMissingCollectionError = () => {
  return new Error(
    `Qdrant collection "${config.qdrantCollection}" was not found at ${config.qdrantUrl}. ` +
    'Run "npm run rag:index" after starting Qdrant to build the vector index.'
  )
}

const qdrantFetch = async <T>(endpoint: string, init?: RequestInit) => {
  let response: Response

  try {
    response = await fetch(getQdrantUrl(endpoint), {
      ...init,
      headers: {
        ...qdrantHeaders(),
        ...(init?.headers as Record<string, string> | undefined)
      }
    })
  } catch (error) {
    throw createConnectionError(endpoint, error)
  }

  if (!response.ok) {
    if (response.status === 404 && endpoint.startsWith(`/collections/${config.qdrantCollection}`)) {
      throw createMissingCollectionError()
    }

    const detail = await response.text()
    throw new Error(`Qdrant request failed: ${response.status} ${detail}`)
  }

  return await response.json() as T
}

export const getCollectionStatus = async (): Promise<CollectionStatus> => {
  const endpoint = `/collections/${config.qdrantCollection}`
  let response: Response

  try {
    response = await fetch(getQdrantUrl(endpoint), {
      headers: qdrantHeaders()
    })
  } catch (error) {
    return {
      reachable: false,
      exists: false,
      detail: createConnectionError(endpoint, error).message
    }
  }

  if (response.ok) {
    return {
      reachable: true,
      exists: true
    }
  }

  if (response.status === 404) {
    return {
      reachable: true,
      exists: false,
      detail: createMissingCollectionError().message
    }
  }

  const detail = await response.text()
  return {
    reachable: true,
    exists: false,
    detail: `Unable to inspect Qdrant collection "${config.qdrantCollection}": ${response.status} ${detail}`
  }
}

export const assertCollectionReady = async () => {
  const status = await getCollectionStatus()

  if (!status.reachable || !status.exists) {
    throw new Error(status.detail || 'Qdrant collection is not ready.')
  }
}

export const ensureCollection = async (vectorSize: number) => {
  const endpoint = `/collections/${config.qdrantCollection}`
  let response: Response

  try {
    response = await fetch(getQdrantUrl(endpoint), {
      headers: qdrantHeaders()
    })
  } catch (error) {
    throw createConnectionError(endpoint, error)
  }

  if (response.ok) {
    return
  }

  if (response.status !== 404) {
    const detail = await response.text()
    throw new Error(`Unable to inspect collection: ${response.status} ${detail}`)
  }

  await qdrantFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify({
      vectors: {
        size: vectorSize,
        distance: 'Cosine'
      }
    })
  })
}

export const upsertChunks = async (chunks: KnowledgeChunk[], vectors: number[][]) => {
  const points = chunks.map((chunk, index) => ({
    id: index + 1,
    vector: vectors[index],
    payload: chunk
  }))

  await qdrantFetch(`/collections/${config.qdrantCollection}/points?wait=true`, {
    method: 'PUT',
    body: JSON.stringify({ points })
  })
}

export const searchChunks = async (
  queryVector: number[],
  options?: {
    limit?: number
    component?: string
    route?: string
  }
) => {
  const must: Array<Record<string, unknown>> = []

  if (options?.component) {
    must.push({
      key: 'component',
      match: {
        value: options.component
      }
    })
  }

  const should = options?.route
    ? [{
        key: 'route',
        match: {
          value: options.route
        }
      }]
    : []

  const payload = {
    vector: queryVector,
    limit: options?.limit ?? 6,
    with_payload: true,
    filter: must.length > 0 || should.length > 0
      ? {
          ...(must.length > 0 ? { must } : {}),
          ...(should.length > 0 ? { should } : {})
        }
      : undefined
  }

  const response = await qdrantFetch<{ result: QdrantSearchPoint[] }>(
    `/collections/${config.qdrantCollection}/points/search`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  )

  return response.result
    .map((item) => item.payload
      ? {
          ...item.payload,
          score: item.score
        } satisfies SearchResult
      : null
    )
    .filter((item): item is SearchResult => item !== null)
}
