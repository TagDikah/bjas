const RESEND_API_URL = "https://api.resend.com/emails"

type MailPayload = {
  to: string
  subject: string
  html: string
}

function getBaseUrl() {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export function buildResetUrl(token: string) {
  const base = getBaseUrl().replace(/\/$/, "")
  return `${base}/reset-password?token=${encodeURIComponent(token)}`
}

export async function sendEmail(payload: MailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM

  if (!apiKey || !from) {
    return {
      ok: false as const,
      skipped: true as const,
      reason: "Missing RESEND_API_KEY or MAIL_FROM env vars.",
    }
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`Mail send failed: ${response.status} ${text}`)
  }

  return {
    ok: true as const,
    skipped: false as const,
  }
}

export async function sendLoginNotificationEmail(params: {
  to: string
  displayName: string
  loginAt: string
  ipAddress?: string | null
}) {
  return sendEmail({
    to: params.to,
    subject: "BEJAS login notification",
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a">
        <h2 style="margin-bottom:12px">Login notification</h2>
        <p>Hello ${params.displayName || "User"},</p>
        <p>Your BEJAS account was used to log in on ${params.loginAt}.</p>
        <p>IP address: ${params.ipAddress || "Unavailable"}</p>
        <p>If this was not you, please reset your password immediately.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(params: {
  to: string
  displayName: string
  resetUrl: string
}) {
  return sendEmail({
    to: params.to,
    subject: "BEJAS password reset request",
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a">
        <h2 style="margin-bottom:12px">Password reset</h2>
        <p>Hello ${params.displayName || "User"},</p>
        <p>We received a request to reset your BEJAS password.</p>
        <p><a href="${params.resetUrl}">Reset your password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  })
}
