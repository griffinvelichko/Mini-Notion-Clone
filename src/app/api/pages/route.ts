import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  const db = await readDb()
  const pages = db.pages.map(({ id, title }) => ({ id, title }))
  return NextResponse.json(pages)
}

export async function POST() {
  const db = await readDb()
  const now = new Date().toISOString()
  const page = {
    id: uuidv4(),
    title: 'Untitled',
    blocks: [],
    createdAt: now,
    updatedAt: now,
  }
  db.pages.push(page)
  await writeDb(db)
  return NextResponse.json(page, { status: 201 })
}
