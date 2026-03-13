import { Suspense } from "react"
import InvestigationCasesClient from "./InvestigationCasesClient"

export default function InvestigationCasesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading cases...</div>}>
      <InvestigationCasesClient />
    </Suspense>
  )
}
