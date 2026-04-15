import { NextResponse } from "next/server"
import { getLatestCaseHashSafe, makeCaseHash } from "@/lib/blockchain/case-anchor"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recordId, caseData } = body ?? {}

    if (!recordId || !caseData) {
      return NextResponse.json(
        { ok: false, error: "recordId and caseData are required" },
        { status: 400 }
      )
    }

    const databaseHash = makeCaseHash(caseData)
    const blockchain = await getLatestCaseHashSafe(recordId)

    return NextResponse.json({
      ok: true,
      databaseHash,
      blockchainHash: blockchain.blockchainHash,
      blockchainAvailable: blockchain.blockchainAvailable,
      matches:
        blockchain.blockchainAvailable &&
        String(databaseHash).toLowerCase() === String(blockchain.blockchainHash).toLowerCase(),
      warning: blockchain.blockchainAvailable ? null : blockchain.error,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.shortMessage || error?.message || "Blockchain comparison failed" },
      { status: 500 }
    )
  }
}
