export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequestBody {
  messages: ChatTurn[]
  page?: string
  component?: string
  pageContent?: string
  context?: KnowledgeChunk[]
}

export interface DocumentSource {
  title: string
  url: string
  component: string
  sourceType: KnowledgeChunk['sourceType'] | 'page'
}

export interface KnowledgeChunk {
  id: string
  text: string
  component: string
  title: string
  section: string
  sourceType: 'doc' | 'demo' | 'types'
  filePath: string
  route: string
  keywords: string[]
}

export interface SearchResult extends KnowledgeChunk {
  score: number
}

export interface AskResponseBody {
  answer: string
  sources: Array<{
    title: string
    route: string
    filePath: string
    sourceType: KnowledgeChunk['sourceType']
    score: number
  }>
}
