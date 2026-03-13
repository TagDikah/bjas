import { Suspense } from "react"
import CommissionerCasesClient from "./CommissionerCasesClient"

export default function CommissionerCasesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading cases...</div>}>
      <CommissionerCasesClient />
    </Suspense>
  )
}
