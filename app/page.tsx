import { allCoreContent, getAllBlogs, sortPosts } from '@/lib/content'
import Main from './Main'

export default async function Page() {
  const sortedPosts = sortPosts(getAllBlogs())
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} />
}
