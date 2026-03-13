"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { redirectForRole } from "@/lib/redirect"

export default function DashboardPage() {
  const router = useRouter()
  const currentUser = useStore((s: any) => s.currentUser)
  const isHydrated = useStore((s: any) => s.isHydrated)

  useEffect(() => {
    if (!isHydrated) return

    if (!currentUser) {
      router.replace("/login")
      return
    }

    const target = redirectForRole(currentUser.role)
    router.replace(target)
  }, [isHydrated, currentUser, router])

  return (
    <div className="p-6">
      {!isHydrated ? "Loading..." : "Redirecting..."}
    </div>
  )
}