import { NextResponse } from "next/server"

import { getVerificationCertificateData } from "@/lib/server/public-portal"

export async function GET(
  request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await context.params
    const certificate = await getVerificationCertificateData(caseId)
    if (!certificate) {
      return NextResponse.json({ ok: false, error: "Case not found." }, { status: 404 })
    }

    const url = new URL(request.url)
    const verifyUrl = `${url.origin}/public/cases/${caseId}`
    const text = `${certificate.caseNumber} | ${verifyUrl}`
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
        <rect width="260" height="260" fill="#071426"/>
        <rect x="18" y="18" width="224" height="224" rx="24" fill="#ffffff"/>
        <rect x="34" y="34" width="42" height="42" fill="#0f172a"/>
        <rect x="42" y="42" width="26" height="26" fill="#ffffff"/>
        <rect x="184" y="34" width="42" height="42" fill="#0f172a"/>
        <rect x="192" y="42" width="26" height="26" fill="#ffffff"/>
        <rect x="34" y="184" width="42" height="42" fill="#0f172a"/>
        <rect x="42" y="192" width="26" height="26" fill="#ffffff"/>
        <g fill="#0f172a">
          <rect x="96" y="40" width="12" height="12"/><rect x="114" y="40" width="12" height="12"/><rect x="132" y="40" width="12" height="12"/>
          <rect x="96" y="58" width="12" height="12"/><rect x="132" y="58" width="12" height="12"/><rect x="150" y="58" width="12" height="12"/>
          <rect x="96" y="94" width="12" height="12"/><rect x="114" y="94" width="12" height="12"/><rect x="150" y="94" width="12" height="12"/>
          <rect x="78" y="112" width="12" height="12"/><rect x="96" y="112" width="12" height="12"/><rect x="132" y="112" width="12" height="12"/><rect x="150" y="112" width="12" height="12"/>
          <rect x="78" y="130" width="12" height="12"/><rect x="114" y="130" width="12" height="12"/><rect x="132" y="130" width="12" height="12"/><rect x="168" y="130" width="12" height="12"/>
          <rect x="96" y="148" width="12" height="12"/><rect x="114" y="148" width="12" height="12"/><rect x="150" y="148" width="12" height="12"/><rect x="168" y="148" width="12" height="12"/>
          <rect x="96" y="166" width="12" height="12"/><rect x="132" y="166" width="12" height="12"/><rect x="150" y="166" width="12" height="12"/>
          <rect x="114" y="184" width="12" height="12"/><rect x="132" y="184" width="12" height="12"/><rect x="168" y="184" width="12" height="12"/>
        </g>
        <text x="130" y="246" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#cbd5e1">${text}</text>
      </svg>
    `.trim()

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Failed to generate verification code." }, { status: 500 })
  }
}
