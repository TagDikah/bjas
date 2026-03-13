"use client"

import React, { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { redirectForRole } from "@/lib/redirect"
import { toCanonicalRole } from "@/lib/roles"

export type DashboardLayoutProps = {
  title?: string
  allowedRoles?: string[]
  children: React.ReactNode
}

function Screen({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md rounded-xl border bg-card p-6">
        <div className="text-lg font-semibold">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
      </div>
    </div>
  )
}

export function DashboardLayout({ title, allowedRoles = [], children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentUser = useStore((s: any) => s.currentUser)
  const isHydrated = useStore((s: any) => s.isHydrated)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userRole = useMemo(() => toCanonicalRole(currentUser?.role), [currentUser])
  const allowed = useMemo(() => allowedRoles.map((r) => toCanonicalRole(r)), [allowedRoles])

  useEffect(() => {
    if (!mounted || !isHydrated) return

    if (!currentUser) {
      if (pathname !== "/login") router.replace("/login")
      return
    }

    if (allowed.length > 0 && !allowed.includes(userRole)) {
      const target = redirectForRole(userRole)
      if (pathname !== target) router.replace(target)
    }
  }, [mounted, isHydrated, currentUser, userRole, allowed, router, pathname])

  if (!mounted || !isHydrated) {
    return <Screen title="Loading..." subtitle="Restoring your workspace" />
  }

  if (!currentUser) {
    return <Screen title="Redirecting..." subtitle="Please login" />
  }

  if (allowed.length > 0 && !allowed.includes(userRole)) {
    return <Screen title="Redirecting..." subtitle="Opening your workspace" />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {title ? (
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
    </div>
  )
}