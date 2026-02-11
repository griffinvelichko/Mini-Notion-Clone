import { redirect } from 'next/navigation'
import { readDb } from '@/lib/db'
import Sidebar from '@/components/Sidebar'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const db = await readDb()
  if (db.pages.length > 0) {
    redirect(`/${db.pages[0].id}`)
  }
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-notion-secondary">
        <p>No pages yet. Create one from the sidebar.</p>
      </div>
    </>
  )
}
