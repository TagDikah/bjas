import "server-only"

import fs from "node:fs"
import path from "node:path"
import { createPrivateKey } from "node:crypto"
import * as grpc from "@grpc/grpc-js"
import { connect } from "@hyperledger/fabric-gateway/dist/gateway"
import * as hash from "@hyperledger/fabric-gateway/dist/hash/hashes"
import { newECPrivateKeySigner } from "@hyperledger/fabric-gateway/dist/identity/ecdsa"
import { readEnv, readRequiredEnv, readRequiredPathEnv } from "@/lib/server/env"

type FabricConfig = {
  peerEndpoint: string
  peerHostAlias: string
  mspId: string
  channelName: string
  chaincodeName: string
  tlsCertPath: string
  clientCertPath: string
  clientKeyPath: string
  organizationsDir: string
}

type FabricAccessMode = "direct" | "bridge"

function resolveFabricOrganizationsDir() {
  const explicitDir =
    readEnv("FABRIC_ORGANIZATIONS_DIR") ||
    readEnv("FABRIC_BASE_DIR")

  if (explicitDir) {
    const normalized = explicitDir.replace(/\\/g, "/")
    return path.isAbsolute(normalized) ? normalized : path.resolve(process.cwd(), normalized)
  }

  const homeDir = process.env.USERPROFILE || process.env.HOME || ""
  const candidates = [
    path.join(homeDir, "fabric-samples", "test-network", "organizations"),
    path.join(process.cwd(), "fabric-crypto", "organizations"),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return candidates[0]
}

function defaultFabricPaths() {
  const baseDir = resolveFabricOrganizationsDir()
  return {
    organizationsDir: baseDir,
    tlsCertPath: path.join(
      baseDir,
      "peerOrganizations",
      "org1.example.com",
      "tlsca",
      "tlsca.org1.example.com-cert.pem"
    ),
    clientCertPath: path.join(
      baseDir,
      "peerOrganizations",
      "org1.example.com",
      "users",
      "Admin@org1.example.com",
      "msp",
      "signcerts",
      "Admin@org1.example.com-cert.pem"
    ),
    clientKeyPath: path.join(
      baseDir,
      "peerOrganizations",
      "org1.example.com",
      "users",
      "Admin@org1.example.com",
      "msp",
      "keystore",
      "priv_sk"
    ),
  }
}

function getFabricConfig(): FabricConfig {
  const defaults = defaultFabricPaths()

  return {
    organizationsDir: defaults.organizationsDir,
    peerEndpoint: readEnv("FABRIC_PEER_ENDPOINT", { fallback: "localhost:7051" })!,
    peerHostAlias: readEnv("FABRIC_PEER_HOST_ALIAS", {
      fallback: "peer0.org1.example.com",
    })!,
    mspId: readEnv("FABRIC_MSP_ID", { fallback: "Org1MSP" })!,
    channelName: readEnv("FABRIC_CHANNEL_NAME", { fallback: "mychannel" })!,
    chaincodeName: readEnv("FABRIC_CHAINCODE_NAME", { fallback: "caseflow" })!,
    tlsCertPath: readRequiredPathEnv("FABRIC_TLS_CERT_PATH", {
      fallback: defaults.tlsCertPath,
    }),
    clientCertPath: readRequiredPathEnv("FABRIC_CLIENT_CERT_PATH", {
      fallback: defaults.clientCertPath,
    }),
    clientKeyPath: readRequiredPathEnv("FABRIC_CLIENT_KEY_PATH", {
      fallback: defaults.clientKeyPath,
    }),
  }
}

export type FabricAnchorResult = {
  transactionId: string
  txHash: string
  blockNumber: null
  contentHash: string
  channelName: string
  chaincodeName: string
}

type FabricLatestAnchor = {
  contentHash: string
  action: string
  timestamp: string
  transactionId: string
  byUid: string
  byRole: string
}

type FabricLatestAnchorResponse = {
  caseId: string
  latestAnchor: FabricLatestAnchor | null
  sealed: boolean
}

function getFabricAccessMode(): FabricAccessMode {
  const requestedMode = String(readEnv("FABRIC_ACCESS_MODE", { fallback: "direct" }) || "direct")
    .trim()
    .toLowerCase()

  if (requestedMode === "bridge") {
    return "bridge"
  }

  return "direct"
}

function getBridgeConfig() {
  const baseUrl = readRequiredEnv("FABRIC_BRIDGE_URL")
  const token = readRequiredEnv("FABRIC_BRIDGE_TOKEN")
  const timeoutMs = Number(readEnv("FABRIC_BRIDGE_TIMEOUT_MS", { fallback: "15000" }) || "15000")

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    token,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 15000,
  }
}

