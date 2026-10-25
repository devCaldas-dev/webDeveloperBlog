import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeCitation from 'rehype-citation'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import path from 'path'
import { components } from '@/components/MDXComponents'

export default function MDXRenderer({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: 'prepend',
                headingProperties: { className: ['content-header'] },
              },
            ],
            rehypeKatex,
            [rehypeCitation, { path: path.join(process.cwd(), 'data') }],
            [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
          ],
        },
      }}
    />
  )
}
