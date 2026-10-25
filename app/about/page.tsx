import MDXRenderer from '@/components/MDXRenderer'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent, getAllAuthors } from '@/lib/content'
import type { Authors } from '@/lib/content'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'About this' })

export default function Page() {
  const author = getAllAuthors().find((p) => p.slug === 'default') as Authors
  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXRenderer source={author.body.raw} />
      </AuthorLayout>
    </>
  )
}
