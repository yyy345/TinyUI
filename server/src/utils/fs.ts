import fs from 'node:fs/promises'
import path from 'node:path'

export const walkFiles = async (dir: string, matcher: (filePath: string) => boolean) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkFiles(fullPath, matcher))
      continue
    }

    if (matcher(fullPath)) {
      files.push(fullPath)
    }
  }

  return files
}

export const readUtf8 = async (filePath: string) => fs.readFile(filePath, 'utf8')

export const toPosixPath = (value: string) => value.replaceAll(path.sep, '/')
