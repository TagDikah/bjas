"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Shield, Gavel, Activity, ArrowRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { redirectForRole } from "@/lib/role-redirect"
import { useStore } from "@/lib/store"
import { toCanonicalRole } from "@/lib/roles"

export default function HomePage() {
  const router = useRouter()
  const setCurrentUser = useStore((s: any) => s.setCurrentUser)

  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0
  }, [email, password])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error ?? "Login failed")
      }

      const user = data?.user ?? data?.data?.user
      if (!user?.role) {
        throw new Error("Login succeeded but role is missing from API response.")
      }

      const canonicalRole = toCanonicalRole(user.role)
      const normalizedUser = { ...user, role: canonicalRole }

      setCurrentUser(normalizedUser)

      const target = redirectForRole(canonicalRole, user.email ?? email)
      router.replace(target)
      router.refresh()
      setShowLogin(false)
    } catch (err: any) {
      setError(err?.message ?? "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-border">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight">BEJAS</div>
              <div className="text-xs text-muted-foreground">
                Blockchain Enabled Judicial Analytics System
              </div>
            </div>
          </div>

          <Button className="gap-2" onClick={() => setShowLogin(true)}>
            Login <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2">
          <section>
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-balance">
                Secure justice workflow for modern public institutions.
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-xl">
                BEJAS provides tamper-evident case tracking, role-based access control, and
                operational analytics for Police, DPP, Courts, Registry, and Executive leadership.
              </p>
            </div>

            <div className="mt-8 grid gap-4 max-w-xl">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 border border-border">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Secure and Auditable</div>
                    <div className="text-sm text-muted-foreground">
                      End-to-end traceability and blockchain-backed verification for case integrity.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 border border-border">
                    <Gavel className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Multi-Department Workflow</div>
                    <div className="text-sm text-muted-foreground">
                      Structured case lifecycle from Police to DPP to Court to Closure.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 border border-border">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Operational Analytics</div>
                    <div className="text-sm text-muted-foreground">
                      Leadership dashboards for throughput, backlog monitoring, and performance tracking.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md border-border bg-card shadow-xl">
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl tracking-tight">System Overview</CardTitle>
                <CardDescription>Public access preview (limited data).</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="rounded-xl border border-border p-4">
                    <div className="text-sm text-muted-foreground">Active Cases</div>
                    <div className="mt-2 text-2xl font-semibold">-</div>
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <div className="text-sm text-muted-foreground">New This Week</div>
                    <div className="mt-2 text-2xl font-semibold">-</div>
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <div className="text-sm text-muted-foreground">Pending Reviews</div>
                    <div className="mt-2 text-2xl font-semibold">-</div>
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <div className="text-sm text-muted-foreground">System Status</div>
                    <div className="mt-2 text-2xl font-semibold text-green-600">Online</div>
                  </div>
                </div>

                <Button className="w-full gap-2" onClick={() => setShowLogin(true)}>
                  Access Secure Portal <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-background/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-muted-foreground">
          <div>BEJAS - Public Sector Case Management and Analytics</div>
          <div className="mt-1">Secured access - Auditable workflows - Operational visibility</div>
        </div>
      </footer>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => !loading && setShowLogin(false)}
            aria-label="Close"
          />
          <Card className="relative w-full max-w-md border-border bg-card shadow-2xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Secure Login</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => !loading && setShowLogin(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Use your TiDB account credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@bejas.local"
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button className="w-full" disabled={!canSubmit || loading} type="submit">
                  {loading ? "Signing in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}