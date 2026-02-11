'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface PageItem {
  id: string
  title: string
}

export default function Sidebar() {
  const [pages, setPages] = useState<PageItem[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const activePageId = pathname.replace('/', '')

  useEffect(() => {
    fetchPages()
  }, [])

  async function fetchPages() {
    const res = await fetch('/api/pages')
    const data = await res.json()
    setPages(data)
  }

  async function createPage() {
    const res = await fetch('/api/pages', { method: 'POST' })
    const page = await res.json()
    setPages((prev) => [...prev, { id: page.id, title: page.title }])
    router.push(`/${page.id}`)
  }

  async function deletePage(e: React.MouseEvent, pageId: string) {
    e.stopPropagation()
    await fetch(`/api/pages/${pageId}`, { method: 'DELETE' })
    setPages((prev) => prev.filter((p) => p.id !== pageId))
    if (activePageId === pageId) {
      const remaining = pages.filter((p) => p.id !== pageId)
      if (remaining.length > 0) {
        router.push(`/${remaining[0].id}`)
      } else {
        router.push('/')
      }
    }
  }

  return (
    <aside className="w-60 shrink-0 bg-notion-sidebar border-r border-notion-border flex flex-col h-full">
      <div className="px-3 py-4">
        <h1 className="text-sm font-semibold text-notion-secondary px-2">
          Mini Notion
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto px-2">
        {pages.map((page) => (
          <div
            key={page.id}
            onClick={() => router.push(`/${page.id}`)}
            className={`group flex items-center justify-between px-2 py-1.5 rounded text-sm cursor-pointer transition-colors duration-100 ${
              activePageId === page.id
                ? 'bg-notion-hover font-medium'
                : 'hover:bg-notion-hover'
            }`}
          >
            <span className="truncate">
              {page.title || 'Untitled'}
            </span>
            <button
              onClick={(e) => deletePage(e, page.id)}
              className="opacity-0 group-hover:opacity-100 text-notion-secondary hover:text-notion-text text-xs px-1 transition-opacity duration-100"
            >
              ✕
            </button>
          </div>
        ))}
      </nav>
      <div className="px-2 pb-4">
        <button
          onClick={createPage}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-notion-secondary hover:bg-notion-hover transition-colors duration-100"
        >
          <span className="text-lg leading-none">+</span>
          New Page
        </button>
      </div>
    </aside>
  )
}
