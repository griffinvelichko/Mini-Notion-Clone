import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { Database } from './types'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

let lock: Promise<void> = Promise.resolve()

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  let resolve: (v: T) => void
  let reject: (e: unknown) => void
  const result = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  lock = lock.then(() => fn().then(resolve!, reject!)).catch(() => {})
  return result
}

export async function readDb(): Promise<Database> {
  return withLock(async () => {
    const raw = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(raw)
  })
}

export async function writeDb(db: Database): Promise<void> {
  return withLock(async () => {
    const tmp = path.join(os.tmpdir(), `db-${Date.now()}.json`)
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf-8')
    await fs.rename(tmp, DB_PATH)
  })
}
