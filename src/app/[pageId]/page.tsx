import Sidebar from '@/components/Sidebar'
import PageEditor from '@/components/PageEditor'

export default async function PageRoute({
  params,
}: {
  params: Promise<{ pageId: string }>
}) {
  const { pageId } = await params
  return (
    <>
      <Sidebar />
      <PageEditor pageId={pageId} />
    </>
  )
}
