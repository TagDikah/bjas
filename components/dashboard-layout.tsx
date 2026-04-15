"use client"

import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, Building2, LogOut, Palette, Settings } from "lucide-react"
import { useStore } from "@/lib/store"
import { redirectForRole } from "@/lib/redirect"
import { toCanonicalRole } from "@/lib/roles"
import { applyThemePreference, getUserPreferences } from "@/lib/user-preferences"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type DashboardLayoutProps = {
  title?: string
  allowedRoles?: string[]
  hideWorkspaceShell?: boolean
  children: React.ReactNode
}

function Screen({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-white">
      <div className="justice-panel-strong w-full max-w-md rounded-[1.4rem] p-6 text-white">
        <div className="text-lg font-semibold text-white">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-slate-200">{subtitle}</div> : null}
      </div>
    </div>
  )
}

export function DashboardLayout({ title, allowedRoles = [], hideWorkspaceShell = false, children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentUser = useStore((s: any) => s.currentUser)
  const isHydrated = useStore((s: any) => s.isHydrated)
  const logout = useStore((s: any) => s.logout)
  const setCases = useStore((s: any) => s.setCases)
  const getAllCases = useStore((s: any) => s.getAllCases)

  const [mounted, setMounted] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const [themeLabel, setThemeLabel] = useState("Current")

  useEffect(() => {
    setMounted(true)
  }, [])

  const userRole = useMemo(() => toCanonicalRole(currentUser?.role), [currentUser])
  const allowed = useMemo(() => allowedRoles.map((r) => toCanonicalRole(r)), [allowedRoles])
  const isDashboardRoute =
    pathname === "/dashboard" ||
    pathname.endsWith("/dashboard")

  useEffect(() => {
    if (!mounted || !isHydrated || !currentUser) return

    const prefs = getUserPreferences(currentUser.id)
    applyThemePreference(prefs.theme)
    setProfileImage(String(prefs.profileImageDataUrl || ""))
    setThemeLabel(prefs.theme === "white" ? "White" : prefs.theme === "navy" ? "Navy" : "Current")
  }, [mounted, isHydrated, currentUser])

  useEffect(() => {
    if (!mounted || !isHydrated) return

    if (!currentUser) {
      if (pathname !== "/") router.replace("/")
      return
    }

    if (allowed.length > 0 && !allowed.includes(userRole)) {
      const target = redirectForRole(userRole)
      if (pathname !== target) router.replace(target)
    }
  }, [mounted, isHydrated, currentUser, userRole, allowed, router, pathname])

  useEffect(() => {
    if (!mounted || !isHydrated || !currentUser) return

    fetch("/api/cases")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data?.cases)) {
          const localCases = (getAllCases?.() ?? []) as any[]
          const remoteCases = data.cases as any[]

          // Protect in-progress client work from being wiped when remote list is stale/empty.
          if (remoteCases.length === 0 && localCases.length > 0) return

          const merged = new Map<string, any>()
          for (const item of localCases) {
            if (item?.caseId) merged.set(item.caseId, item)
          }
          for (const item of remoteCases) {
            if (!item?.caseId) continue
            const existing = merged.get(item.caseId)
            if (!existing) {
              merged.set(item.caseId, item)
              continue
            }
            const localTime = new Date(existing?.updatedAt || 0).getTime()
            const remoteTime = new Date(item?.updatedAt || 0).getTime()
            merged.set(item.caseId, remoteTime >= localTime ? item : existing)
          }

          setCases(Array.from(merged.values()))
        }
      })
      .catch(() => {})
  }, [mounted, isHydrated, currentUser, setCases, getAllCases])

  if (!mounted || !isHydrated) {
    return <Screen title="Loading..." subtitle="Restoring your workspace" />
  }

  if (!currentUser) {
    return <Screen title="Redirecting..." subtitle="Returning to home interface" />
  }

  if (allowed.length > 0 && !allowed.includes(userRole)) {
    return <Screen title="Redirecting..." subtitle="Opening your workspace" />
  }

  const initials = String(currentUser?.name || "U")
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const showCorrectionalCover = userRole === "correctional_services" || userRole === "correctional_admin"

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {!hideWorkspaceShell ? (
          <div className="justice-shell mb-6 overflow-hidden rounded-[1.8rem] text-white">
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(181,255,40,0.08),transparent_22%)]" />
              {showCorrectionalCover ? (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[42%] items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,255,40,0.08),transparent_58%)]" />
                  <Building2 className="h-56 w-56 text-white/[0.08] md:h-72 md:w-72" />
                </div>
              ) : null}
              <div className="relative flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  {!isDashboardRoute ? (
                    <Button
                      variant="outline"
                      className="border-border/90 bg-background/40"
                      onClick={() => {
                        const fallback = redirectForRole(userRole)
                        if (typeof window !== "undefined" && window.history.length > 1) {
                          router.back()
                          return
                        }
                        router.push(fallback)
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  ) : null}

                  <div>
                    <div className="justice-chip-info mb-1 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]">
                      Secure Workspace
                    </div>
                    {title ? <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h1> : null}
                    <div className="text-sm text-slate-300">
                      {currentUser?.name} - {String(currentUser?.role || "").replace(/_/g, " ")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="justice-chip hidden items-center gap-1 rounded-full px-3 py-1.5 text-xs sm:flex">
                    <Palette className="h-3.5 w-3.5" />
                    {themeLabel}
                  </div>

                  <Link href="/settings">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/10 bg-[#18191d] text-white hover:border-[#b5ff28]/40 hover:bg-[#202126] hover:text-white [&_svg]:text-white"
                      aria-label="Open settings"
                    >
                      <Settings className="h-4 w-4 !text-white" />
                    </Button>
                  </Link>

                  <Link href="/settings" className="rounded-full">
                    <Avatar className="h-9 w-9 border border-border/80 shadow-lg">
                      <AvatarImage src={profileImage} alt="Profile" />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Link>

                  <Button
                    variant="outline"
                    className="text-white"
                    onClick={() => {
                      logout?.()
                      router.replace("/")
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className={`${hideWorkspaceShell ? "" : "justice-panel rounded-[1.8rem] p-4 md:p-6"} text-white [&_.text-foreground]:!text-white [&_.text-muted-foreground]:!text-slate-200 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_label]:text-white [&_p]:text-slate-200`}>
          {children}
        </div>
      </div>
    </div>
  )
}
