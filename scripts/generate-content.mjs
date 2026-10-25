import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { slug } from 'github-slugger'

const contentDirectory = path.join(process.cwd(), 'data', 'blog')

function listMdxFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory()
      ? listMdxFiles(entryPath)
      : entry.name.endsWith('.mdx')
        ? [entryPath]
        : []
  })
}

const posts = listMdxFiles(contentDirectory).map((filePath) => {
  const parsed = matter(readFileSync(filePath, 'utf8'))
  const relativePath = path.relative(path.join(process.cwd(), 'data'), filePath)
  const documentPath = relativePath.replace(/\\/g, '/').replace(/\.mdx$/i, '')
  return {
    path: documentPath,
    slug: documentPath.replace(/^blog\//, ''),
    title: String(parsed.data.title || ''),
    summary: parsed.data.summary ? String(parsed.data.summary) : '',
    date: parsed.data.date instanceof Date ? parsed.data.date.toISOString() : String(parsed.data.date || ''),
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
    draft: parsed.data.draft === true,
  }
})

const tagCounts = {}
for (const post of posts) {
  if (process.env.NODE_ENV === 'production' && post.draft) continue
  for (const tag of post.tags) {
    const tagSlug = slug(tag)
    tagCounts[tagSlug] = (tagCounts[tagSlug] || 0) + 1
  }
}

writeFileSync(
  path.join(process.cwd(), 'app', 'tag-data.json'),
  JSON.stringify(tagCounts)
)
writeFileSync(
  path.join(process.cwd(), 'public', 'search.json'),
  JSON.stringify(posts.map(({ draft, ...post }) => post))
)
