"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Archive, Building2, FileSearch, Gavel, Landmark, Scale, Shield } from "lucide-react"
import justicePhoto from "../justice-photo.jpg"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redirectForRole } from "@/lib/role-redirect"
import { toCanonicalRole } from "@/lib/roles"
import { useStore } from "@/lib/store"

function JusticeLogo() {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.18),rgba(111,109,255,0.14))] shadow-[0_18px_40px_rgba(6,12,28,0.24)] md:h-40 md:w-40">
      <div className="absolute inset-4 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(18,29,56,0.52),rgba(11,20,40,0.58))]" />
      <Scale className="relative h-20 w-20 text-cyan-100 md:h-24 md:w-24" strokeWidth={1.8} />
    </div>
  )
}

const JUSTICE_NODES = [
  {
    label: "Police Command",
    note: "Intake and first response",
    Icon: Shield,
    href: "/public/analytics?panel=workload&departmentKey=police",
    className: "left-1/2 top-[18px] -translate-x-1/2",
  },
  {
    label: "Records Archive",
    note: "Retention and traceability",
    Icon: Archive,
    href: "/public/analytics?panel=workload&departmentKey=records",
    className: "left-[-208px] top-[146px]",
  },
  {
    label: "Investigation Unit",
    note: "Evidence and case development",
    Icon: FileSearch,
    href: "/public/analytics?panel=workload&departmentKey=investigation",
    className: "right-[-208px] top-[146px]",
  },
  {
    label: "Registry Desk",
    note: "Routing and intake control",
    Icon: Building2,
    href: "/public/analytics?panel=workload&departmentKey=registry",
    className: "left-[-208px] bottom-[126px]",
  },
  {
    label: "Prosecution",
    note: "Review and charge decisions",
    Icon: Landmark,
    href: "/public/analytics?panel=workload&departmentKey=prosecution",
    className: "right-[-208px] bottom-[126px]",
  },
  {
    label: "Court Bench",
    note: "Hearings and judgments",
    Icon: Gavel,
    href: "/public/analytics?panel=workload&departmentKey=court",
    className: "left-1/2 bottom-[18px] -translate-x-1/2",
  },
]

function JusticeNetwork() {
  return (
    <div className="relative mt-8 hidden h-[460px] w-full max-w-[470px] lg:block">
      <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(90,140,255,0.12),transparent_42%),radial-gradient(circle_at_28%_24%,rgba(236,72,153,0.14),transparent_28%),radial-gradient(circle_at_72%_72%,rgba(34,211,238,0.14),transparent_30%)]" />
      <div className="absolute left-1/2 top-1/2 h-[156px] w-[156px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/14 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_62%)]" />
      <div className="absolute left-1/2 top-1/2 h-[238px] w-[238px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20" />
      <div className="absolute left-1/2 top-1/2 h-[332px] w-[332px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/14" />
      <div className="absolute left-1/2 top-1/2 h-[1px] w-[394px] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]" />
      <div className="absolute left-1/2 top-1/2 h-[370px] w-[1px] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.2),transparent)]" />
      <div className="absolute left-1/2 top-1/2 h-[332px] w-[332px] -translate-x-1/2 -translate-y-1/2 rotate-[60deg] border border-white/11" />
      <div className="absolute left-1/2 top-1/2 h-[332px] w-[332px] -translate-x-1/2 -translate-y-1/2 -rotate-[60deg] border border-white/11" />

      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="relative scale-[0.62]">
          <div className="absolute inset-[-18px] rounded-[2.4rem] bg-[radial-gradient(circle,rgba(84,199,236,0.16),transparent_58%)] blur-2xl" />
          <JusticeLogo />
        </div>
      </div>

      {JUSTICE_NODES.map(({ label, note, Icon, href, className }) => (
        <Link
          key={label}
          href={href}
          className={`absolute w-[134px] rounded-[0.95rem] border border-white/12 bg-[linear-gradient(180deg,rgba(15,25,48,0.92),rgba(10,18,34,0.94))] p-2 shadow-[0_18px_34px_rgba(2,8,20,0.18)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-[linear-gradient(180deg,rgba(17,29,56,0.96),rgba(11,20,40,0.98))] ${className}`}
        >
          <div className="flex items-start gap-1.5">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d7b56d]/40 bg-[radial-gradient(circle_at_center,#2731a8_0%,#1e287f_64%,#121c58_100%)] shadow-[0_12px_24px_rgba(9,14,40,0.28)]">
              <div className="absolute inset-[3px] rounded-full border border-[#f1c36a]/35" />
              <div className="absolute inset-[5px] rounded-full border border-[#f1c36a]/18" />
              <Icon className="relative z-10 h-2.5 w-2.5 text-[#f1c36a]" />
            </div>
            <div className="min-w-0">
              <div className="text-[7px] uppercase tracking-[0.16em] text-cyan-100/70">Department</div>
              <div className="mt-0.5 text-[0.72rem] font-semibold leading-4 text-white">{label}</div>
              <div className="mt-0.5 text-[8px] leading-3.5 text-white/54">{note}</div>
            </div>
          </div>
        </Link>
      ))}

      <div className="absolute left-[66px] top-[168px] h-1.5 w-1.5 rounded-full bg-cyan-300/70 shadow-[0_0_14px_rgba(103,232,249,0.7)]" />
      <div className="absolute right-[66px] top-[168px] h-2 w-2 rounded-full bg-fuchsia-300/72 shadow-[0_0_14px_rgba(244,114,182,0.62)]" />
      <div className="absolute bottom-[142px] left-[92px] h-1.5 w-1.5 rounded-full bg-blue-300/70 shadow-[0_0_14px_rgba(147,197,253,0.6)]" />
      <div className="absolute bottom-[142px] right-[92px] h-1.5 w-1.5 rounded-full bg-cyan-300/70 shadow-[0_0_14px_rgba(103,232,249,0.62)]" />
    </div>
  )
}

