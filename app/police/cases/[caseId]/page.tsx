import { redirect } from "next/navigation"
export default function PoliceCasesAlias({ params }: { params: { caseId: string } }) {
  redirect(`/police/case/${params.caseId}`)
}
