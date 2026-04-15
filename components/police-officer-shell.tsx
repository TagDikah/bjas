"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ChevronUp, FilePlus2, FileText, FolderClock, Home, Layers3, LogOut, Settings } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useStore } from "@/lib/store"

type PoliceOfficerShellProps = {
  title: string
  children: ReactNode
  contentClassName?: string
}

export function PoliceOfficerShell({
  title,
  children,
  contentClassName = "space-y-5",
}: PoliceOfficerShellProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentUser = useStore((state: any) => state.currentUser) as { name?: string | null } | null
  const logout = useStore((state: any) => state.logout) as (() => void) | undefined
  const [showCasesMenu, setShowCasesMenu] = useState(false)
  const [showInsightsMenu, setShowInsightsMenu] = useState(false)
  const userInitials = String(currentUser?.name || "PO")
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const isCasesRoute = pathname.startsWith("/police/cases") || pathname.startsWith("/police/case/")
  const isInsightsRoute = pathname.startsWith("/police/insights")
  const isDraftsRoute = pathname.startsWith("/police/cases") && searchParams.get("resume") === "incomplete"
  const caseView = searchParams.get("view") === "recent" ? "recent" : "all"

  useEffect(() => {
    if (isCasesRoute) setShowCasesMenu(true)
  }, [isCasesRoute])

  useEffect(() => {
    if (isInsightsRoute) setShowInsightsMenu(true)
  }, [isInsightsRoute])

  const mainNavItems = [
    { label: "Home", icon: Home, href: "/police/dashboard", active: pathname === "/police/dashboard" },
    { label: "New Case", icon: FilePlus2, href: "/police/new-case", active: pathname.startsWith("/police/new-case") },
  ]

  const insightItems = [
    { key: "draft", label: "Draft Pressure" },
    { key: "flow", label: "Flow Health" },
    { key: "pipeline", label: "Active Pipeline" },
    { key: "risk", label: "Risk Watch" },
  ]

  return (
    <DashboardLayout allowedRoles={["police_officer"]} title={title} hideWorkspaceShell>
      <div className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,25,49,0.98),rgba(9,16,31,0.98))] p-2 shadow-[0_18px_50px_rgba(6,12,28,0.28)]">
        <div className="grid gap-3 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start">
          <aside className="flex flex-col items-center rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,22,43,0.98),rgba(8,14,29,0.98))] px-2 py-3 lg:sticky lg:top-6">
            <div className="mb-3 w-full">
              <div className="flex justify-center rounded-[1rem] border border-white/10 bg-white/6 p-2 shadow-[0_10px_24px_rgba(4,10,28,0.2)]">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#5a8cff,#54c7ec)] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(84,199,236,0.22)]">
                  {userInitials}
                </div>
              </div>
            </div>

            <div className="w-full space-y-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={`flex h-[58px] w-full flex-col items-center justify-center gap-1.5 rounded-[0.95rem] border px-1 text-center transition hover:brightness-110 ${
                      item.active
                        ? "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] text-cyan-100 shadow-[0_12px_28px_rgba(84,199,236,0.14)]"
                        : "border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] text-white/84"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span className="text-[10px] leading-3 font-medium">{item.label}</span>
                  </button>
                )
              })}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowCasesMenu((value) => !value)}
                  className={`flex h-[58px] w-full flex-col items-center justify-center gap-1.5 rounded-[0.95rem] border px-1 text-center transition hover:brightness-110 ${
                    isCasesRoute
                      ? "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] text-cyan-100 shadow-[0_12px_28px_rgba(84,199,236,0.14)]"
                      : "border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] text-white/84"
                  }`}
                >
                  <FileText className="h-4.5 w-4.5" />
                  <span className="text-[10px] leading-3 font-medium">Cases</span>
                  {showCasesMenu ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showCasesMenu ? (
                  <div className="space-y-2 rounded-[1rem] border border-white/8 bg-white/[0.04] p-2">
                    <button
                      type="button"
                      onClick={() => router.push("/police/cases?view=recent")}
                      className={`flex min-h-[44px] w-full flex-col items-center justify-center rounded-[0.85rem] border px-1 py-2 text-center transition hover:brightness-110 ${
                        isCasesRoute && caseView === "recent" && !isDraftsRoute
                          ? "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] text-cyan-100"
                          : "border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] text-white/78"
                      }`}
                    >
                      <span className="text-[10px] leading-3 font-medium">Recent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/police/cases?view=all")}
                      className={`flex min-h-[44px] w-full flex-col items-center justify-center rounded-[0.85rem] border px-1 py-2 text-center transition hover:brightness-110 ${
                        isCasesRoute && caseView === "all" && !isDraftsRoute
                          ? "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] text-cyan-100"
                          : "border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] text-white/78"
                      }`}
                    >
                      <span className="text-[10px] leading-3 font-medium">View All</span>
                    </button>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => router.push("/police/cases?resume=incomplete")}
                className={`flex h-[58px] w-full flex-col items-center justify-center gap-1.5 rounded-[0.95rem] border px-1 text-center transition hover:brightness-110 ${
                  isDraftsRoute
                    ? "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] text-cyan-100 shadow-[0_12px_28px_rgba(84,199,236,0.14)]"
                    : "border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] text-white/84"
                }`}
              >
                <FolderClock className="h-4.5 w-4.5" />
                <span className="text-[10px] leading-3 font-medium">Drafts</span>
              </button>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowInsightsMenu((value) => !value)}
                  className={`flex h-[58px] w-full flex-col items-center justify-center gap-1.5 rounded-[0.95rem] border px-1 text-center transition hover:brightness-110 ${
                    isInsightsRoute
                      ? "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] text-cyan-100 shadow-[0_12px_28px_rgba(84,199,236,0.14)]"
                      : "border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] text-white/84"
                  }`}
                >
                  <Layers3 className="h-4.5 w-4.5" />
                  <span className="text-[10px] leading-3 font-medium">Insights</span>
                  {showInsightsMenu ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showInsightsMenu ? (
                  <div className="space-y-2 rounded-[1rem] border border-white/8 bg-white/[0.04] p-2">
                    {insightItems.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => router.push(`/police/insights?view=${encodeURIComponent(item.key)}`)}
                        className={`flex min-h-[44px] w-full flex-col items-center justify-center rounded-[0.85rem] border px-1 py-2 text-center transition hover:brightness-110 ${
                          searchParams.get("view") === item.key
                            ? "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.22),rgba(91,140,255,0.18))] text-cyan-100"
                            : "border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] text-white/78"
                        }`}
                      >
                        <span className="text-[10px] leading-3 font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-auto w-full space-y-2 pt-4">
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="flex h-[52px] w-full flex-col items-center justify-center gap-1 rounded-[0.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,29,56,0.92),rgba(10,18,39,0.96))] px-1 text-center text-white/84 transition hover:brightness-110"
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
                className="flex h-[52px] w-full flex-col items-center justify-center gap-1 rounded-[0.85rem] border border-fuchsia-200/18 bg-[linear-gradient(135deg,rgba(111,109,255,0.2),rgba(203,93,240,0.16))] px-1 text-center text-white transition hover:brightness-110"
              >
                <LogOut className="h-4 w-4" />
                <div className="text-[10px] leading-3 font-medium">Logout</div>
              </button>
            </div>
          </aside>

          <div className={`min-w-0 ${contentClassName}`}>{children}</div>
        </div>
      </div>
    </DashboardLayout>
  )
}
