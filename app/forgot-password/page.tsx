"use client"

import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data?.error || "Unable to start password reset.")
        return
      }

      setMessage(
        data?.previewResetUrl
          ? `Reset email fallback: ${data.previewResetUrl}`
          : "If the email exists, a reset link has been sent."
      )
    } catch {
      setError("Network error while requesting a password reset.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-foreground">Forgot password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email address and we will send a reset link.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="name@institution.gov.ls"
            className="w-full rounded-xl border border-border bg-input p-3"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          {error ? <div className="text-sm text-destructive">{error}</div> : null}
          {message ? <div className="text-sm text-primary">{message}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
