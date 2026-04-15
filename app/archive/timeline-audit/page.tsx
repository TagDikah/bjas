"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

function text(value: unknown) {
  const normalized = String(value || "").trim()
  return normalized || "N/A"
}

function formatLabel(value: string) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function CaseTimelineAuditPage() {
  const store = useStore() as any
  const getAllCases = store.getAllCases ?? (() => [])
  const getCaseActivities = store.getCaseActivities ?? (() => [])

  const cases = useMemo(() => getAllCases(), [getAllCases])
  const [selectedCaseId, setSelectedCaseId] = useState("")

  const selectedCase = useMemo(
    () => cases.find((item: any) => item.caseId === selectedCaseId) || null,
    [cases, selectedCaseId]
  )
  const activities = useMemo(
    () => (selectedCaseId ? getCaseActivities(selectedCaseId) : []),
    [getCaseActivities, selectedCaseId]
  )

  return (
    <DashboardLayout allowedRoles={["archive_officer", "admin"]} title="Case Timeline Audit">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Timeline Audit Viewer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Open a full append-only history for any case, including workflow changes, department actions, and later module submissions.
            </p>
            <div className="space-y-2">
              <Label>Case Record</Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case for timeline audit" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((item: any) => (
                    <SelectItem key={item.caseId} value={item.caseId}>
                      {text(item.caseNumber)} | {text(item.charge)} | {formatLabel(item.status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedCase ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>Case Summary</span>
                  <Badge variant="secondary">{formatLabel(selectedCase.status)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2 text-sm">
                <div><span className="text-muted-foreground">Case Number:</span> {text(selectedCase.caseNumber)}</div>
                <div><span className="text-muted-foreground">Case ID:</span> {text(selectedCase.caseId)}</div>
                <div><span className="text-muted-foreground">Charge:</span> {text(selectedCase.charge)}</div>
                <div><span className="text-muted-foreground">District:</span> {text(selectedCase.district)}</div>
                <div><span className="text-muted-foreground">Current Status:</span> {formatLabel(selectedCase.status)}</div>
                <div><span className="text-muted-foreground">Updated:</span> {text(selectedCase.updatedAt)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                    No audit activities have been recorded for this case yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity: any, index: number) => (
                      <div key={activity.id || `${activity.caseId}-${index}`} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-foreground">{formatLabel(activity.type)}</div>
                          <Badge variant="outline">{text(activity.createdAt)}</Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{text(activity.actorName)}</span> ({text(activity.actorRole)})
                        </div>
                        <div className="mt-2 text-sm text-foreground">{text(activity.message)}</div>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 ? (
                          <div className="mt-3 grid gap-2 md:grid-cols-2 text-sm">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={`${activity.id}-${key}`}>
                                <span className="text-muted-foreground">{formatLabel(key)}:</span> {text(value)}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Select a case to open the append-only timeline audit view.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
