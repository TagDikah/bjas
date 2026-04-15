import { NextResponse } from "next/server"
import { getDbPool } from "@/lib/db"
import { getFabricHealth } from "@/lib/blockchain/fabric-client"
import { readEnv } from "@/lib/server/env"

async function getAiHealth() {
  const serviceUrl = readEnv("JUDGE_AI_SERVICE_URL", { fallback: "http://ai-judge:5000" })!

  try {
    const response = await fetch(`${serviceUrl}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`AI health returned ${response.status}`)
    }

    return {
      ok: true,
      serviceUrl,
    }
  } catch (error: any) {
    return {
      ok: false,
      serviceUrl,
      error: error?.message || "AI service unavailable.",
    }
  }
}

export async function GET() {
  const startedAt = Date.now()

  const [dbResult, blockchainResult, aiResult] = await Promise.allSettled([
    (async () => {
      const pool = getDbPool()
      await pool.query("SELECT 1 AS ok")
      return { ok: true }
    })(),
    getFabricHealth(),
    getAiHealth(),
  ])

  const db =
    dbResult.status === "fulfilled"
      ? dbResult.value
      : {
          ok: false,
          error: dbResult.reason?.message || "Database unavailable.",
        }

  const blockchain =
    blockchainResult.status === "fulfilled"
      ? blockchainResult.value
      : {
          ok: false,
          blockchainAvailable: false,
          error: blockchainResult.reason?.message || "Fabric blockchain unavailable.",
        }

  const ai =
    aiResult.status === "fulfilled"
      ? aiResult.value
      : {
          ok: false,
          error: aiResult.reason?.message || "AI service unavailable.",
        }

  const ok = Boolean(db.ok && blockchain.ok && ai.ok)

  return NextResponse.json(
    {
      ok,
      elapsedMs: Date.now() - startedAt,
      services: {
        database: db,
        blockchain,
        ai,
      },
    },
    { status: ok ? 200 : 503 }
  )
}
