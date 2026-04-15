import { NextResponse } from "next/server"
import { anchorCaseOnChain } from "@/lib/blockchain/case-anchor"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recordId, caseData, action } = body ?? {}

    if (!recordId || !caseData || !action) {
      return NextResponse.json(
        { ok: false, error: "recordId, caseData and action are required" },
        { status: 400 }
      )
    }

    const result = await anchorCaseOnChain({
      recordId,
      caseData,
      action,
    })

    return NextResponse.json({
      ok: true,
      ...result,
      warning: null,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.shortMessage || error?.message || "Blockchain anchor failed",
      },
      { status: 500 }
    )
  }
}