function PasswordField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor="password" className="text-sm font-semibold text-white/70">
        Enter your password
      </Label>
      <Input
        id="password"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=""
        autoComplete="current-password"
        className="h-12 rounded-[0.85rem] border border-white/18 bg-white/8 px-4 text-white shadow-none backdrop-blur-md placeholder:text-white/34 focus-visible:border-cyan-300/45 focus-visible:ring-cyan-300/18"
      />
    </div>
  )
}

function EmailField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor="email" className="text-sm font-semibold text-white/70">
        Enter your email
      </Label>
      <Input
        id="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=""
        autoComplete="username"
        className="h-12 rounded-[0.85rem] border border-white/18 bg-white/8 px-4 text-white shadow-none backdrop-blur-md placeholder:text-white/34 focus-visible:border-cyan-300/45 focus-visible:ring-cyan-300/18"
      />
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const setCurrentUser = useStore((s: any) => s.setCurrentUser)
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
      setCurrentUser({ ...user, role: canonicalRole })
      router.replace(redirectForRole(canonicalRole))
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#081224_0%,#101b36_42%,#091326_100%)] text-white">
      <div className="absolute inset-0">
        <Image
          src={justicePhoto}
          alt="Justice themed background"
          fill
          priority
          className="object-cover object-center opacity-62"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,18,36,0.58)_0%,rgba(16,27,54,0.56)_42%,rgba(9,19,38,0.62)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(236,72,153,0.08),transparent_18%),radial-gradient(circle_at_80%_26%,rgba(59,130,246,0.09),transparent_20%),radial-gradient(circle_at_50%_75%,rgba(168,85,247,0.07),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_42%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.02),transparent_28%,rgba(236,72,153,0.04)_52%,transparent_72%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12 md:px-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-x-[1.5cm]">
          <section className="flex justify-center lg:justify-start">
            <div className="max-w-[620px] text-center lg:ml-[4.9cm] lg:text-left">
              <div>
                <h1 className="font-['Georgia','Times_New_Roman',serif] text-[2.7rem] font-black uppercase tracking-[0.02em] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] md:text-[3.4rem]">
                  BEJAS
                </h1>
              </div>

              <JusticeNetwork />

              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:hidden">
                {JUSTICE_NODES.map(({ label, Icon, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,25,48,0.82),rgba(10,18,34,0.86))] p-3 text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(84,199,236,0.24),rgba(111,109,255,0.22))]">
                      <Icon className="h-4 w-4 text-cyan-100" />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">{label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <div className="pointer-events-none absolute left-[calc(50%-0.45cm)] top-1/2 hidden h-[420px] w-px -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgba(125,211,252,0.3),rgba(255,255,255,0.18),rgba(125,211,252,0.3),transparent)] shadow-[0_0_24px_rgba(56,189,248,0.18)] lg:block" />

          <section className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px]">
              <div className="absolute inset-0 rounded-[1.8rem] bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_34%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(11,18,36,0.28),rgba(10,16,31,0.34))] px-6 py-7 text-white shadow-[0_22px_60px_rgba(1,6,18,0.26)] backdrop-blur-md md:px-8 md:py-8">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%,transparent_70%,rgba(255,255,255,0.015))]" />
                <div className="text-center">
                  <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-white">Login Form</h2>
                </div>

                <form className="relative mt-7 space-y-4.5" onSubmit={onSubmit}>
                  <EmailField value={email} onChange={setEmail} />

                  <PasswordField value={password} onChange={setPassword} />

                  <div className="flex items-center justify-between gap-3 pt-1 text-xs text-white/72">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-3.5 w-3.5 rounded border-white/25 bg-white/10" />
                      <span>Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="font-medium text-white/74 hover:text-white hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  {error && (
                    <div className="rounded-[0.9rem] border border-rose-300/26 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <Button
                      type="submit"
                      disabled={!canSubmit || loading}
                      className="h-11 w-full rounded-[0.85rem] border border-white/12 bg-white text-[0.98rem] font-semibold !text-slate-900 shadow-[0_16px_34px_rgba(255,255,255,0.14)] hover:bg-white/92 hover:!text-slate-950"
                    >
                      {loading ? "Logging in..." : "Log In"}
                    </Button>
                    <Button
                      asChild
                      type="button"
                      variant="ghost"
                      className="h-auto w-full justify-center rounded-none border-0 px-0 py-0 text-sm text-white/72 shadow-none hover:bg-transparent hover:text-white"
                    >
                      <Link href="/public" prefetch={false}>Public Portal</Link>
                    </Button>
                  </div>

                  <div className="border-t border-white/10 pt-1 text-center text-sm text-white/62">
                    Don&apos;t have an account?{" "}
                    <Link href="/login" className="font-semibold text-white hover:underline">
                      Register
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
