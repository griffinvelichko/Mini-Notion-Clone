'use client'

import { useRef, useEffect, useCallback } from 'react'
import { BlockStyle } from '@/lib/types'

interface TextBlockProps {
  content: string
  style: BlockStyle
  onUpdate: (content: string) => void
}

const styleConfig: Record<BlockStyle, { className: string; placeholder: string }> = {
  h1: {
    className: 'text-[30px] font-bold leading-tight',
    placeholder: 'Heading 1',
  },
  h2: {
    className: 'text-[24px] font-semibold leading-tight',
    placeholder: 'Heading 2',
  },
  h3: {
    className: 'text-[20px] font-semibold leading-snug',
    placeholder: 'Heading 3',
  },
  paragraph: {
    className: 'text-[16px] leading-relaxed',
    placeholder: 'Type something...',
  },
}

export default function TextBlock({ content, style, onUpdate }: TextBlockProps) {
  const ref = useRef<HTMLDivElement>(null)
  const initialContent = useRef(content)

  useEffect(() => {
    if (ref.current && ref.current.textContent !== initialContent.current) {
      ref.current.textContent = initialContent.current
    }
  }, [])

  const handleBlur = useCallback(() => {
    if (ref.current) {
      const text = ref.current.textContent || ''
      if (text !== content) {
        onUpdate(text)
      }
    }
  }, [content, onUpdate])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }, [])

  const config = styleConfig[style] || styleConfig.paragraph

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={config.placeholder}
      onBlur={handleBlur}
      onPaste={handlePaste}
      className={`${config.className} cursor-text w-full break-words`}
    >
      {initialContent.current}
    </div>
  )
}
