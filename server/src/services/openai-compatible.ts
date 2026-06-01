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
}
