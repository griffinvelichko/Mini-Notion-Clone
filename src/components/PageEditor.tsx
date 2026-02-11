'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Page, Block, BlockType, BlockStyle } from '@/lib/types'
import { useUndoRedo } from '@/lib/useUndoRedo'
import BlockList from './BlockList'
import AddBlockButton from './AddBlockButton'

interface PageEditorProps {
  pageId: string
}

export default function PageEditor({ pageId }: PageEditorProps) {
  const [pageMeta, setPageMeta] = useState<{ id: string; createdAt: string; updatedAt: string } | null>(null)
  const { present, revision, canUndo, canRedo, init, pushState, undo, redo } = useUndoRedo()
  const titleRef = useRef<HTMLDivElement>(null)
  const prevRevisionRef = useRef(revision)

  // Load page data
  useEffect(() => {
    fetch(`/api/pages/${pageId}`)
      .then((r) => r.json())
      .then((data: Page) => {
        setPageMeta({ id: data.id, createdAt: data.createdAt, updatedAt: data.updatedAt })
        init({ title: data.title, blocks: data.blocks })
        if (titleRef.current) {
          titleRef.current.textContent = data.title || ''
        }
      })
  }, [pageId, init])

  // Sync title DOM on undo/redo (revision change)
  useEffect(() => {
    if (prevRevisionRef.current !== revision && titleRef.current) {
      titleRef.current.textContent = present.title || ''
    }
    prevRevisionRef.current = revision
  }, [revision, present.title])

  // Sync server state on undo/redo
  useEffect(() => {
    if (!pageMeta) return
    // Skip the initial load revision
    if (revision === 0) return
    fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: present.title, blocks: present.blocks }),
    })
  }, [revision]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        // Blur any active contentEditable to flush pending edits
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        requestAnimationFrame(() => undo())
        return
      }

      if ((e.key === 'z' && e.shiftKey) || (e.key === 'y' && e.ctrlKey)) {
        e.preventDefault()
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        requestAnimationFrame(() => redo())
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const saveTitle = useCallback(async () => {
    if (!titleRef.current || !pageMeta) return
    const title = titleRef.current.textContent || 'Untitled'
    if (title === present.title) return
    pushState({ title, blocks: present.blocks })
    await fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
  }, [pageMeta, pageId, present, pushState])

  async function handleAddBlock(type: BlockType, style?: BlockStyle) {
    const res = await fetch(`/api/pages/${pageId}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, style }),
    })
    const block: Block = await res.json()
    pushState({ title: present.title, blocks: [...present.blocks, block] })
  }

  async function handleUpdateBlock(blockId: string, data: Partial<Block>) {
    const newBlocks = present.blocks.map((b) =>
      b.id === blockId ? { ...b, ...data } : b
    )
    pushState({ title: present.title, blocks: newBlocks })
    await fetch(`/api/pages/${pageId}/blocks/${blockId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async function handleDeleteBlock(blockId: string) {
    pushState({ title: present.title, blocks: present.blocks.filter((b) => b.id !== blockId) })
    await fetch(`/api/pages/${pageId}/blocks/${blockId}`, {
      method: 'DELETE',
    })
  }

  async function handleReorder(reorderedBlocks: Block[]) {
    pushState({ title: present.title, blocks: reorderedBlocks })
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

  if (!pageMeta) {
    return (
      <div className="flex-1 flex items-center justify-center text-notion-secondary">
        Loading...
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-[720px] mx-auto px-16 py-12 relative">
        {/* Undo/Redo buttons */}
        <div className="absolute top-3 right-4 flex items-center gap-1">
          <button
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
              requestAnimationFrame(() => undo())
            }}
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-notion-hover text-notion-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo (Cmd+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h7a3 3 0 0 1 0 6H9" />
              <path d="M6 4L3 7l3 3" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
              requestAnimationFrame(() => redo())
            }}
            disabled={!canRedo}
            className="p-1.5 rounded hover:bg-notion-hover text-notion-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo (Cmd+Shift+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 7H6a3 3 0 0 0 0 6h1" />
              <path d="M10 4l3 3-3 3" />
            </svg>
          </button>
        </div>

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
          blocks={present.blocks}
          pageId={pageId}
          revision={revision}
          onReorder={handleReorder}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
        />
        <AddBlockButton onAdd={handleAddBlock} />
      </div>
    </main>
  )
}
