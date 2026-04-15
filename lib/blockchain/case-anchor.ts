import "server-only"

import { ethers } from "ethers"
import {
  anchorCaseInFabric,
  getLatestAnchorFromFabric,
  isFabricAvailable,
} from "@/lib/blockchain/fabric-client"

export function makeCaseHash(data: unknown) {
  const json = JSON.stringify(data)
  return ethers.keccak256(ethers.toUtf8Bytes(json))
}

export async function anchorCaseOnChain(params: {
  recordId: string
  caseData: unknown
  action: string
  byUid?: string
  byRole?: string
}) {
  const contentHash = makeCaseHash(params.caseData)

  return await anchorCaseInFabric({
    recordId: params.recordId,
    contentHash,
    action: params.action,
    caseData: params.caseData,
    byUid: params.byUid,
    byRole: params.byRole,
  })
}

export async function getLatestCaseHash(recordId: string) {
  const result = await getLatestAnchorFromFabric(recordId)
  return result.latestAnchor?.contentHash || null
}

export async function getLatestCaseHashSafe(recordId: string) {
  try {
    const blockchainHash = await getLatestCaseHash(recordId)
    return {
      ok: true as const,
      blockchainAvailable: true,
      blockchainHash,
      error: null,
    }
  } catch (error: any) {
    const available = await isFabricAvailable()
    return {
      ok: false as const,
      blockchainAvailable: available,
      blockchainHash: null,
      error: error?.message || "Fabric blockchain unavailable.",
    }
  }
}
