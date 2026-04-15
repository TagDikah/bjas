"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock3, FileText, Send } from "lucide-react"

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

export default function ProsecutionRegistryDashboard() {
  const { getAllCases } = useStore()
  const allCases = getAllCases()

  const inbound = allCases.filter((c) =>
    ["submitted_to_prosecution_registry", "submitted_to_dpp"].includes(String(c.status || ""))
  )
  const registered = allCases.filter(
    (c) => c.status === "registered_by_prosecution_registry" || c.status === "submitted_to_dpp"
  )
  const assigned = allCases.filter((c) => c.status === "assigned_to_prosecutor")
  const returned = allCases.filter((c) => c.status === "returned_to_police")

  const recommendation =
    inbound.length > registered.length
      ? "Inbound queue is higher than registration output. Prioritize case registration before forwarding."
      : registered.length > 0
        ? "Registry flow is moving. Continue forwarding complete packets into DPP assignment."
        : "Registry queue is quiet right now. New police submissions will appear here when they arrive."

  return (
    <DashboardLayout allowedRoles={["prosecution_registry"]} title="Prosecution Registry Dashboard">
      <div className="space-y-5">
        <section className={panelClass("p-4 lg:p-5")}>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <MetricPanel title="Inbound" value={inbound.length} note="Awaiting registration" icon={Clock3} accent="#5a8cff" />
              <MetricPanel title="Registered" value={registered.length} note="Forwarded or ready for DPP" icon={CheckCircle2} accent="#2fd4ff" />
              <MetricPanel title="Assigned" value={assigned.length} note="Moved to prosecutor queue" icon={Send} accent="#ff7a9f" />
              <MetricPanel title="Total Cases" value={allCases.length} note="In the system" icon={FileText} accent="#f7c948" />
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1rem] border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/46">Registry signal</div>
                    <div className="mt-1 text-base font-semibold text-white">{inbound.length} packets waiting for action</div>
                  </div>
                  <Badge className="border-0 bg-cyan-500/15 px-2.5 py-1 text-cyan-100">Live</Badge>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Inbound</div>
                    <div className="mt-1 text-xl font-semibold text-white">{inbound.length}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Registered</div>
                    <div className="mt-1 text-xl font-semibold text-white">{registered.length}</div>
                  </div>
                  <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/44">Returned</div>
                    <div className="mt-1 text-xl font-semibold text-white">{returned.length}</div>
                  </div>
                </div>

                <div className="mt-3 rounded-[0.9rem] border border-cyan-400/18 bg-cyan-400/8 px-3 py-2.5 text-sm text-cyan-50/92">
                  {recommendation}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="h-11 w-full bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95">
                  <Link href="/prosecution-registry/register">
                    Register Case
                    {inbound.length > 0 ? (
                      <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                        {inbound.length}
                      </span>
                    ) : null}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 w-full border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/18 hover:text-white">
                  <Link href="/prosecution-registry/cases">
                    Open Registry Cases
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
