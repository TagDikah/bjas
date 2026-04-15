"use client"

import Link from "next/link"
import { ArrowRight, Building2, ClipboardCheck, FileStack, ShieldCheck, UserCheck } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function MetricPanel({
  title,
  value,
  note,
  icon: Icon,
  accent,
}: {
  title: string
  value: number
  note: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-2.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Correctional flow</div>
          <div className="mt-1 text-sm font-medium text-white">{title}</div>
        </div>
        <div
          className="grid h-8 w-8 place-items-center rounded-[0.8rem] border border-white/10"
          style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,255,255,0.08))` }}
        >
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-xl font-semibold text-white">{value}</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-white/62">
          Live
        </div>
      </div>
      <div className="mt-1.5 text-[10px] text-white/55">{note}</div>
    </div>
  )
}

export default function CorrectionalServicesDashboard() {
  const { currentUser, getAllCases } = useStore()
  const all = getAllCases()

  const intake = all.filter((c) => c.status === "transferred_to_correctional_services")
  const serving = all.filter((c) => c.status === "serving_sentence")
  const parole = all.filter((c) => c.status === "parole_review")
  const released = all.filter((c) => c.status === "released")
  const totalActive = intake.length + serving.length + parole.length
  const pressureNote =
    totalActive === 0
      ? "No active custody movement right now. New admissions and parole actions will appear here."
      : parole.length > 0
        ? "Parole review is active. Monitor recommendation quality and release readiness closely."
        : serving.length > intake.length
          ? "Sentence management is the current focus. Keep transfer, discipline, and release updates current."
          : "Custody intake is leading the queue. Prioritize admissions and sentence setup first."

  return (
    <DashboardLayout allowedRoles={["correctional_services", "correctional_admin"]} title="Correctional Services Dashboard">
      <div className="space-y-5">
        <section className={panelClass("p-3 lg:p-3.5")}>
          <div className="space-y-2.5">
            <div className="grid gap-2 xl:grid-cols-[1fr_280px] xl:items-center">
              <div className="rounded-[0.85rem] border border-white/8 bg-white/5 p-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Custody signal</div>
                  <Badge className="border-0 bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-100">Live</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-end gap-2.5">
                  <div className="text-lg font-semibold text-white">{totalActive}</div>
                  <div className="text-[11px] text-white/62">active custody matters</div>
                </div>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                  <div className="rounded-[0.7rem] border border-white/8 bg-white/5 px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Admissions</div>
                    <div className="mt-0.5 text-sm font-semibold text-white">{intake.length}</div>
                  </div>
                  <div className="rounded-[0.7rem] border border-white/8 bg-white/5 px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Serving</div>
                    <div className="mt-0.5 text-sm font-semibold text-white">{serving.length}</div>
                  </div>
                  <div className="rounded-[0.7rem] border border-white/8 bg-white/5 px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Parole</div>
                    <div className="mt-0.5 text-sm font-semibold text-white">{parole.length}</div>
                  </div>
                  <div className="rounded-[0.7rem] border border-cyan-400/18 bg-cyan-400/8 px-2 py-1.5 text-[10px] leading-4 text-cyan-50/92 sm:col-span-3 lg:col-span-1">
                    {pressureNote}
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:w-[280px] xl:grid-cols-1">
                <Button asChild className="h-9 w-full bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white text-sm shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95">
                  <Link href="/correctional-services/cases">
                    Open Custody Cases
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-9 w-full border-cyan-400/30 bg-cyan-400/10 text-sm text-cyan-100 hover:bg-cyan-400/18 hover:text-white">
                  <Link href="/correctional-services/cases?tab=admissions">Open Admissions</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-4">
              <MetricPanel title="New Admissions" value={intake.length} note="Awaiting custody intake" icon={Building2} accent="#5a8cff" />
              <MetricPanel title="Serving" value={serving.length} note="Active sentence management" icon={ShieldCheck} accent="#2fd4ff" />
              <MetricPanel title="Parole Review" value={parole.length} note="Awaiting review outcome" icon={ClipboardCheck} accent="#ff7a9f" />
              <MetricPanel title="Released" value={released.length} note="Completed release updates" icon={UserCheck} accent="#f7c948" />
            </div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <Card className={panelClass()}>
            <CardContent className="p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Correctional Workspaces</div>
              <div className="mt-1 text-lg font-semibold text-white">Open the new correctional forms from here</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Link
                  href="/correctional-services/intake"
                  className="rounded-[1rem] border border-cyan-200/30 bg-[linear-gradient(135deg,rgba(84,199,236,0.24),rgba(91,140,255,0.2))] px-4 py-4 text-white shadow-[0_14px_28px_rgba(6,12,28,0.22)] transition hover:scale-[1.01] hover:border-cyan-100/46 hover:no-underline"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[0.95rem] border border-white/10 bg-white/10">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-sm font-semibold">Open Intake Workspace</div>
                  <div className="mt-1 text-xs text-white/68">Admission, classification, medical, property, and biometrics.</div>
                </Link>

                <Link
                  href="/correctional-services/sentence-management"
                  className="rounded-[1rem] border border-fuchsia-200/30 bg-[linear-gradient(135deg,rgba(111,109,255,0.24),rgba(203,93,240,0.2))] px-4 py-4 text-white shadow-[0_14px_28px_rgba(6,12,28,0.22)] transition hover:scale-[1.01] hover:border-fuchsia-100/44 hover:no-underline"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[0.95rem] border border-white/10 bg-white/10">
                      <FileStack className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-sm font-semibold">Open Sentence Management</div>
                  <div className="mt-1 text-xs text-white/68">Behavior, incidents, rehabilitation, visitors, and sentence execution.</div>
                </Link>

                <Link
                  href="/correctional-services/parole-release"
                  className="rounded-[1rem] border border-amber-200/30 bg-[linear-gradient(135deg,rgba(251,191,36,0.22),rgba(245,158,11,0.18))] px-4 py-4 text-white shadow-[0_14px_28px_rgba(6,12,28,0.22)] transition hover:scale-[1.01] hover:border-amber-100/44 hover:no-underline"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[0.95rem] border border-white/10 bg-white/10">
                      <ClipboardCheck className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-sm font-semibold">Open Parole & Release</div>
                  <div className="mt-1 text-xs text-white/68">Parole eligibility, decision, release, and post-release monitoring.</div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass()}>
            <CardContent className="p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Sentence Flow</div>
              <div className="mt-1 text-lg font-semibold text-white">Custody movement snapshot</div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Awaiting intake</div>
                  <div className="mt-1 text-xl font-semibold text-white">{intake.length}</div>
                </div>
                <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Serving sentence</div>
                  <div className="mt-1 text-xl font-semibold text-white">{serving.length}</div>
                </div>
                <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Parole review</div>
                  <div className="mt-1 text-xl font-semibold text-white">{parole.length}</div>
                </div>
                <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/42">Released</div>
                  <div className="mt-1 text-xl font-semibold text-white">{released.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

        </section>
      </div>
    </DashboardLayout>
  )
}
