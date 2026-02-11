import { promises as fs } from 'fs'
import path from 'path'
import { Database } from './types'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

export async function readDb(): Promise<Database> {
  const raw = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

export async function writeDb(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}
