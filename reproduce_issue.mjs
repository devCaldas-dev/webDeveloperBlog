import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

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

const posts = listMdxFiles(path.join(process.cwd(), 'data', 'blog')).map((filePath) => {
  const { data } = matter(readFileSync(filePath, 'utf8'))
  return { title: data.title, date: data.date }
})
const sorted = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

console.log('Top 5 posts:')
sorted.slice(0, 5).forEach(post => {
    console.log(`${post.date} - ${post.title}`)
})

const missingTitles = [
    "Diferencia entre THAT y WHAT",
    "Than vs. Then: Comparing and Sequencing",
    "That and What: Pointing and Defining"
];

console.log('\nChecking for missing posts:')
missingTitles.forEach(title => {
    const found = sorted.find(p => p.title === title)
    if (found) {
        console.log(`[FOUND] ${found.date} - ${found.title}`)
    } else {
        console.log(`[MISSING] ${title}`)
    }
})
