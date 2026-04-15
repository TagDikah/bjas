import { NextResponse } from "next/server"
import { anchorCaseInFabricDirect } from "@/lib/blockchain/fabric-client"
import { assertFabricBridgeAuthorized } from "@/lib/server/fabric-bridge-auth"

export async function POST(request: Request) {
  try {
    assertFabricBridgeAuthorized(request)
    const body = await request.json()

    const recordId = String(body?.recordId || "").trim()
    const contentHash = String(body?.contentHash || "").trim()
    const action = String(body?.action || "").trim()
    const caseData = body?.caseData
    const byUid = String(body?.byUid || "").trim() || undefined
    const byRole = String(body?.byRole || "").trim() || undefined

    if (!recordId || !contentHash || !action || !caseData) {
      return NextResponse.json(
        {
          ok: false,
          error: "recordId, contentHash, action and caseData are required.",
        },
        { status: 400 }
      )
    }

    const anchor = await anchorCaseInFabricDirect({
      recordId,
      contentHash,
      action,
      caseData,
      byUid,
      byRole,
    })

    return NextResponse.json({
      ok: true,
      anchor,
    })
  } catch (error: any) {
    const message = String(error?.message || "Fabric bridge anchor failed.")
    const status = message.includes("Unauthorized") ? 401 : 500

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status }
    )
  }
}
