import { NextRequest, NextResponse } from "next/server"

import { verifyPublicDocumentAgainstCase } from "@/lib/server/public-portal"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const result = await verifyPublicDocumentAgainstCase({
      caseId: String(body?.caseId || "").trim(),
      caseNumber: String(body?.caseNumber || "").trim(),
      documentText: String(body?.documentText || ""),
    })

    if (!result.ok) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Document verification failed." }, { status: 500 })
  }
}
