"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FilePlus2,
  FileText,
  FolderClock,
  Home,
  Layers3,
  LogOut,
  Settings,
  Shield,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

function isIncompletePoliceCase(caseData: any) {
  const sectionA = caseData?.policeSections?.sectionA ?? {}
  const hasCheckpoint =
    Number(sectionA?.lastCheckpointStepIndex ?? -1) >= 0 ||
    Number(sectionA?.checkpointLockedThrough ?? -1) >= 0
  const submittedToInvestigation = Boolean(sectionA?.submittedToInvestigationAt)
  return caseData?.status === "draft_police" || (hasCheckpoint && !submittedToInvestigation)
}

function mergeCaseRecords(serverCase: any, localCase: any) {
  if (!serverCase) return localCase
  if (!localCase) return serverCase

  const serverSectionA = serverCase?.policeSections?.sectionA ?? {}
  const localSectionA = localCase?.policeSections?.sectionA ?? {}

  return {
    ...serverCase,
    ...localCase,
    status: localCase?.status || serverCase?.status,
    updatedAt: localCase?.updatedAt || serverCase?.updatedAt,
    policeSections: {
      ...(serverCase?.policeSections ?? {}),
      ...(localCase?.policeSections ?? {}),
      sectionA: {
        ...serverSectionA,
        ...localSectionA,
      },
    },
    chainAnchor: serverCase?.chainAnchor || localCase?.chainAnchor,
  }
}

