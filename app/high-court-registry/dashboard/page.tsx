"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { ArrowRight, Clock3, FileCheck2, Send } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  icon: ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Registry flow</div>
          <div className="mt-1 text-sm font-medium text-white">{title}</div>
        </div>
        <div
          className="grid h-10 w-10 place-items-center rounded-[0.95rem] border border-white/10"
          style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,255,255,0.08))` }}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold text-white">{value}</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/62">
          Live
        </div>
      </div>
      <div className="mt-2 text-xs text-white/55">{note}</div>
    </div>
  )
}

export default function HighCourtRegistryDashboard() {
  const { getAllCases } = useStore()
  const all = getAllCases()

  const receivedFromDpp = all.filter((c) => c.status === "filed_to_high_court")
  const registeredAndSent = all.filter((c) => c.status === "high_court_registry_intake")
  const assistantInProgress = all.filter((c) => c.status === "high_court_in_progress")

  const recommendation =
    receivedFromDpp.length > registeredAndSent.length
      ? "There are still cases waiting for registry registration. Complete intake registration first, then forward to assistant."
      : assistantInProgress.length > 0
        ? "Assistant workflow is active. Monitor hearing progress and completion updates."
        : "Registry flow is stable. Keep registration and forwarding time low."

  return (
    <DashboardLayout allowedRoles={["high_court_registry", "high_court_registry_assistant", "court_registry"]} title="High Court Registry Dashboard">
      <div className="space-y-5">
        <section className={panelClass("p-4 lg:p-5")}>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <MetricPanel title="Received from DPP" value={receivedFromDpp.length} note="Awaiting registration" icon={Clock3} accent="#5a8cff" />
              <MetricPanel title="Registered & Sent" value={registeredAndSent.length} note="Forwarded to assistant" icon={Send} accent="#2fd4ff" />
              <MetricPanel title="Assistant In Progress" value={assistantInProgress.length} note="Registry assistant action" icon={FileCheck2} accent="#ff7a9f" />
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Registry signal</div>
                    <div className="mt-1 text-base font-semibold text-white">{receivedFromDpp.length} filed packets in intake view</div>
                  </div>
                  <Badge className="border-0 bg-cyan-500/15 px-2.5 py-1 text-cyan-100">Live</Badge>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Received</div>
                    <div className="mt-1 text-xl font-semibold text-white">{receivedFromDpp.length}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Registered</div>
                    <div className="mt-1 text-xl font-semibold text-white">{registeredAndSent.length}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Assistant</div>
                    <div className="mt-1 text-xl font-semibold text-white">{assistantInProgress.length}</div>
                  </div>
                </div>

                <div className="mt-3 rounded-[0.9rem] border border-cyan-400/18 bg-cyan-400/8 px-3 py-2.5 text-sm text-cyan-50/92">
                  {recommendation}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="h-11 w-full bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95">
                  <Link href="/high-court-registry/intake">
                    Open Intake
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 w-full border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white">
                  <Link href="/high-court-registry/intake">View Registry Intake</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
