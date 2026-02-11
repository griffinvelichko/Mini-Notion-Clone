'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Page, Block, BlockType, BlockStyle } from '@/lib/types'
import BlockList from './BlockList'
import AddBlockButton from './AddBlockButton'

interface PageEditorProps {
  pageId: string
}

export default function PageEditor({ pageId }: PageEditorProps) {
  const [page, setPage] = useState<Page | null>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/pages/${pageId}`)
      .then((r) => r.json())
      .then((data) => {
        setPage(data)
        if (titleRef.current) {
          titleRef.current.textContent = data.title || ''
        }
      })
  }, [pageId])

  const saveTitle = useCallback(async () => {
    if (!titleRef.current || !page) return
    const title = titleRef.current.textContent || 'Untitled'
    if (title === page.title) return
    await fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setPage((prev) => prev ? { ...prev, title } : prev)
  }, [page, pageId])

  async function handleAddBlock(type: BlockType, style?: BlockStyle) {
    const res = await fetch(`/api/pages/${pageId}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, style }),
    })
    const block = await res.json()
    setPage((prev) =>
      prev ? { ...prev, blocks: [...prev.blocks, block] } : prev
    )
  }

  async function handleUpdateBlock(blockId: string, data: Partial<Block>) {
    await fetch(`/api/pages/${pageId}/blocks/${blockId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setPage((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === blockId ? { ...b, ...data } : b
        ),
      }
    })
  }

  async function handleDeleteBlock(blockId: string) {
    await fetch(`/api/pages/${pageId}/blocks/${blockId}`, {
      method: 'DELETE',
    })
    setPage((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        blocks: prev.blocks.filter((b) => b.id !== blockId),
      }
    })
  }

  async function handleReorder(reorderedBlocks: Block[]) {
    setPage((prev) =>
      prev ? { ...prev, blocks: reorderedBlocks } : prev
    )
    await fetch(`/api/pages/${pageId}/blocks/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockIds: reorderedBlocks.map((b) => b.id) }),
    })
  }

  function handleTitlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-notion-secondary">
        Loading...
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-[720px] mx-auto px-16 py-12">
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Untitled"
          onBlur={saveTitle}
          onPaste={handleTitlePaste}
          className="text-[40px] font-bold leading-tight mb-4 cursor-text focus:outline-none break-words"
        />
        <BlockList
          blocks={page.blocks}
          pageId={pageId}
          onReorder={handleReorder}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
        />
        <AddBlockButton onAdd={handleAddBlock} />
      </div>
    </main>
  )
}
