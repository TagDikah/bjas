"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function PoliceCaseDetailPage() {
  const router = useRouter()
  const params = useParams<{ caseId: string }>()
  const { currentUser, getAllCases } = useStore()

  const caseId = params?.caseId
  const caseData = getAllCases().find((c) => c.caseId === caseId)

  if (!caseData) {
    return (
      <DashboardLayout allowedRoles={["police_officer", "police_commissioner"]} title="Case not found">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-foreground font-medium">Case not found.</p>
          <p className="text-muted-foreground text-sm mt-1">
            The caseId in the URL does not match any case in the current store.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
            <Link href="/police/cases">
              <Button>Open My Cases</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const isOwner = caseData.policeOfficerId ? caseData.policeOfficerId === currentUser?.id : true

  return (
    <DashboardLayout allowedRoles={["police_officer", "police_commissioner"]} title={`Police Docket`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Link href="/police/cases">
            <Button variant="secondary">My Cases</Button>
          </Link>
        </div>

        {!isOwner ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-foreground font-medium">Access restricted</p>
            <p className="text-muted-foreground text-sm mt-1">
              This case is not assigned to your user in the current store.
            </p>
          </div>
        ) : (
          <CaseCard caseData={caseData} />
        )}
      </div>
    </DashboardLayout>
  )
}