function CompactMetric({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  hint: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-[linear-gradient(135deg,rgba(18,29,56,0.5),rgba(11,20,40,0.5))] p-2.5 shadow-[0_16px_34px_rgba(3,8,20,0.22)] backdrop-blur-[3px]">
      <div className="flex items-center justify-between gap-3">
        <div className={`grid h-8 w-8 place-items-center rounded-[0.8rem] ${accent}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/48">{label}</div>
          <div className="mt-1 text-xl font-semibold text-white">{value}</div>
        </div>
      </div>
      <div className="mt-2 border-t border-white/8 pt-2 text-[10px] leading-4 text-white/56">{hint}</div>
    </div>
  )
}

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  onClick?: () => void
}

export default function PoliceDashboard() {
  const router = useRouter()
  const { currentUser, setCases, getAllCases, logout } = useStore()

  React.useEffect(() => {
    if (!currentUser) return

    let cancelled = false

    const syncCases = async () => {
      try {
        const response = await fetch("/api/cases", { credentials: "include" })
        const data = await response.json().catch(() => null)
        if (!response.ok || !data?.ok || !Array.isArray(data?.cases) || cancelled) {
          return
        }

        const localCases = useStore.getState().cases
        const mergedById = new Map<string, any>()

        for (const serverItem of data.cases) {
          mergedById.set(serverItem.caseId, serverItem)
        }

        for (const localItem of localCases) {
          const existing = mergedById.get(localItem.caseId)
          if (existing) {
            mergedById.set(localItem.caseId, mergeCaseRecords(existing, localItem))
            continue
          }

          if (isIncompletePoliceCase(localItem)) {
            mergedById.set(localItem.caseId, localItem)
          }
        }

        setCases(Array.from(mergedById.values()))
      } catch {
        // Keep the current local view if server sync fails.
      }
    }

    syncCases()

    return () => {
      cancelled = true
    }
  }, [currentUser, setCases])

  const allCases = getAllCases()
  const myCases = allCases.filter((c) => c.policeOfficerId === currentUser?.id)

  const pendingCases = myCases.filter((c) => c.status === "pending_commissioner")
  const approvedCases = myCases.filter(
    (c) => c.status === "approved" || c.status === "assigned_to_court" || c.status === "assigned_to_judge" || c.status === "in_progress"
  )
  const rejectedCases = myCases.filter((c) => c.status === "rejected")
  const completedCases = myCases.filter((c) => c.status === "completed")
  const draftCases = myCases.filter(isIncompletePoliceCase)
  const currentUserFirstName = currentUser?.name?.split(" ")[0] || "Officer"
  const userInitials = String(currentUser?.name || "PO")
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const navItems: NavItem[] = [
    { label: "Home", icon: Home, active: true, onClick: () => router.push("/police/dashboard") },
    { label: "New Case", icon: FilePlus2, onClick: () => router.push("/police/new-case") },
    { label: "Cases", icon: FileText, onClick: () => router.push("/police/cases") },
    { label: "Insights", icon: Layers3, onClick: () => router.push("/police/insights") },
  ]

  return (
    <DashboardLayout allowedRoles={["police_officer"]} title="Police Officer Dashboard" hideWorkspaceShell>
      <div
        className="rounded-[1.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,25,49,0.5),rgba(9,16,31,0.5))] bg-cover bg-center p-2 shadow-[0_18px_50px_rgba(6,12,28,0.28)]"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(7, 14, 29, 0.45), rgba(7, 14, 29, 0.45)), url('/360_F_551796436_NpkdXb00iWClTkqFpRW8Yudnh3VnX812.jpg')" }}
      >
        <div className="grid gap-3 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start">
          <aside className="flex flex-col items-center rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,22,43,0.5),rgba(8,14,29,0.5))] px-2 py-3 backdrop-blur-[4px] lg:sticky lg:top-6">
            <div className="mb-3 w-full">
              <div className="overflow-hidden rounded-[1rem] border border-white/10 bg-white/10 p-1.5 shadow-[0_10px_24px_rgba(4,10,28,0.2)]">
                <img
                  src="/images.jpg"
                  alt="Police logo"
                  className="h-14 w-full rounded-[0.85rem] object-cover"
                />
              </div>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={`flex h-[58px] w-full flex-col items-center justify-center gap-1.5 rounded-[0.95rem] border px-1 text-center transition hover:brightness-110 ${
                      item.active
                        ? "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.4),rgba(91,140,255,0.35))] text-cyan-100 shadow-[0_12px_28px_rgba(84,199,236,0.14)]"
                        : "border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.5),rgba(10,18,39,0.5))] text-white/84"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span className="text-[10px] leading-3 font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-auto w-full space-y-2 pt-4">
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="flex h-[52px] w-full flex-col items-center justify-center gap-1 rounded-[0.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.5),rgba(10,18,39,0.5))] px-1 text-center text-white/84 transition hover:brightness-110"
              >
                <Settings className="h-4 w-4" />
                <span className="text-[10px] leading-3 font-medium">Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  logout?.()
                  router.replace("/")
                }}
                className="flex h-[52px] w-full flex-col items-center justify-center gap-1 rounded-[0.85rem] border border-fuchsia-200/18 bg-[linear-gradient(135deg,rgba(111,109,255,0.35),rgba(203,93,240,0.3))] px-1 text-center text-white transition hover:brightness-110"
              >
                <LogOut className="h-4 w-4" />
                <div className="text-[10px] leading-3 font-medium">Logout</div>
              </button>
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <section className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(22,34,66,0.5),rgba(14,22,43,0.5))] shadow-[0_18px_50px_rgba(6,12,28,0.28)] backdrop-blur-[4px]">
              <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.14]">
                <Shield className="h-64 w-64 text-cyan-100" strokeWidth={1.15} />
              </div>
              <div className="pointer-events-none absolute -left-8 bottom-0 opacity-[0.05]">
                <Shield className="h-36 w-36 text-white" strokeWidth={1} />
              </div>
              <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] text-xs font-semibold text-white shadow-[0_10px_24px_rgba(84,199,236,0.22)]">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Police Command Deck</div>
                      <div className="mt-0.5 text-base font-semibold text-white">Police Officer Dashboard</div>
                      <div className="mt-0.5 text-xs text-cyan-100/60">Welcome back, {currentUserFirstName}.</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CompactMetric label="Total Cases" value={myCases.length} hint="All filed matters under this officer." icon={FileText} accent="bg-[linear-gradient(135deg,#4f8df7,#5ac8fa)]" />
              <CompactMetric label="Draft Queue" value={draftCases.length} hint="Saved and ready to resume." icon={FolderClock} accent="bg-[linear-gradient(135deg,#cb5df0,#7d6dff)]" />
              <CompactMetric label="Pending Review" value={pendingCases.length} hint="Waiting for commissioner decision." icon={Clock3} accent="bg-[linear-gradient(135deg,#ff8b5b,#ff5d8f)]" />
              <CompactMetric label="Rejected" value={rejectedCases.length} hint="Needs correction or closure." icon={AlertTriangle} accent="bg-[linear-gradient(135deg,#ff7a59,#d94d57)]" />
            </div>

            <div className="grid gap-2.5 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.5),rgba(10,18,39,0.5))] shadow-[0_16px_44px_rgba(4,10,28,0.26)] backdrop-blur-[4px]">
                <CardContent className="p-2.5">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.16em] text-cyan-200/68">Officer Overview</div>
                    <div className="mt-1 text-sm font-semibold text-white">Daily case posture</div>
                  </div>

                  <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-[0.8rem] border border-white/8 bg-white/5 px-2 py-2">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">Open workload</div>
                      <div className="mt-1 text-base font-semibold text-white">{draftCases.length + pendingCases.length + rejectedCases.length}</div>
                    </div>
                    <div className="rounded-[0.8rem] border border-white/8 bg-white/5 px-2 py-2">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">Progressed</div>
                      <div className="mt-1 text-base font-semibold text-white">{approvedCases.length + completedCases.length}</div>
                    </div>
                    <div className="rounded-[0.8rem] border border-white/8 bg-white/5 px-2 py-2">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">Resolved</div>
                      <div className="mt-1 text-base font-semibold text-white">{completedCases.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
