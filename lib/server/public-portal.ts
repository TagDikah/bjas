import { randomUUID, createHash } from "node:crypto"

import { getDbPool } from "@/lib/db"
import { listCases, getCaseById } from "@/lib/server/cases"
import { toPublicCases } from "@/lib/public-case-tracking"

export type PublicSubmissionKind =
  | "public_comment"
  | "service_complaint"
  | "discrepancy_report"
  | "service_suggestion"
  | "help_request"

export type PublicSubmissionStatus =
  | "submitted"
  | "under_review"
  | "published"
  | "resolved"
  | "rejected"

type SubmissionRow = {
  id: string
  trackingNumber: string
  kind: string
  title: string | null
  message: string
  personName: string | null
  email: string | null
  caseReference: string | null
  relatedCaseId: string | null
  moderationStatus: string
  moderationNotes: string | null
  publishedPublicly: number
  language: string | null
  metadataJson: string | null
  createdAt: string
  updatedAt: string
}

function safeJsonParse(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return {}
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function makeTrackingNumber(prefix: string) {
  const stamp = new Date().getFullYear()
  const suffix = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()
  return `BEJAS-${prefix}-${stamp}-${suffix}`
}

function toKindPrefix(kind: PublicSubmissionKind) {
  if (kind === "service_complaint") return "COM"
  if (kind === "discrepancy_report") return "DIS"
  if (kind === "service_suggestion") return "SUG"
  if (kind === "help_request") return "HLP"
  return "PUB"
}

function mapSubmission(row: SubmissionRow) {
  return {
    id: row.id,
    trackingNumber: row.trackingNumber,
    kind: row.kind as PublicSubmissionKind,
    title: row.title || "",
    message: row.message,
    personName: row.personName || "",
    email: row.email || "",
    caseReference: row.caseReference || "",
    relatedCaseId: row.relatedCaseId || "",
    moderationStatus: row.moderationStatus as PublicSubmissionStatus,
    moderationNotes: row.moderationNotes || "",
    publishedPublicly: Boolean(row.publishedPublicly),
    language: row.language || "en",
    metadata: safeJsonParse(row.metadataJson),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function ensurePublicPortalTables() {
  const pool = await getDbPool()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public_portal_submissions (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      trackingNumber VARCHAR(80) NOT NULL UNIQUE,
      kind VARCHAR(40) NOT NULL,
      title VARCHAR(255) NULL,
      message TEXT NOT NULL,
      personName VARCHAR(160) NULL,
      email VARCHAR(160) NULL,
      caseReference VARCHAR(80) NULL,
      relatedCaseId VARCHAR(64) NULL,
      moderationStatus VARCHAR(30) NOT NULL DEFAULT 'submitted',
      moderationNotes TEXT NULL,
      publishedPublicly TINYINT(1) NOT NULL DEFAULT 0,
      language VARCHAR(12) NULL,
      metadataJson JSON NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
}

export async function createPublicSubmission(input: {
  kind: PublicSubmissionKind
  title?: string
  message: string
  personName?: string
  email?: string
  caseReference?: string
  relatedCaseId?: string
  language?: string
  metadata?: Record<string, any>
}) {
  await ensurePublicPortalTables()
  const pool = await getDbPool()

  const id = `pub_${randomUUID().replace(/-/g, "").slice(0, 18)}`
  const trackingNumber = makeTrackingNumber(toKindPrefix(input.kind))
  const publishedPublicly = input.kind === "public_comment" ? 1 : 0
  const moderationStatus: PublicSubmissionStatus =
    input.kind === "public_comment" ? "published" : "submitted"

  await pool.query(
    `
    INSERT INTO public_portal_submissions
      (id, trackingNumber, kind, title, message, personName, email, caseReference, relatedCaseId, moderationStatus, moderationNotes, publishedPublicly, language, metadataJson)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      id,
      trackingNumber,
      input.kind,
      input.title || null,
      input.message,
      input.personName || null,
      input.email || null,
      input.caseReference || null,
      input.relatedCaseId || null,
      moderationStatus,
      null,
      publishedPublicly ? 1 : 0,
      input.language || "en",
      JSON.stringify(input.metadata || {}),
    ]
  )

  return getPublicSubmissionByTrackingNumber(trackingNumber)
}

export async function listPublishedPublicComments() {
  await ensurePublicPortalTables()
  const pool = await getDbPool()
  const [rows] = await pool.query(
    `
    SELECT *
    FROM public_portal_submissions
    WHERE kind = 'public_comment' AND publishedPublicly = 1
    ORDER BY createdAt DESC
    LIMIT 50
  `
  )
  return (rows as SubmissionRow[]).map(mapSubmission)
}

export async function listPortalSubmissions(params?: {
  kind?: string
  moderationStatus?: string
  publishedOnly?: boolean
}) {
  await ensurePublicPortalTables()
  const pool = await getDbPool()
  const clauses: string[] = []
  const values: any[] = []

  if (params?.kind) {
    clauses.push("kind = ?")
    values.push(params.kind)
  }
  if (params?.moderationStatus) {
    clauses.push("moderationStatus = ?")
    values.push(params.moderationStatus)
  }
  if (params?.publishedOnly) {
    clauses.push("publishedPublicly = 1")
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""
  const [rows] = await pool.query(`SELECT * FROM public_portal_submissions ${where} ORDER BY createdAt DESC`, values)
  return (rows as SubmissionRow[]).map(mapSubmission)
}

export async function getPublicSubmissionByTrackingNumber(trackingNumber: string) {
  await ensurePublicPortalTables()
  const pool = await getDbPool()
  const [rows] = await pool.query(
    `SELECT * FROM public_portal_submissions WHERE trackingNumber = ? LIMIT 1`,
    [trackingNumber]
  )
  const row = Array.isArray(rows) ? (rows[0] as SubmissionRow | undefined) : undefined
  return row ? mapSubmission(row) : null
}

export async function updatePortalSubmissionModeration(input: {
  trackingNumber: string
  moderationStatus: PublicSubmissionStatus
  moderationNotes?: string
  publishedPublicly?: boolean
}) {
  await ensurePublicPortalTables()
  const pool = await getDbPool()
  await pool.query(
    `
    UPDATE public_portal_submissions
    SET moderationStatus = ?, moderationNotes = ?, publishedPublicly = ?
    WHERE trackingNumber = ?
  `,
    [
      input.moderationStatus,
      input.moderationNotes || null,
      input.publishedPublicly ? 1 : 0,
      input.trackingNumber,
    ]
  )
  return getPublicSubmissionByTrackingNumber(input.trackingNumber)
}

export async function buildOpenDataSnapshot() {
  const cases = toPublicCases(await listCases())
  const byDepartment = new Map<string, number>()
  const byStatus = new Map<string, number>()
  const byPhase = new Map<string, number>()

  for (const item of cases) {
    byDepartment.set(item.department, (byDepartment.get(item.department) || 0) + 1)
    byStatus.set(item.statusLabel, (byStatus.get(item.statusLabel) || 0) + 1)
    byPhase.set(item.phaseLabel, (byPhase.get(item.phaseLabel) || 0) + 1)
  }

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      visibleCases: cases.length,
      departments: byDepartment.size,
      statuses: byStatus.size,
      phases: byPhase.size,
    },
    byDepartment: Array.from(byDepartment.entries()).map(([department, count]) => ({ department, count })).sort((a, b) => b.count - a.count),
    byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count),
    byPhase: Array.from(byPhase.entries()).map(([phase, count]) => ({ phase, count })).sort((a, b) => b.count - a.count),
    publicCases: cases.map((item) => ({
      caseId: item.caseId,
      caseNumber: item.caseNumber,
      title: item.title,
      department: item.department,
      statusLabel: item.statusLabel,
      phaseLabel: item.phaseLabel,
      updatedAt: item.updatedAt,
    })),
  }
}

export async function verifyPublicDocumentAgainstCase(input: {
  caseId?: string
  caseNumber?: string
  documentText?: string
}) {
  const cases = await listCases()
  const matched =
    (input.caseId ? cases.find((item) => item.caseId === input.caseId) : null) ||
    (input.caseNumber ? cases.find((item) => String(item.caseNumber || "").toLowerCase() === String(input.caseNumber || "").toLowerCase()) : null)

  if (!matched) {
    return {
      ok: false as const,
      error: "Matching case not found.",
    }
  }

  const publicSummaryPayload = {
    caseId: matched.caseId,
    caseNumber: matched.caseNumber,
    title: matched.charge || matched.parties || "Case Record",
    district: matched.district || "",
    status: matched.status,
    updatedAt: matched.updatedAt,
    summary: matched.description || "",
  }

  const storedDigest = createHash("sha256").update(JSON.stringify(publicSummaryPayload)).digest("hex")
  const inputDigest = createHash("sha256").update(String(input.documentText || "").trim()).digest("hex")
  const documentProvided = Boolean(String(input.documentText || "").trim())

  return {
    ok: true as const,
    matchedCaseId: matched.caseId,
    matchedCaseNumber: matched.caseNumber,
    storedDigest,
    inputDigest: documentProvided ? inputDigest : null,
    matchesStoredDigest: documentProvided ? storedDigest === inputDigest : null,
    referencePayload: publicSummaryPayload,
  }
}

export async function getVerificationCertificateData(caseId: string) {
  const caseData = await getCaseById(caseId)
  if (!caseData) return null

  return {
    caseId: caseData.caseId,
    caseNumber: caseData.caseNumber,
    charge: caseData.charge || caseData.parties || "Case Record",
    district: caseData.district || "Not stated",
    status: caseData.status,
    generatedAt: new Date().toISOString(),
    transactionReference:
      caseData.chainAnchor?.transactionId || caseData.chainAnchor?.txHash || "unavailable",
    integrityHash: caseData.chainAnchor?.contentHash || createHash("sha256").update(JSON.stringify(caseData)).digest("hex"),
  }
}
