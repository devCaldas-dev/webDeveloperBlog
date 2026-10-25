'use client'

import type { MDXComponents } from 'mdx/types'
import type { ComponentProps, FormEvent } from 'react'
import { useState } from 'react'
import Image from './Image'
import CustomLink from './Link'

function Pre({ children, ...props }: ComponentProps<'pre'>) {
  return (
    <pre {...props} className="overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      {children}
    </pre>
  )
}

function TOCInline({
  toc,
}: {
  toc?: Array<{ value: string; url: string; depth: number }>
}) {
  if (!toc?.length) return null
  return (
    <nav aria-label="Table of contents">
      <ul>
        {toc.map((heading) => (
          <li
            key={heading.url}
            style={{ marginLeft: `${Math.max(0, heading.depth - 2) * 16}px` }}
          >
            <a href={heading.url}>{heading.value}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function BlogNewsletterForm() {
  const [status, setStatus] = useState('')

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    const formData = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.get('email') }),
      })
      const result = await response.json()
      if (!response.ok) {
        setStatus(result.error || 'Unable to subscribe right now.')
        return
      }
      setStatus('Thank you for subscribing.')
      event.currentTarget.reset()
    } catch {
      setStatus('Unable to subscribe right now. Please try again.')
    }
  }

  return (
    <form onSubmit={subscribe} className="my-6 flex flex-wrap gap-2">
      <label className="sr-only" htmlFor="newsletter-email">Email address</label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        placeholder="Email address"
      />
      <button type="submit" className="rounded-md bg-primary-500 px-4 py-2 text-white">
        Subscribe
      </button>
      {status && <p role="status" className="w-full">{status}</p>}
    </form>
  )
}

function MdxImage({ src = '', alt = '', ...props }: ComponentProps<'img'>) {
  return <img src={src} alt={alt} {...props} className="mx-auto max-w-full" />
}

export const components: MDXComponents = {
  Image,
  img: MdxImage,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm,
}
