import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import GithubSlugger, { slug } from 'github-slugger'
import siteMetadata from '@/data/siteMetadata'

interface RawContent {
  sourceFilePath: string
  flattenedPath: string
}

interface ContentBody {
  raw: string
}

export interface ContentDocument {
  _id: string
  _raw: RawContent
  body: ContentBody
  slug: string
  path: string
  filePath: string
  readingTime: ReturnType<typeof readingTime>
  toc: Array<{ value: string; url: string; depth: number }>
}

export interface Blog extends ContentDocument {
  title: string
  date: string
  tags: string[]
  lastmod?: string
  draft?: boolean
  summary?: string
  images?: string | string[]
  authors?: string[]
  layout?: string
  bibliography?: string
  canonicalUrl?: string
  structuredData: Record<string, unknown>
}

export interface Authors extends ContentDocument {
  name: string
  avatar?: string
  occupation?: string
  company?: string
  email?: string
  twitter?: string
  linkedin?: string
  github?: string
  layout?: string
}

export type CoreContent<T extends ContentDocument> = Omit<T, '_id' | '_raw' | 'body'>

interface ParsedFile {
  metadata: Record<string, unknown>
  content: string
  sourceFilePath: string
  relativePath: string
  flattenedPath: string
}

function listMdxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory()
      ? listMdxFiles(entryPath)
      : entry.name.endsWith('.mdx')
        ? [entryPath]
        : []
  })
}

function readFiles(type: 'blog' | 'authors'): ParsedFile[] {
  const dataDirectory = path.join(process.cwd(), 'data')
  const contentDirectory = path.join(dataDirectory, type)
  return listMdxFiles(contentDirectory).map((sourceFilePath) => {
    const parsed = matter(readFileSync(sourceFilePath, 'utf8'))
    const relativePath = path.relative(dataDirectory, sourceFilePath).replace(/\\/g, '/')
    return {
      metadata: parsed.data,
      content: parsed.content,
      sourceFilePath,
      relativePath,
      flattenedPath: relativePath.replace(/\.mdx$/i, ''),
    }
  })
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function asStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined
}

function asIsoDate(value: unknown, sourceFilePath: string, field: string): string {
  const date = value instanceof Date ? value : new Date(String(value ?? ''))
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${field} in ${sourceFilePath}`)
  }
  return date.toISOString()
}

function createToc(content: string) {
  const slugger = new GithubSlugger()
  return content.split(/\r?\n/).flatMap((line) => {
    const heading = /^(#{2,4})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!heading) return []
    const value = heading[2].replace(/[`*_~]/g, '').trim()
    return [{ value, url: `#${slugger.slug(value)}`, depth: heading[1].length }]
  })
}

function commonContent(file: ParsedFile): ContentDocument {
  return {
    _id: file.flattenedPath,
    _raw: {
      sourceFilePath: file.relativePath,
      flattenedPath: file.flattenedPath,
    },
    body: { raw: file.content },
    slug: file.flattenedPath.replace(/^[^/]+\//, ''),
    path: file.flattenedPath,
    filePath: file.relativePath,
    readingTime: readingTime(file.content),
    toc: createToc(file.content),
  }
}

function readBlog(file: ParsedFile): Blog {
  const title = asString(file.metadata.title)
  if (!title) throw new Error(`Missing title in ${file.sourceFilePath}`)
  const date = asIsoDate(file.metadata.date, file.sourceFilePath, 'date')
  const lastmod = file.metadata.lastmod
    ? asIsoDate(file.metadata.lastmod, file.sourceFilePath, 'lastmod')
    : undefined
  const images = asStringArray(file.metadata.images) || asString(file.metadata.images)
  const blog: Blog = {
    ...commonContent(file),
    title,
    date,
    tags: asStringArray(file.metadata.tags) || [],
    lastmod,
    draft: typeof file.metadata.draft === 'boolean' ? file.metadata.draft : undefined,
    summary: asString(file.metadata.summary),
    images,
    authors: asStringArray(file.metadata.authors),
    layout: asString(file.metadata.layout),
    bibliography: asString(file.metadata.bibliography),
    canonicalUrl: asString(file.metadata.canonicalUrl),
    structuredData: {},
  }
  blog.structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    datePublished: blog.date,
    dateModified: blog.lastmod || blog.date,
    description: blog.summary,
    image: Array.isArray(blog.images)
      ? blog.images[0]
      : blog.images || siteMetadata.socialBanner,
    url: `${siteMetadata.siteUrl}/${blog.path}`,
  }
  return blog
}

function readAuthor(file: ParsedFile): Authors {
  const name = asString(file.metadata.name)
  if (!name) throw new Error(`Missing name in ${file.sourceFilePath}`)
  return {
    ...commonContent(file),
    name,
    avatar: asString(file.metadata.avatar),
    occupation: asString(file.metadata.occupation),
    company: asString(file.metadata.company),
    email: asString(file.metadata.email),
    twitter: asString(file.metadata.twitter),
    linkedin: asString(file.metadata.linkedin),
    github: asString(file.metadata.github),
    layout: asString(file.metadata.layout),
  }
}

let cachedBlogs: Blog[] | undefined
let cachedAuthors: Authors[] | undefined

export function getAllBlogs(): Blog[] {
  cachedBlogs ??= readFiles('blog')
    .map(readBlog)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return cachedBlogs
}

export function getAllAuthors(): Authors[] {
  cachedAuthors ??= readFiles('authors').map(readAuthor)
  return cachedAuthors
}

export function sortPosts<T extends { date: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function coreContent<T extends ContentDocument>(document: T): CoreContent<T> {
  const { _id, _raw, body, ...content } = document
  return content
}

export function allCoreContent<T extends ContentDocument>(documents: T[]): CoreContent<T>[] {
  return documents.map(coreContent)
}

export function getTagCounts(): Record<string, number> {
  return getAllBlogs().reduce<Record<string, number>>((counts, post) => {
    if (process.env.NODE_ENV === 'production' && post.draft) return counts
    for (const tag of post.tags) {
      const tagSlug = slug(tag)
      counts[tagSlug] = (counts[tagSlug] || 0) + 1
    }
    return counts
  }, {})
}
