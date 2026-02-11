import { NextRequest, NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { Block } from '@/lib/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params
  const body = await req.json()
  const db = await readDb()
  const page = db.pages.find((p) => p.id === pageId)
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const block: Block = {
    id: uuidv4(),
    type: body.type || 'text',
    content: body.content || '',
    ...(body.style && { style: body.style }),
    ...(body.width != null && { width: body.width }),
    ...(body.height != null && { height: body.height }),
  }

  page.blocks.push(block)
  page.updatedAt = new Date().toISOString()
  await writeDb(db)
  return NextResponse.json(block, { status: 201 })
}
