"use client"

import Link from "next/link"
import { ArrowRight, Clock3, FileCheck2, Send } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

function panelClass(extra = "") {
  return `overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96),rgba(10,18,39,0.98))] shadow-[0_18px_38px_rgba(4,10,28,0.24)] ${extra}`.trim()
}

function displayText(value: unknown, fallback = "N/A") {
  const text = String(value || "").trim()
  return text || fallback
}

function dateText(value: unknown) {
  const raw = String(value || "").trim()
  if (!raw) return "N/A"
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleDateString()
}

function statusTone(status: string) {
  switch (status) {
    case "submitted_to_prosecution_registry":
      return "bg-[#5a8cff]/15 text-[#aecdff]"
    case "registered_by_prosecution_registry":
      return "bg-cyan-400/15 text-cyan-100"
    case "submitted_to_dpp":
      return "bg-[#ff7a9f]/15 text-[#ffd2df]"
    default:
      return "bg-white/10 text-white/80"
  }
}

export default function ProsecutionRegistryCases() {
  const { getAllCases } = useStore()
  const list = getAllCases().filter((c) =>
    [
      "submitted_to_prosecution_registry",
      "registered_by_prosecution_registry",
      "submitted_to_dpp",
    ].includes(c.status)
  )

  return (
    <DashboardLayout allowedRoles={["prosecution_registry"]} title="Prosecution Registry Cases">
      <div className="space-y-5">
        <section className={panelClass("p-4 lg:p-5")}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/68">Registry Cases</div>
              <div className="mt-1 text-lg font-semibold text-white">Inbound and registered packets</div>
              <div className="text-sm text-white/55">Review registry-visible files and open the registration workspace when you are ready to continue.</div>
            </div>
            <Button asChild className="h-11 bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white shadow-[0_12px_24px_rgba(84,199,236,0.18)] hover:opacity-95">
              <Link href="/prosecution-registry/register">
                Open Registration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {list.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((packet) => {
              const complainant =
                packet.complainantName ||
                packet.complainant?.fullName ||
                packet.registrationDraft?.complainant?.fullName ||
                packet.parties

              const crime =
                packet.allegedCrime ||
                packet.registrationDraft?.allegedCrime ||
                packet.charge

              const station =
                packet.policeStation ||
                packet.registrationDraft?.stationName ||
                packet.district

              return (
                <Card key={packet.caseId} className={panelClass()}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-white">{displayText(packet.caseNumber, "Protected case")}</div>
                        <div className="mt-1 text-sm text-white/68">{displayText(complainant, "Unknown complainant")}</div>
                      </div>
                      <Badge className={`border-0 ${statusTone(String(packet.status || ""))}`}>
                        {displayText(String(packet.status || "").replace(/_/g, " "), "pending")}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Crime</div>
                        <div className="mt-1 text-sm text-white">{displayText(crime, "Unknown")}</div>
                      </div>
                      <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Crime No</div>
                        <div className="mt-1 text-sm text-white">{displayText(packet.crimeNumber, "Not saved")}</div>
                      </div>
                      <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Origin</div>
                        <div className="mt-1 text-sm text-white">{displayText(station, "Unknown")}</div>
                      </div>
                      <div className="rounded-[0.9rem] border border-white/8 bg-white/5 p-3">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">Date</div>
                        <div className="mt-1 text-sm text-white">{dateText(packet.dateOpened || packet.createdAt)}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/55">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">Filed by: {displayText(packet.policeOfficerName, "N/A")}</span>
                      {packet.status === "submitted_to_prosecution_registry" ? (
                        <span className="rounded-full border border-[#5a8cff]/25 bg-[#5a8cff]/10 px-2.5 py-1 text-[#bfd4ff]">Awaiting registration</span>
                      ) : null}
                      {packet.status === "registered_by_prosecution_registry" ? (
                        <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-cyan-100">Registered locally</span>
                      ) : null}
                      {packet.status === "submitted_to_dpp" ? (
                        <span className="rounded-full border border-[#ff7a9f]/25 bg-[#ff7a9f]/10 px-2.5 py-1 text-[#ffd2df]">Forwarded to DPP</span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-white/55">
                        {packet.status === "submitted_to_dpp" ? (
                          <>
                            <Send className="h-4 w-4 text-cyan-200" />
                            <span>Forwarded registry packet</span>
                          </>
                        ) : (
                          <>
                            <Clock3 className="h-4 w-4 text-cyan-200" />
                            <span>Registry action pending</span>
                          </>
                        )}
                      </div>
                      <Button asChild size="sm" className="bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] !text-white hover:opacity-95">
                        <Link href="/prosecution-registry/register">
                          Open Packet
                          <FileCheck2 className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className={panelClass()}>
            <CardContent className="p-8 text-center text-sm text-white/58">
              No cases to show.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
