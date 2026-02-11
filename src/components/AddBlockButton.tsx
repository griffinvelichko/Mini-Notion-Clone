'use client'

import { useState } from 'react'
import { BlockType, BlockStyle } from '@/lib/types'

interface AddBlockButtonProps {
  onAdd: (type: BlockType, style?: BlockStyle) => void
}

const options: { label: string; type: BlockType; style?: BlockStyle }[] = [
  { label: 'Text', type: 'text', style: 'paragraph' },
  { label: 'Heading 1', type: 'text', style: 'h1' },
  { label: 'Heading 2', type: 'text', style: 'h2' },
  { label: 'Heading 3', type: 'text', style: 'h3' },
  { label: 'Image', type: 'image' },
]

export default function AddBlockButton({ onAdd }: AddBlockButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative py-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-notion-secondary hover:text-notion-text hover:bg-notion-hover rounded px-2 py-1.5 transition-colors duration-100"
      >
        <span className="text-lg leading-none">+</span>
        Add a block
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-notion-border rounded-lg shadow-lg py-1 z-10 w-44">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                onAdd(opt.type, opt.style)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-notion-hover transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
