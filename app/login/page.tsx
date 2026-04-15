"use client"

import Link from "next/link"
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#081224_0%,#101b36_42%,#091326_100%)] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(236,72,153,0.18),transparent_18%),radial-gradient(circle_at_80%_26%,rgba(59,130,246,0.2),transparent_20%),radial-gradient(circle_at_50%_75%,rgba(168,85,247,0.14),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_42%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.02),transparent_28%,rgba(236,72,153,0.04)_52%,transparent_72%)]" />
      <div className="relative w-full max-w-sm overflow-hidden rounded-[1.65rem] border border-white/18 bg-[linear-gradient(180deg,rgba(11,18,36,0.66),rgba(10,16,31,0.76))] shadow-[0_22px_60px_rgba(1,6,18,0.45)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_18%,transparent_70%,rgba(255,255,255,0.03))]" />

        <div className="relative px-6 pb-4 pt-7 text-center">
          <h1 className="text-3xl font-semibold text-white">Login Form</h1>
        </div>

        <form onSubmit={handleLogin} className="relative space-y-4 px-6 pb-6">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-[0.85rem] border border-white/18 bg-white/8 p-3 text-white placeholder:text-white/34 backdrop-blur-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-[0.85rem] border border-white/18 bg-white/8 p-3 text-white placeholder:text-white/34 backdrop-blur-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between gap-3 text-xs text-white/72">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-white/25 bg-white/10" />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="font-medium text-white/74 hover:text-white hover:underline">
              Forgot password?
            </Link>
          </div>

          {error ? <div className="rounded-[0.9rem] border border-rose-300/26 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

          <button
            disabled={loading}
            className="w-full rounded-[0.85rem] bg-white p-3 font-medium text-slate-900 shadow-[0_16px_34px_rgba(255,255,255,0.14)] disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <div className="text-center text-sm text-white/62">
            Don&apos;t have an account? <Link href="/" className="font-semibold text-white hover:underline">Register</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
