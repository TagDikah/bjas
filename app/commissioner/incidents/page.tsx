"use client"

import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChartPie,
  ShieldAlert,
  Siren,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

type AppCase = {
  caseId: string
  caseNumber?: string
  charge?: string
  parties?: string
  district?: string
  status: string
  policeSections?: {
    sectionA?: {
      allegedCrime?: string
      whereCommitted?: string
      whereCommittedSpecify?: string
      extentOfInjury?: string
      firearmUsed?: string
      weaponUsed?: string
      drinkRelated?: string
      drugRelated?: string
    }
  }
}

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function displayValue(value: unknown) {
  if (value === null || value === undefined) return "N/A"
  const text = String(value).trim()
  return text.length > 0 ? text : "N/A"
}

function chartTooltip() {
  return {
    contentStyle: {
      background: "rgba(16,27,52,0.96)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "14px",
      color: "#fff",
    },
  }
}

function MetricDial({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  const bounded = Math.max(0, Math.min(100, value))
  return (
    <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">{label}</div>
        <Icon className="h-4 w-4 text-white/68" />
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <div className="text-xl font-semibold text-white">{value}</div>
        <div
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-[11px] font-semibold text-white"
          style={{ background: `conic-gradient(${accent} ${bounded}%, rgba(255,255,255,0.08) ${bounded}% 100%)` }}
        >
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(15,23,42,0.95)]">
            {bounded}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-[0.95rem] border border-white/8 bg-white/5 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 text-sm font-medium text-white">{displayValue(value)}</div>
    </div>
  )
}

