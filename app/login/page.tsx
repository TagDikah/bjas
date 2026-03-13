"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { toCanonicalRole } from "@/lib/roles"

export default function LoginPage() {
  const router = useRouter()
  const setCurrentUser = useStore((s: any) => s.setCurrentUser)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || "Login failed")
        return
      }

      const user = data?.user
      if (!user) {
        setError("Login succeeded but no user returned by API.")
        return
      }

      const canonicalRole = toCanonicalRole(user.role)
      const target = data?.redirectTo || "/dashboard"

      setCurrentUser({ ...user, role: canonicalRole })

      router.replace(target)
      router.refresh()
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="space-y-4 w-80">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button disabled={loading} className="w-full bg-black text-white p-2 rounded disabled:opacity-60">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  )
}