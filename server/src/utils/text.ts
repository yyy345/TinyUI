export const stripFrontmatter = (content: string) =>
  content.replace(/^---[\s\S]*?---\s*/, '')

export const stripCodeFence = (content: string) =>
  content.replace(/```[\s\S]*?```/g, (match) => match.replace(/\n/g, ' '))

export const stripHtmlTags = (content: string) =>
  content
    .replace(/<preview\s+([^>]+?)><\/preview>/g, ' $1 ')
    .replace(/<[^>]+>/g, ' ')

export const normalizeWhitespace = (content: string) =>
  content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n /g, '\n')
    .trim()

export const extractKeywords = (value: string) => {
  const asciiWords = value
    .toLowerCase()
    .match(/[a-z][a-z0-9-]{1,}/g) ?? []

  return [...new Set(asciiWords)].slice(0, 16)
}

export const snippet = (value: string, maxLength = 240) => {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trim()}...`
}
