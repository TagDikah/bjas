"use client"

import { type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Home, LogOut, Settings } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useStore } from "@/lib/store"

type InvestigationShellProps = {
  title: string
  children: ReactNode
  contentClassName?: string
}

export function InvestigationShell({
  title,
  children,
  contentClassName = "space-y-5",
}: InvestigationShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useStore((state: any) => state.logout) as (() => void) | undefined

  const navItems = [
    { label: "Home", icon: Home, href: "/investigation/dashboard", active: pathname === "/investigation/dashboard" },
    { label: "Cases", icon: FileText, href: "/investigation/cases", active: pathname.startsWith("/investigation/cases") || pathname.startsWith("/investigation/case/") },
  ]

  return (
    <DashboardLayout allowedRoles={["police_investigator"]} title={title} hideWorkspaceShell>
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

            <div className="w-full space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => router.push(item.href)}
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

          <div className={`min-w-0 ${contentClassName}`}>{children}</div>
        </div>
      </div>
    </DashboardLayout>
  )
}