async function fetchBridgeJson<T>(pathname: string, init?: RequestInit): Promise<T> {
  const bridge = getBridgeConfig()
  const response = await fetch(`${bridge.baseUrl}${pathname}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${bridge.token}`,
      ...(init?.headers || {}),
    },
    signal: AbortSignal.timeout(bridge.timeoutMs),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(String((payload as any)?.error || `Fabric bridge returned ${response.status}`))
  }

  return payload as T
}

function newGrpcClient(config: FabricConfig) {
  const tlsRootCert = fs.readFileSync(config.tlsCertPath)
  return new grpc.Client(config.peerEndpoint, grpc.credentials.createSsl(tlsRootCert), {
    "grpc.ssl_target_name_override": config.peerHostAlias,
  })
}

async function withContract<T>(task: (args: {
  contract: any
  config: FabricConfig
}) => Promise<T>) {
  const config = getFabricConfig()
  const client = newGrpcClient(config)

  try {
    const identity = {
      mspId: config.mspId,
      credentials: fs.readFileSync(config.clientCertPath),
    }
    const privateKey = createPrivateKey(fs.readFileSync(config.clientKeyPath))
    const signer = newECPrivateKeySigner(privateKey)
    const gateway = connect({
      client,
      identity,
      signer,
      hash: hash.sha256,
    })

    try {
      const network = gateway.getNetwork(config.channelName)
      const contract = network.getContract(config.chaincodeName)
      return await task({ contract, config })
    } finally {
      gateway.close()
    }
  } finally {
    client.close()
  }
}

async function submitTransactionDirect(
  transactionName: string,
  args: string[]
): Promise<{ transactionId: string; payload: string; channelName: string; chaincodeName: string }> {
  return withContract(async ({ contract, config }) => {
    const proposal = contract.newProposal(transactionName, {
      arguments: args,
    })
    const transaction = await proposal.endorse()
    const submitted = await transaction.submit()
    const status = await submitted.getStatus()

    if (!status.successful) {
      throw new Error(`Fabric commit failed for ${transactionName}: status ${status.code}`)
    }

    return {
      transactionId: transaction.getTransactionId(),
      payload: Buffer.from(transaction.getResult()).toString("utf8"),
      channelName: config.channelName,
      chaincodeName: config.chaincodeName,
    }
  })
}

async function evaluateTransactionDirect<T>(transactionName: string, args: string[]): Promise<T> {
  return withContract(async ({ contract }) => {
    const result = await contract.evaluateTransaction(transactionName, ...args)
    return JSON.parse(Buffer.from(result).toString("utf8")) as T
  })
}

export async function anchorCaseInFabricDirect(params: {
  recordId: string
  contentHash: string
  action: string
  caseData: unknown
  byUid?: string
  byRole?: string
}) {
  const payload = {
    contentHash: params.contentHash,
    action: params.action,
    byUid: params.byUid || "system",
    byRole: params.byRole || "system",
    title: (params.caseData as any)?.caseNumber || params.recordId,
    description: (params.caseData as any)?.description || "",
  }

  const result = await submitTransactionDirect("anchorCase", [
    params.recordId,
    JSON.stringify(payload),
  ])

  return {
    transactionId: result.transactionId,
    txHash: result.transactionId,
    blockNumber: null,
    contentHash: params.contentHash,
    channelName: result.channelName,
    chaincodeName: result.chaincodeName,
  } satisfies FabricAnchorResult
}

