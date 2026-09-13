export interface AiSource {
  title: string
  url: string
  component: string
  sourceType: 'doc' | 'demo' | 'types' | 'page'
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
  error?: boolean
  retryQuestion?: string
  sources?: AiSource[]
}

export interface AiPageContext {
  page: string
  component?: string
  pageContent?: string
}

export interface AiChatCallbacks {
  onDelta: (content: string) => void
  onSources: (sources: AiSource[]) => void
}