export default function CommissionerIncidentDashboardPage() {
  const { getAllCases } = useStore()
  const cases = (getAllCases() ?? []) as AppCase[]

  const commissionerRelevant = cases.filter(
    (caseData) =>
      caseData.status === "pending_commissioner" ||
      caseData.status === "commissioner_clarification" ||
      caseData.status === "submitted_to_dpp" ||
      caseData.status === "rejected"
  )

  const firearmCases = commissionerRelevant.filter(
    (caseData) => caseData.policeSections?.sectionA?.firearmUsed && caseData.policeSections?.sectionA?.firearmUsed !== "no"
  )
  const weaponCases = commissionerRelevant.filter(
    (caseData) => caseData.policeSections?.sectionA?.weaponUsed && caseData.policeSections?.sectionA?.weaponUsed !== "no"
  )
  const injuryCases = commissionerRelevant.filter((caseData) => {
    const injury = caseData.policeSections?.sectionA?.extentOfInjury
    return injury && injury !== "none" && injury !== "unknown"
  })
  const substanceLinked = commissionerRelevant.filter((caseData) => {
    const sectionA = caseData.policeSections?.sectionA
    return (
      (sectionA?.drinkRelated && sectionA.drinkRelated !== "not_involved" && sectionA.drinkRelated !== "not_known") ||
      (sectionA?.drugRelated && sectionA.drugRelated !== "not_involved" && sectionA.drugRelated !== "not_known")
    )
  })

  const pendingCount = commissionerRelevant.filter((caseData) => caseData.status === "pending_commissioner").length
  const clarificationCount = commissionerRelevant.filter((caseData) => caseData.status === "commissioner_clarification").length
  const forwardedCount = commissionerRelevant.filter((caseData) => caseData.status === "submitted_to_dpp").length
  const rejectedCount = commissionerRelevant.filter((caseData) => caseData.status === "rejected").length

  const byCharge = commissionerRelevant.reduce<Record<string, number>>((acc, caseData) => {
    const key = caseData.charge || caseData.policeSections?.sectionA?.allegedCrime || "UNKNOWN"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const byDistrict = commissionerRelevant.reduce<Record<string, number>>((acc, caseData) => {
    const key =
      caseData.policeSections?.sectionA?.whereCommittedSpecify ||
      caseData.policeSections?.sectionA?.whereCommitted ||
      caseData.district ||
      "Unknown"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const topCharges = Object.entries(byCharge)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topLocations = Object.entries(byDistrict)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const statusMixData = [
    { name: "Pending", value: pendingCount, fill: "#2fd4ff" },
    { name: "Clarify", value: clarificationCount, fill: "#ff7a9f" },
    { name: "Forwarded", value: forwardedCount, fill: "#f7c948" },
    { name: "Rejected", value: rejectedCount, fill: "#9b7bff" },
  ]

  const riskSignalData = [
    { name: "Firearm", value: firearmCases.length, fill: "#ff7a59" },
    { name: "Weapon", value: weaponCases.length, fill: "#9b7bff" },
    { name: "Injury", value: injuryCases.length, fill: "#ff7a9f" },
    { name: "Substance", value: substanceLinked.length, fill: "#f7c948" },
  ]

  const chargeBarData = topCharges.map(([label, value], index) => ({
    name: label.length > 12 ? `${label.slice(0, 12)}...` : label,
    value,
    fill: ["#2fd4ff", "#ff7a9f", "#f7c948", "#9b7bff", "#5a8cff"][index % 5],
  }))

  const locationBarData = topLocations.map(([label, value], index) => ({
    name: label.length > 12 ? `${label.slice(0, 12)}...` : label,
    value,
    fill: ["#5a8cff", "#2fd4ff", "#ff7a9f", "#9b7bff", "#f7c948"][index % 5],
  }))

  const radarData = [
    { subject: "Queue", value: commissionerRelevant.length },
    { subject: "Firearm", value: firearmCases.length },
    { subject: "Weapon", value: weaponCases.length },
    { subject: "Injury", value: injuryCases.length },
    { subject: "Substance", value: substanceLinked.length },
    { subject: "Rejected", value: rejectedCount },
  ]

  const riskHealth =
    commissionerRelevant.length === 0
      ? 0
      : Math.round(((firearmCases.length + weaponCases.length + injuryCases.length + substanceLinked.length) / (commissionerRelevant.length * 4)) * 100)

  return (
    <DashboardLayout allowedRoles={["police_commissioner"]} title="Incident Dashboard">
      <div className="space-y-5">
        <section className={panelClass("p-4 lg:p-5")}>
      <div className="grid gap-3 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] shadow-[0_10px_24px_rgba(84,199,236,0.24)]">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Commissioner Incident Analytics</div>
                  <div className="mt-1 text-base font-semibold text-white">Pure analytics view of commissioner-stage incident signals.</div>
                  <div className="text-xs text-white/52">Counts, risk mix, charge distribution, and location patterns only.</div>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <MetricDial label="Incident Queue" value={commissionerRelevant.length} icon={Activity} accent="#2fd4ff" />
                <MetricDial label="Weapon Risk" value={firearmCases.length + weaponCases.length} icon={ShieldAlert} accent="#ff7a59" />
                <MetricDial label="Injury / Substance" value={injuryCases.length + substanceLinked.length} icon={AlertTriangle} accent="#ff7a9f" />
                <MetricDial label="Risk Health" value={riskHealth} icon={ChartPie} accent="#9b7bff" />
              </div>
            </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">Primary Signals</div>
                  <div className="mt-3 grid gap-2">
                  {[
                    { label: "Firearm Linked", value: firearmCases.length, color: "#ff7a59" },
                    { label: "Weapon Linked", value: weaponCases.length, color: "#9b7bff" },
                    { label: "Recorded Injuries", value: injuryCases.length, color: "#ff7a9f" },
                    { label: "Drink / Drug Linked", value: substanceLinked.length, color: "#f7c948" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-[0.85rem] border border-white/8 bg-white/5 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm text-white/70">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

                <div className="rounded-[1rem] border border-white/8 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">Status Snapshot</div>
                  <div className="mt-3 grid gap-2">
                  {statusMixData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-[0.85rem] border border-white/8 bg-white/5 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                        <span className="text-sm text-white/70">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 xl:grid-cols-3">
          <Card className={panelClass()}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-white">Risk Signal Distribution</div>
                <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70">Bars</div>
              </div>
              <div className="mt-1 text-xs text-white/55">Visual comparison of the key incident risk indicators under commissioner review.</div>
              <div className="mt-3 rounded-[0.95rem] border border-white/8 bg-white/5 p-2 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskSignalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.64)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip {...chartTooltip()} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {riskSignalData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass()}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-white">Workflow Status Mix</div>
                <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70">Pie</div>
              </div>
              <div className="mt-1 text-xs text-white/55">Split of commissioner-stage packets by current workflow state.</div>
              <div className="mt-3 rounded-[0.95rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-2 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusMixData} dataKey="value" innerRadius={32} outerRadius={58} paddingAngle={4}>
                      {statusMixData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltip()} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid gap-1">
                {statusMixData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] text-white/62">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass()}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-white">Charge Frequency</div>
                <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70">Ranked</div>
              </div>
              <div className="mt-1 text-xs text-white/55">Most common charges currently present in commissioner-stage incident review.</div>
              <div className="mt-3 rounded-[0.95rem] border border-white/8 bg-white/5 p-2 h-44">
                {topCharges.length === 0 ? (
                  <div className="grid h-full place-items-center rounded-[0.9rem] text-sm text-white/55">
                    No charge data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chargeBarData} layout="vertical" margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.64)", fontSize: 10 }} width={78} />
                      <Tooltip {...chartTooltip()} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {chargeBarData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-3 xl:grid-cols-3">
          <Card className={panelClass()}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-white">Location Pattern</div>
                <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70">Places</div>
              </div>
              <div className="mt-1 text-xs text-white/55">Geographic concentration of commissioner-stage incident packets.</div>
              <div className="mt-3 rounded-[0.95rem] border border-white/8 bg-white/5 p-2 h-44">
                {topLocations.length === 0 ? (
                  <div className="grid h-full place-items-center rounded-[0.9rem] text-sm text-white/55">
                    No location data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationBarData} layout="vertical" margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.64)", fontSize: 10 }} width={78} />
                      <Tooltip {...chartTooltip()} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {locationBarData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass()}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-white">Incident Pressure Radar</div>
                <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70">Radar</div>
              </div>
              <div className="mt-1 text-xs text-white/55">Multi-signal comparison of queue size, risk factors, and rejected volume.</div>
              <div className="mt-3 rounded-[0.95rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-2 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.14)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.62)", fontSize: 9 }} />
                    <Radar dataKey="value" stroke="#ff7a9f" fill="#2fd4ff" fillOpacity={0.35} strokeWidth={2.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={panelClass()}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-white">Analytics Summary</div>
                <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70">Tiles</div>
              </div>
              <div className="mt-1 text-xs text-white/55">Pure aggregated incident analytics with no workflow controls on this screen.</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Queue", value: commissionerRelevant.length, accent: "#2fd4ff" },
                  { label: "Charge", value: topCharges[0]?.[0] || "UNKNOWN", accent: "#ff7a9f" },
                  { label: "Location", value: topLocations[0]?.[0] || "Unknown", accent: "#5a8cff" },
                  { label: "Rejected", value: rejectedCount, accent: "#9b7bff" },
                  { label: "Pending", value: pendingCount, accent: "#f7c948" },
                  { label: "Clarify", value: clarificationCount, accent: "#ff7a59" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[0.85rem] border border-white/8 bg-white/5 px-2 py-2.5 text-center">
                    <div
                      className="mx-auto grid h-8 w-8 place-items-center rounded-full border border-white/10 text-[10px] font-semibold text-white"
                      style={{ background: `conic-gradient(${item.accent} 78%, rgba(255,255,255,0.08) 78% 100%)` }}
                    >
                      <div className="grid h-5.5 w-5.5 place-items-center rounded-full bg-[rgba(15,23,42,0.95)]" />
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/48">{item.label}</div>
                    <div className="mt-1 line-clamp-1 text-xs font-semibold text-white">{displayValue(item.value)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
