import { config } from '../config.js'
import type { ChatTurn, SearchResult } from '../types.js'
import { OpenAICompatibleClient } from './openai-compatible.js'

const client = new OpenAICompatibleClient(config.llmBaseUrl, config.llmApiKey)

const formatContext = (results: SearchResult[]) =>
  results
    .map((item, index) => {
      return [
        `\u3010\u8d44\u6599 ${index + 1}\u3011`,
        `\u7ec4\u4ef6: ${item.component}`,
        `\u6807\u9898: ${item.title}`,
        `\u7c7b\u578b: ${item.sourceType}`,
        `\u6587\u4ef6: ${item.filePath}`,
        `\u8def\u7531: ${item.route}`,
        '\u5185\u5bb9:',
        item.text
      ].join('\n')
    })
    .join('\n\n')

export const generateAnswer = async (
  question: string,
  results: SearchResult[],
  history: ChatTurn[] = []
) => {
  const historyMessages = history.slice(-6).flatMap((turn) => {
    return [{ role: turn.role, content: turn.content }]
  })

  return await client.chatCompletion(config.llmModel, [
    {
      role: 'system',
      content: [
        '\u4f60\u662f TinyElement \u7ec4\u4ef6\u5e93\u7684 AI \u6587\u6863\u52a9\u624b\u3002',
        '\u4f60\u53ea\u80fd\u4f9d\u636e\u7ed9\u5b9a\u8d44\u6599\u56de\u7b54\uff0c\u4e0d\u8981\u7f16\u9020\u4e0d\u5b58\u5728\u7684\u7ec4\u4ef6\u80fd\u529b\u3002',
        '\u5982\u679c\u8d44\u6599\u4e0d\u8db3\uff0c\u8bf7\u660e\u786e\u8bf4\u201c\u5f53\u524d\u77e5\u8bc6\u5e93\u91cc\u6ca1\u6709\u627e\u5230\u8db3\u591f\u4fe1\u606f\u201d\u3002',
        '\u8bf7\u4f18\u5148\u7ed9\u51fa\u7b80\u6d01\u3001\u53ef\u6267\u884c\u7684\u56de\u7b54\uff0c\u5e76\u5728\u6700\u540e\u5355\u72ec\u5217\u51fa\u201c\u53c2\u8003\u6765\u6e90\uff1a\u201d\u53ca\u5f15\u7528\u7684\u8d44\u6599\u7f16\u53f7\u3002'
      ].join('\n')
    },
    ...historyMessages,
    {
      role: 'user',
      content: [
        `\u7528\u6237\u95ee\u9898\uff1a${question}`,
        '',
        '\u8bf7\u4ec5\u57fa\u4e8e\u4e0b\u9762\u7684\u9879\u76ee\u8d44\u6599\u56de\u7b54\uff1a',
        formatContext(results)
      ].join('\n')
    }
  ])
}
