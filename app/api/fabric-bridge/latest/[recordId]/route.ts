import { NextResponse } from "next/server"
import { getLatestAnchorFromFabricDirect } from "@/lib/blockchain/fabric-client"
import { assertFabricBridgeAuthorized } from "@/lib/server/fabric-bridge-auth"

type RouteContext = {
  params: Promise<{
    recordId: string
  }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    assertFabricBridgeAuthorized(request)
    const { recordId } = await context.params
    const normalizedRecordId = String(recordId || "").trim()

    if (!normalizedRecordId) {
      return NextResponse.json({ ok: false, error: "recordId is required." }, { status: 400 })
    }

    const result = await getLatestAnchorFromFabricDirect(normalizedRecordId)
    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error: any) {
    const message = String(error?.message || "Fabric bridge latest-anchor lookup failed.")
    const status =
      message.includes("Unauthorized") ? 401 : message.includes("Case not found") ? 404 : 500

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status }
    )
  }
}
