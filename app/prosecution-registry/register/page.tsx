"use client"

import { useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { CaseCard } from "@/components/case-card"
import { useStore } from "@/lib/store"

function makeProsecutionRef(caseId: string) {
  const year = new Date().getFullYear()
  const short = caseId.replace(/[^A-Z0-9]/g, "").slice(-6)
  return `DPP/${year}/${short}`
}

export default function ProsecutionRegistryRegister() {
  const { currentUser, getAllCases, registerByProsecutionRegistry, submitToDpp } = useStore()

  const inbound = useMemo(
    () => getAllCases().filter((c) => c.status === "submitted_to_prosecution_registry"),
    [getAllCases]
  )

  return (
    <DashboardLayout allowedRoles={["prosecution_registry"]} title="Register Cases">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inbound police submissions</h2>
          <p className="text-muted-foreground">
            Register the case (metadata) and forward to the DPP. You cannot open the police docket here.
          </p>
        </div>

        {inbound.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {inbound.map((caseData) => (
              <div key={caseData.caseId} className="space-y-2">
                <CaseCard caseData={caseData} />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (!currentUser) return
                      const ref = makeProsecutionRef(caseData.caseId)
                      registerByProsecutionRegistry(caseData.caseId, currentUser, ref)
                      submitToDpp(caseData.caseId)
                    }}
                  >
                    Register & Send to DPP
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No inbound cases right now.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
