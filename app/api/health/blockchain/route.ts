import { NextResponse } from "next/server"
import { getFabricHealth } from "@/lib/blockchain/fabric-client"

export async function GET() {
  const startedAt = Date.now()

  try {
    const health = await getFabricHealth()
    return NextResponse.json(
      {
        ...health,
        elapsedMs: Date.now() - startedAt,
      },
      { status: health.ok ? 200 : 503 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        blockchainAvailable: false,
        elapsedMs: Date.now() - startedAt,
        error: error?.message || "Fabric blockchain unavailable.",
      },
      { status: 503 }
    )
  }
}
