'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Block, BlockStyle } from '@/lib/types'
import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'

interface BlockWrapperProps {
  block: Block
  pageId: string
  revision: number
  onUpdateBlock: (blockId: string, data: Partial<Block>) => void
  onDeleteBlock: (blockId: string) => void
}

const styleOptions: { value: BlockStyle; label: string }[] = [
  { value: 'paragraph', label: 'Text' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
]

export default function BlockWrapper({
  block,
  revision,
  onUpdateBlock,
  onDeleteBlock,
}: BlockWrapperProps) {
  const [showStyleMenu, setShowStyleMenu] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative -ml-16 pl-16 py-[3px]"
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {block.type === 'text' && (
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="text-notion-secondary hover:bg-notion-hover rounded p-0.5 text-xs"
              title="Change style"
            >
              Aa
            </button>
            {showStyleMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-notion-border rounded-lg shadow-lg py-1 z-20 w-32">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onUpdateBlock(block.id, { style: opt.value })
                      setShowStyleMenu(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover transition-colors ${
                      block.style === opt.value ? 'text-notion-blue' : ''
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="text-notion-secondary hover:bg-notion-hover rounded p-0.5 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="5" cy="3" r="1.2" />
            <circle cx="9" cy="3" r="1.2" />
            <circle cx="5" cy="7" r="1.2" />
            <circle cx="9" cy="7" r="1.2" />
            <circle cx="5" cy="11" r="1.2" />
            <circle cx="9" cy="11" r="1.2" />
          </svg>
        </button>
        <button
          onClick={() => onDeleteBlock(block.id)}
          className="text-notion-secondary hover:text-red-500 hover:bg-notion-hover rounded p-0.5 text-xs"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="4" y1="4" x2="10" y2="10" />
            <line x1="10" y1="4" x2="4" y2="10" />
          </svg>
        </button>
      </div>

      {block.type === 'text' ? (
        <TextBlock
          key={`${block.id}-${block.style}-${revision}`}
          content={block.content}
          style={block.style || 'paragraph'}
          onUpdate={(content) => onUpdateBlock(block.id, { content })}
        />
      ) : (
        <ImageBlock
          key={`${block.id}-${revision}`}
          content={block.content}
          width={block.width}
          height={block.height}
          onUpdate={(data) => onUpdateBlock(block.id, data)}
        />
      )}
    </div>
  )
}
