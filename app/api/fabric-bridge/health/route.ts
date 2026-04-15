import { NextResponse } from "next/server"
import { getFabricHealthDirect } from "@/lib/blockchain/fabric-client"
import { assertFabricBridgeAuthorized } from "@/lib/server/fabric-bridge-auth"

export async function GET(request: Request) {
  try {
    assertFabricBridgeAuthorized(request)
    const health = await getFabricHealthDirect()
    return NextResponse.json(
      {
        ...health,
        bridgeTarget: "local-fabric",
      },
      { status: health.ok ? 200 : 503 }
    )
  } catch (error: any) {
    const message = String(error?.message || "Fabric bridge unavailable.")
    const status = message.includes("Unauthorized") ? 401 : 503

    return NextResponse.json(
      {
        ok: false,
        blockchainAvailable: false,
        accessMode: "direct",
        error: message,
      },
      { status }
    )
  }
}
