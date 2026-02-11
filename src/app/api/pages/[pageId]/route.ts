import { NextRequest, NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params
  const db = await readDb()
  const page = db.pages.find((p) => p.id === pageId)
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(page)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params
  const { title, blocks } = await req.json()
  const db = await readDb()
  const page = db.pages.find((p) => p.id === pageId)
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (title !== undefined) page.title = title
  if (blocks !== undefined) page.blocks = blocks
  page.updatedAt = new Date().toISOString()
  await writeDb(db)
  return NextResponse.json(page)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params
  const db = await readDb()
  const idx = db.pages.findIndex((p) => p.id === pageId)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  db.pages.splice(idx, 1)
  await writeDb(db)
  return NextResponse.json({ success: true })
}
