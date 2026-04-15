"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { getRoleRoute } from "@/lib/role-routes"

export default function DashboardPage() {
  const router = useRouter()
  const currentUser = useStore((s) => s.currentUser)

  useEffect(() => {
    if (!currentUser) {
      router.replace("/")
      return
    }

    const target = getRoleRoute(currentUser.role)

    if (target && target !== "/dashboard") {
      router.replace(target)
      return
    }

    router.replace("/")
  }, [currentUser, router])

  return <div className="p-6">Redirecting...</div>
}
