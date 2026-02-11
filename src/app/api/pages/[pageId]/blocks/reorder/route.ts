import { NextRequest, NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params
  const { blockIds } = await req.json()
  const db = await readDb()
  const page = db.pages.find((p) => p.id === pageId)
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const blockMap = new Map(page.blocks.map((b) => [b.id, b]))
  page.blocks = blockIds.map((id: string) => blockMap.get(id)!).filter(Boolean)
  page.updatedAt = new Date().toISOString()
  await writeDb(db)
  return NextResponse.json({ success: true })
}
