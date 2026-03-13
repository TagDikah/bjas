import { redirect } from "next/navigation"

export default async function Page({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  redirect(`/investigation/cases?caseId=${caseId}`)
}