export async function getLatestAnchorFromFabricDirect(recordId: string) {
  return evaluateTransactionDirect<FabricLatestAnchorResponse>("getLatestAnchor", [recordId])
}

export async function isFabricAvailableDirect() {
  try {
    await withContract(async ({ contract }) => {
      await contract.evaluateTransaction("getLatestAnchor", "__fabric_healthcheck__")
      return true
    })
    return true
  } catch (error: any) {
    const message = String(error?.message || "")
    if (message.includes("Case not found")) {
      return true
    }
    return false
  }
}

export async function getFabricHealthDirect() {
  const config = getFabricConfig()

  try {
    const available = await isFabricAvailableDirect()
    return {
      ok: available,
      blockchainAvailable: available,
      accessMode: "direct" as const,
      peerEndpoint: config.peerEndpoint,
      peerHostAlias: config.peerHostAlias,
      mspId: config.mspId,
      channelName: config.channelName,
      chaincodeName: config.chaincodeName,
      organizationsDir: config.organizationsDir,
      tlsCertPath: config.tlsCertPath,
      clientCertPath: config.clientCertPath,
      clientKeyPath: config.clientKeyPath,
    }
  } catch (error: any) {
    return {
      ok: false,
      blockchainAvailable: false,
      accessMode: "direct" as const,
      peerEndpoint: config.peerEndpoint,
      peerHostAlias: config.peerHostAlias,
      mspId: config.mspId,
      channelName: config.channelName,
      chaincodeName: config.chaincodeName,
      organizationsDir: config.organizationsDir,
      tlsCertPath: config.tlsCertPath,
      clientCertPath: config.clientCertPath,
      clientKeyPath: config.clientKeyPath,
      error: error?.message || "Fabric blockchain unavailable.",
    }
  }
}

export async function anchorCaseInFabric(params: {
  recordId: string
  contentHash: string
  action: string
  caseData: unknown
  byUid?: string
  byRole?: string
}) {
  if (getFabricAccessMode() === "bridge") {
    const response = await fetchBridgeJson<{ ok: true; anchor: FabricAnchorResult }>(
      "/api/fabric-bridge/anchor",
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    )
    return response.anchor
  }

  return anchorCaseInFabricDirect(params)
}

export async function getLatestAnchorFromFabric(recordId: string) {
  if (getFabricAccessMode() === "bridge") {
    const response = await fetchBridgeJson<{ ok: true; result: FabricLatestAnchorResponse }>(
      `/api/fabric-bridge/latest/${encodeURIComponent(recordId)}`
    )
    return response.result
  }

  return getLatestAnchorFromFabricDirect(recordId)
}

export async function isFabricAvailable() {
  try {
    const health = await getFabricHealth()
    return Boolean(health.ok)
  } catch {
    return false
  }
}

export async function getFabricHealth() {
  if (getFabricAccessMode() === "bridge") {
    const bridgeUrl = readEnv("FABRIC_BRIDGE_URL", { fallback: "" }) || ""

    try {
      const response = await fetchBridgeJson<{
        ok: boolean
        blockchainAvailable: boolean
        peerEndpoint?: string
        peerHostAlias?: string
        mspId?: string
        channelName?: string
        chaincodeName?: string
        organizationsDir?: string
        tlsCertPath?: string
        clientCertPath?: string
        clientKeyPath?: string
        bridgeTarget?: string
        accessMode?: string
        error?: string
      }>("/api/fabric-bridge/health")

      return {
        ...response,
        ok: Boolean(response.ok),
        blockchainAvailable: Boolean(response.blockchainAvailable),
        accessMode: "bridge" as const,
        bridgeTarget: bridgeUrl,
      }
    } catch (error: any) {
      return {
        ok: false,
        blockchainAvailable: false,
        accessMode: "bridge" as const,
        bridgeTarget: bridgeUrl,
        error: error?.message || "Fabric bridge unavailable.",
      }
    }
  }

  return getFabricHealthDirect()
}
