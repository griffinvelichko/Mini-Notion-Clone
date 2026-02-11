'use client'

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Block } from '@/lib/types'
import BlockWrapper from './BlockWrapper'

interface BlockListProps {
  blocks: Block[]
  pageId: string
  revision: number
  onReorder: (blocks: Block[]) => void
  onUpdateBlock: (blockId: string, data: Partial<Block>) => void
  onDeleteBlock: (blockId: string) => void
}

export default function BlockList({
  blocks,
  pageId,
  revision,
  onReorder,
  onUpdateBlock,
  onDeleteBlock,
}: BlockListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)
    const reordered = arrayMove(blocks, oldIndex, newIndex)
    onReorder(reordered)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {blocks.map((block) => (
          <BlockWrapper
            key={block.id}
            block={block}
            pageId={pageId}
            revision={revision}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
