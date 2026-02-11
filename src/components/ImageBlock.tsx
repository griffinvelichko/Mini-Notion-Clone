'use client'

import { useState } from 'react'

interface ImageBlockProps {
  content: string
  width?: number
  height?: number
  onUpdate: (data: { content: string; width?: number; height?: number }) => void
}

export default function ImageBlock({ content, width, height, onUpdate }: ImageBlockProps) {
  const [editing, setEditing] = useState(!content)
  const [url, setUrl] = useState(content)
  const [w, setW] = useState(width || 720)
  const [h, setH] = useState(height || 480)

  function handleSave() {
    onUpdate({ content: url, width: w, height: h })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="border border-notion-border rounded-lg p-4 space-y-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL"
          className="w-full px-3 py-2 border border-notion-border rounded text-sm focus:outline-none focus:border-notion-blue"
        />
        <div className="flex gap-3">
          <input
            type="number"
            value={w}
            onChange={(e) => setW(Number(e.target.value))}
            placeholder="Width"
            className="w-24 px-3 py-2 border border-notion-border rounded text-sm focus:outline-none focus:border-notion-blue"
          />
          <span className="text-notion-secondary self-center">×</span>
          <input
            type="number"
            value={h}
            onChange={(e) => setH(Number(e.target.value))}
            placeholder="Height"
            className="w-24 px-3 py-2 border border-notion-border rounded text-sm focus:outline-none focus:border-notion-blue"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-notion-blue text-white rounded text-sm hover:opacity-90 transition-opacity"
          >
            Save
          </button>
          {content && (
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-notion-secondary rounded text-sm hover:bg-notion-hover transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="cursor-pointer rounded overflow-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={content}
        alt=""
        width={width || undefined}
        height={height || undefined}
        className="max-w-full rounded"
        style={{ maxHeight: 600 }}
      />
    </div>
  )
}
