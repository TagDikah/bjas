"use client"

import Link from "next/link"
import { Calendar, Clock, FileText } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

function safeDate(value: unknown) {
  const parsed = new Date(value as any)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatSessionDate(value: Date) {
  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function JudgeDashboardSessionsPage() {
  const { currentUser, getAllCases } = useStore()
  const allCases = getAllCases()

  const myCases = allCases.filter(
    (c) =>
      c?.court?.assignedJudgeId === currentUser?.id ||
      c?.courtRegistry?.assignedJudgeId === currentUser?.id
  )

  const sessions = myCases
    .flatMap((caseData) => {
      const dates = Array.isArray(caseData?.hearingDates) ? caseData.hearingDates : []
      const hearingDates = dates
        .map((value) => safeDate(value))
        .filter((value): value is Date => !!value)

      const latestAppearance = safeDate(caseData?.hearingRecord?.latestEntry?.appearanceDate)
      if (latestAppearance) hearingDates.push(latestAppearance)

      const uniqueDates = Array.from(new Set(hearingDates.map((date) => date.toISOString().slice(0, 10))))
        .map((value) => new Date(value))

      return uniqueDates.map((date) => ({
        caseId: caseData.caseId,
        caseNumber: String(caseData.caseNumber || "Unknown case"),
        district: String(caseData.district || "Unknown station"),
        charge: String(caseData.charge || "No charge recorded"),
        sessionDate: date,
        status: String(caseData.status || ""),
      }))
    })
    .sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime())

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const upcomingSessions = sessions.filter((session) => session.sessionDate.getTime() >= startOfToday.getTime())
  const completedSessions = sessions.filter((session) => session.sessionDate.getTime() < startOfToday.getTime())

  return (
    <DashboardLayout allowedRoles={["judge", "high_court_judge"]} title="Session List">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Sessions</div>
              <div className="mt-1 text-2xl font-semibold">{sessions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Upcoming</div>
              <div className="mt-1 text-2xl font-semibold">{upcomingSessions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Assigned Cases</div>
              <div className="mt-1 text-2xl font-semibold">{myCases.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Judge Sessions</CardTitle>
            <CardDescription>Session dates from your assigned court matters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={`${session.caseId}-${session.sessionDate.toISOString()}`} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold">{session.caseNumber}</div>
                      <div className="text-sm text-muted-foreground">{session.charge}</div>
                      <div className="text-sm text-muted-foreground">{session.district}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-white">
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        {formatSessionDate(session.sessionDate)}
                      </Badge>
                      <Badge variant="outline" className="text-white">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        {session.status.replace(/_/g, " ")}
                      </Badge>
                      <Link href={`/judge/cases/${encodeURIComponent(session.caseId)}`}>
                        <Button variant="outline" className="!text-white [&_svg]:!text-white">
                          Open Case
                          <FileText className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border p-6 text-center text-muted-foreground">
                No session dates are attached to your assigned judge cases yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Sessions</CardTitle>
            <CardDescription>Recorded hearing dates from your assigned matters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedSessions.length > 0 ? (
              completedSessions.slice(-8).reverse().map((session) => (
                <div key={`${session.caseId}-${session.sessionDate.toISOString()}`} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">{session.caseNumber}</div>
                    <div className="text-sm text-muted-foreground">{session.charge}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{formatSessionDate(session.sessionDate)}</div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border p-6 text-center text-muted-foreground">
                No past sessions are recorded for your assigned judge cases yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
