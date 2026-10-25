'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

interface SearchDocument {
  title: string
  path: string
  summary?: string
  tags: string[]
}

export default function SearchButton() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [documents, setDocuments] = useState<SearchDocument[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || documents.length || error) return
    fetch('/search.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Search index request failed (${response.status})`)
        return response.json() as Promise<SearchDocument[]>
      })
      .then(setDocuments)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Unable to load search index.')
      })
  }, [documents.length, error, open])

  const normalizedQuery = query.trim().toLowerCase()
  const results = normalizedQuery
    ? documents
        .filter((document) =>
          `${document.title} ${document.summary || ''} ${document.tags.join(' ')}`
            .toLowerCase()
            .includes(normalizedQuery)
        )
        .slice(0, 8)
    : []

  if (siteMetadata.search?.provider !== 'kbar') return null

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="rounded p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6 text-gray-900 dark:text-gray-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-[15vh]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Search articles"
            className="w-full max-w-xl rounded-lg bg-white p-5 shadow-xl dark:bg-gray-900"
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpen(false)
            }}
          >
            <div className="flex gap-3">
              <input
                autoFocus
                type="search"
                aria-label="Search articles"
                placeholder="Search articles"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-gray-900 dark:border-gray-700 dark:text-gray-100"
              />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close search">
                Close
              </button>
            </div>
            {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
            {!error && normalizedQuery && !results.length && documents.length > 0 && (
              <p className="mt-4 text-gray-500">No matching articles.</p>
            )}
            <ul className="mt-4 max-h-[50vh] overflow-auto">
              {results.map((document) => (
                <li key={document.path} className="border-t border-gray-200 py-3 dark:border-gray-700">
                  <Link
                    href={`/${document.path}`}
                    onClick={() => setOpen(false)}
                    className="font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {document.title}
                  </Link>
                  {document.summary && (
                    <p className="mt-1 text-sm text-gray-500">{document.summary}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  )
}
