export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequestBody {
  question: string
  history?: ChatTurn[]
  route?: string
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
