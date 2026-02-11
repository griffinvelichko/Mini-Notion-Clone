import { NextRequest, NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string; blockId: string }> }
) {
  const { pageId, blockId } = await params
  const body = await req.json()
  const db = await readDb()
  const page = db.pages.find((p) => p.id === pageId)
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const block = page.blocks.find((b) => b.id === blockId)
  if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 })

  if (body.content !== undefined) block.content = body.content
  if (body.style !== undefined) block.style = body.style
  if (body.width !== undefined) block.width = body.width
  if (body.height !== undefined) block.height = body.height

  page.updatedAt = new Date().toISOString()
  await writeDb(db)
  return NextResponse.json(block)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string; blockId: string }> }
) {
  const { pageId, blockId } = await params
  const db = await readDb()
  const page = db.pages.find((p) => p.id === pageId)
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const idx = page.blocks.findIndex((b) => b.id === blockId)
  if (idx === -1) return NextResponse.json({ error: 'Block not found' }, { status: 404 })

  page.blocks.splice(idx, 1)
  page.updatedAt = new Date().toISOString()
  await writeDb(db)
  return NextResponse.json({ success: true })
}
