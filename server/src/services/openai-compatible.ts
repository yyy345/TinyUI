interface EmbeddingResponse {
  data: Array<{
    embedding: number[]
  }>
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

interface ChatCompletionChunk {
  choices?: Array<{ delta?: { content?: string } }>
}

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Unknown error'
}

const postJson = async <T>(
  url: string,
  apiKey: string,
  body: unknown,
  serviceName: 'embedding' | 'llm'
): Promise<T> => {
  let response: Response

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    })
  } catch (error) {
    throw new Error(
      `Unable to reach the ${serviceName.toUpperCase()} endpoint at ${url}. ` +
      `Check the base URL, API key, and outbound network access. Original error: ${getErrorMessage(error)}`
    )
  }

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Request to ${url} failed: ${response.status} ${detail}`)
  }

  return await response.json() as T
}

export class OpenAICompatibleClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string
  ) {}

  async embeddings(model: string, input: string[]) {
    const data = await postJson<EmbeddingResponse>(
      `${this.baseUrl}/embeddings`,
      this.apiKey,
      { model, input },
      'embedding'
    )

    return data.data.map((item) => item.embedding)
  }

  async chatCompletion(model: string, messages: Array<{ role: string, content: string }>) {
    const data = await postJson<ChatCompletionResponse>(
      `${this.baseUrl}/chat/completions`,
      this.apiKey,
      {
        model,
        temperature: 0.2,
        messages
      },
      'llm'
    )

    return data.choices[0]?.message.content?.trim() || ''
  }

  async streamChatCompletion(
    model: string,
    messages: Array<{ role: string, content: string }>,
    signal: AbortSignal,
    onDelta: (content: string) => void
  ) {
    let response: Response
    const url = `${this.baseUrl}/chat/completions`
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({ model, temperature: 0.2, messages, stream: true }),
        signal
      })
    } catch (error) {
      if (signal.aborted) throw error
      throw new Error(`Unable to reach the LLM endpoint at ${url}. Original error: ${getErrorMessage(error)}`)
    }
    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`LLM request failed: ${response.status} ${detail}`)
    }
    if (!response.body) throw new Error('LLM response does not contain a readable stream.')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let receivedContent = false
    const consumeEvent = (event: string) => {
      const data = event.split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('')
      if (!data || data === '[DONE]') return
      const content = (JSON.parse(data) as ChatCompletionChunk).choices?.[0]?.delta?.content
      if (content) {
        receivedContent = true
        onDelta(content)
      }
    }
    let streamDone = false
    while (!streamDone) {
      const { done, value } = await reader.read()
      streamDone = done
      if (done) continue
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''
      events.forEach(consumeEvent)
    }
    if (buffer.trim()) consumeEvent(buffer)
    if (!receivedContent) throw new Error('LLM did not return displayable content.')
  }
}
