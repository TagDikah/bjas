import { randomUUID } from "node:crypto"
import type { CaseData } from "@/lib/blockchain"
import { anchorCaseOnChain } from "@/lib/blockchain/case-anchor"
import { getDbPool } from "@/lib/db"
import type { SessionUser } from "@/lib/server/auth-session"

type DbCaseRow = {
  id: string
  title: string
  description: string
  status: string
  createdById: string
  createdByName: string
  createdByRole: string
  createdAt: string
  updatedAt: string
  assignedToId: string | null
  assignedToName: string | null
  assignedToRole: string | null
  caseNumber: string | null
  citation: string | null
  district: string | null
  parties: string | null
  charge: string | null
  payload: string | null
  blockchainTxHash: string | null
  blockchainBlockIndex: number | null
  blockchainContentHash: string | null
  crimeType: string | null
  crimeSubCategory: string | null
  severityLevel: string | null
  areaStation: string | null
  townArea: string | null
  placeDescription: string | null
  rejectionReasonPublic: string | null
  rejectionIsConfidential: number | null
  rejectedAt: string | null
  rejectedByUserId: string | null
  rejectedByName: string | null
  rejectedByRole: string | null
  rejectionStage: string | null
  followUpRequired: number | null
  resubmittedAt: string | null
  resubmittedBy: string | null
  resumeReason: string | null
}

type DbAuditRow = {
  id: number
  caseId: string
  action: string
  performedById: string
  performedByName: string
  performedByRole: string
  timestamp: string
  details: string | null
  blockIndex: number | null
  transactionHash: string | null
}

function safeJsonParse(value: unknown): Record<string, any> {
  if (typeof value !== "string" || !value.trim()) return {}
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function makeCaseId() {
  return `case_${randomUUID().replace(/-/g, "").slice(0, 16)}`
}

export async function ensureCaseTables() {
  // Presentation note: this keeps the database schema ready so the demo can run even if new columns were added recently.
  const pool = await getDbPool()

  await pool.query(`
    ALTER TABLE cases
      ADD COLUMN IF NOT EXISTS caseNumber VARCHAR(64) NULL,
      ADD COLUMN IF NOT EXISTS citation TEXT NULL,
      ADD COLUMN IF NOT EXISTS district VARCHAR(120) NULL,
      ADD COLUMN IF NOT EXISTS parties VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS charge VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS payload JSON NULL,
      ADD COLUMN IF NOT EXISTS blockchainTxHash VARCHAR(160) NULL,
      ADD COLUMN IF NOT EXISTS blockchainBlockIndex BIGINT NULL,
      ADD COLUMN IF NOT EXISTS blockchainContentHash VARCHAR(160) NULL,
      ADD COLUMN IF NOT EXISTS crimeType VARCHAR(80) NULL,
      ADD COLUMN IF NOT EXISTS crimeSubCategory VARCHAR(120) NULL,
      ADD COLUMN IF NOT EXISTS severityLevel VARCHAR(40) NULL,
      ADD COLUMN IF NOT EXISTS areaStation VARCHAR(120) NULL,
      ADD COLUMN IF NOT EXISTS townArea VARCHAR(120) NULL,
      ADD COLUMN IF NOT EXISTS placeDescription TEXT NULL,
      ADD COLUMN IF NOT EXISTS rejectionReasonPublic TEXT NULL,
      ADD COLUMN IF NOT EXISTS rejectionIsConfidential TINYINT(1) NULL,
      ADD COLUMN IF NOT EXISTS rejectedAt DATETIME NULL,
      ADD COLUMN IF NOT EXISTS rejectedByUserId VARCHAR(64) NULL,
      ADD COLUMN IF NOT EXISTS rejectedByName VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS rejectedByRole VARCHAR(64) NULL,
      ADD COLUMN IF NOT EXISTS rejectionStage VARCHAR(80) NULL,
      ADD COLUMN IF NOT EXISTS followUpRequired TINYINT(1) NULL,
      ADD COLUMN IF NOT EXISTS resubmittedAt DATETIME NULL,
      ADD COLUMN IF NOT EXISTS resubmittedBy VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS resumeReason TEXT NULL
  `)
}

function mapCase(row: DbCaseRow): CaseData {
  const payload = safeJsonParse(row.payload)
  const classification = {
    ...(payload.classification || {}),
    crimeType: row.crimeType || payload.classification?.crimeType || "",
    crimeSubCategory: row.crimeSubCategory || payload.classification?.crimeSubCategory || "",
    severityLevel: row.severityLevel || payload.classification?.severityLevel || "",
    areaStation: row.areaStation || payload.classification?.areaStation || "",
    district: row.district || payload.classification?.district || "",
    townArea: row.townArea || payload.classification?.townArea || "",
    placeOfOccurrence: row.placeDescription || payload.classification?.placeOfOccurrence || "",
  }
  const rejectionInfo = {
    ...(payload.rejectionInfo || {}),
    rejectionReasonPublic: row.rejectionReasonPublic || payload.rejectionInfo?.rejectionReasonPublic || "",
    rejectionIsConfidential:
      row.rejectionIsConfidential == null
        ? Boolean(payload.rejectionInfo?.rejectionIsConfidential)
        : Boolean(row.rejectionIsConfidential),
    rejectedAt: row.rejectedAt || payload.rejectionInfo?.rejectedAt || "",
    rejectedByUserId: row.rejectedByUserId || payload.rejectionInfo?.rejectedByUserId || "",
    rejectedByName: row.rejectedByName || payload.rejectionInfo?.rejectedByName || "",
    rejectedByRole: row.rejectedByRole || payload.rejectionInfo?.rejectedByRole || "",
    rejectionStage: row.rejectionStage || payload.rejectionInfo?.rejectionStage || "",
    followUpRequired:
      row.followUpRequired == null
        ? Boolean(payload.rejectionInfo?.followUpRequired)
        : Boolean(row.followUpRequired),
    resubmittedAt: row.resubmittedAt || payload.rejectionInfo?.resubmittedAt || "",
    resubmittedBy: row.resubmittedBy || payload.rejectionInfo?.resubmittedBy || "",
    resumeReason: row.resumeReason || payload.rejectionInfo?.resumeReason || "",
  }

  return {
    ...(payload as CaseData),
    caseId: row.id,
    caseNumber: row.caseNumber || payload.caseNumber || row.id,
    citation: row.citation || payload.citation || "",
    district: row.district || payload.district || "",
    parties: row.parties || payload.parties || row.title || "",
    charge: row.charge || payload.charge || row.title || "",
    description: row.description || payload.description || "",
    policeOfficerId: payload.policeOfficerId || row.createdById || "",
    policeOfficerName: payload.policeOfficerName || row.createdByName || "",
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    chainAnchor: row.blockchainTxHash
      ? {
          ...(payload.chainAnchor || {}),
          transactionId: row.blockchainTxHash,
          txHash: row.blockchainTxHash,
          blockNumber: row.blockchainBlockIndex,
          contentHash: row.blockchainContentHash,
          channelName: payload.chainAnchor?.channelName || null,
          chaincodeName: payload.chainAnchor?.chaincodeName || null,
        }
      : payload.chainAnchor,
    classification,
    rejectionInfo,
  }
}

export async function listCases() {
  // Presentation note: this loads case records from TiDB and reshapes them into the format used by the app screens.
  await ensureCaseTables()
  const pool = await getDbPool()
  const [rows] = await pool.query(`
    SELECT
      id, title, description, status, createdById, createdByName, createdByRole,
      createdAt, updatedAt, assignedToId, assignedToName, assignedToRole,
      caseNumber, citation, district, parties, charge, payload,
      blockchainTxHash, blockchainBlockIndex, blockchainContentHash,
      crimeType, crimeSubCategory, severityLevel, areaStation, townArea, placeDescription,
      rejectionReasonPublic, rejectionIsConfidential, rejectedAt, rejectedByUserId, rejectedByName,
      rejectedByRole, rejectionStage, followUpRequired, resubmittedAt, resubmittedBy, resumeReason
    FROM cases
    ORDER BY updatedAt DESC
  `)

  return (rows as DbCaseRow[]).map(mapCase)
}

export async function getCaseById(caseId: string) {
  await ensureCaseTables()
  const pool = await getDbPool()
  const [rows] = await pool.query(
    `
    SELECT
      id, title, description, status, createdById, createdByName, createdByRole,
      createdAt, updatedAt, assignedToId, assignedToName, assignedToRole,
      caseNumber, citation, district, parties, charge, payload,
      blockchainTxHash, blockchainBlockIndex, blockchainContentHash,
      crimeType, crimeSubCategory, severityLevel, areaStation, townArea, placeDescription,
      rejectionReasonPublic, rejectionIsConfidential, rejectedAt, rejectedByUserId, rejectedByName,
      rejectedByRole, rejectionStage, followUpRequired, resubmittedAt, resubmittedBy, resumeReason
    FROM cases
    WHERE id = ?
    LIMIT 1
  `,
    [caseId]
  )
  const row = Array.isArray(rows) ? (rows[0] as DbCaseRow | undefined) : undefined
  return row ? mapCase(row) : null
}

export async function listAuditEntriesForCase(caseId: string) {
  const pool = await getDbPool()
  const [rows] = await pool.query(
    `
    SELECT
      id, caseId, action, performedById, performedByName, performedByRole,
      timestamp, details, blockIndex, transactionHash
    FROM audit_entries
    WHERE caseId = ?
    ORDER BY timestamp DESC
  `,
    [caseId]
  )

  return (rows as DbAuditRow[]).map((row) => ({
    ...row,
    detailsJson: safeJsonParse(row.details),
  }))
}

export async function addPublicSubmission(params: {
  caseId: string
  type: string
  message: string
  submitterName?: string
}) {
  const pool = await getDbPool()
  await ensureCaseTables()
  const actorName = String(params.submitterName || "").trim() || "Public User"
  const action = `PUBLIC_${String(params.type || "comment").toUpperCase()}`
  const details = JSON.stringify({
    source: "public_portal",
    submissionType: params.type,
    message: params.message,
  })

  await pool.query(
    `
    INSERT INTO audit_entries
      (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
    VALUES
      (?, ?, ?, ?, ?, NOW(), ?, NULL, NULL)
  `,
    [params.caseId, action, "public", actorName, "public", details]
  )
}

export async function createAndSubmitCase(input: {
  caseData: Partial<CaseData>
  user: SessionUser
}) {
  // Presentation note: this is the main flow for a new case. It prepares the case, anchors it on blockchain, stores it in TiDB, and writes an audit entry.
  await ensureCaseTables()
  const pool = await getDbPool()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const now = new Date().toISOString()
    const caseId = makeCaseId()
    const caseNumber =
      String(input.caseData.caseNumber || "").trim() || `LS-${new Date().getFullYear()}-${caseId.slice(-6).toUpperCase()}`

    const normalized: CaseData = {
      ...(input.caseData as CaseData),
      caseId,
      caseNumber,
      status: "pending_investigation",
      createdAt: now,
      updatedAt: now,
      policeOfficerId: input.user.id,
      policeOfficerName: input.user.name || input.user.fullname || input.user.email,
      policeSections: {
        ...(input.caseData.policeSections ?? {}),
        sectionA: {
          ...(input.caseData.policeSections?.sectionA ?? {}),
          openedAt: now,
          openedById: input.user.id,
          openedByName: input.user.name || input.user.fullname || input.user.email,
          submittedToInvestigationAt: now,
          submittedToInvestigationById: input.user.id,
          submittedToInvestigationByName: input.user.name || input.user.fullname || input.user.email,
        },
      },
    }

    const anchor = await anchorCaseOnChain({
      recordId: caseId,
      caseData: normalized,
      action: "CASE_CREATED_SUBMITTED",
    })

    const payloadJson = JSON.stringify({
      ...normalized,
      chainAnchor: anchor,
      usersInvolved: [
        input.user.name || input.user.fullname || input.user.email,
        normalized.policeSections?.sectionB?.investigatorName,
        normalized.policeSections?.sectionC?.submittedToCommissionerByName,
      ].filter(Boolean),
    })

    const title = String(normalized.charge || normalized.parties || "Case Record")
    const description = String(normalized.description || normalized.policeSections?.sectionA?.summary || "")

    await conn.query(
      `
      INSERT INTO cases
        (id, title, description, status, createdById, createdByName, createdByRole, createdAt, updatedAt,
         caseNumber, citation, district, parties, charge, payload,
         blockchainTxHash, blockchainBlockIndex, blockchainContentHash)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(),
         ?, ?, ?, ?, ?, ?,
         ?, ?, ?)
    `,
      [
        caseId,
        title,
        description,
        "pending_investigation",
        input.user.id,
        input.user.name || input.user.fullname || input.user.email,
        input.user.role,
        caseNumber,
        normalized.citation ?? null,
        normalized.district ?? null,
        normalized.parties ?? null,
        normalized.charge ?? null,
        payloadJson,
        anchor.txHash,
        anchor.blockNumber,
        anchor.contentHash,
      ]
    )

    await conn.query(
      `
      INSERT INTO audit_entries
        (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
      VALUES
        (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
      [
        caseId,
        "CASE_CREATED_AND_SUBMITTED",
        input.user.id,
        input.user.name || input.user.fullname || input.user.email,
        input.user.role,
        JSON.stringify({
          caseNumber,
          status: "pending_investigation",
          message: "Case created in Police and submitted to Investigation.",
        }),
        anchor.blockNumber,
        anchor.txHash,
      ]
    )

    await conn.commit()
    return {
      caseData: {
        ...normalized,
        chainAnchor: anchor,
      } as CaseData,
      anchor,
    }
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export async function checkpointPoliceCaseStep(input: {
  caseId?: string
  stepIndex: number
  stepKey: string
  caseData: Partial<CaseData>
  user: SessionUser
}) {
  // Presentation note: this saves progress step-by-step and anchors each checkpoint so form stages cannot be silently altered later.
  await ensureCaseTables()
  const pool = await getDbPool()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const now = new Date().toISOString()
    const actorName = input.user.name || input.user.fullname || input.user.email
    let caseId = String(input.caseId || "").trim()
    let previousStatus = "draft_police"
    let createdAt = now
    let existingPayload: Record<string, any> = {}

    if (caseId) {
      const [existingRows] = await conn.query(
        `
        SELECT id, status, createdAt, payload
        FROM cases
        WHERE id = ?
        LIMIT 1
      `,
        [caseId]
      )
      const existing = Array.isArray(existingRows) ? (existingRows[0] as any) : null
      if (!existing?.id) {
        throw new Error("Checkpoint case not found.")
      }
      previousStatus = String(existing.status || "draft_police")
      createdAt = String(existing.createdAt || now)
      existingPayload = safeJsonParse(existing.payload)
    } else {
      caseId = makeCaseId()
    }

    const merged: CaseData = {
      ...(existingPayload as CaseData),
      ...(input.caseData as CaseData),
      caseId,
      caseNumber:
        String(input.caseData.caseNumber || existingPayload.caseNumber || "").trim() ||
        `LS-${new Date().getFullYear()}-${caseId.slice(-6).toUpperCase()}`,
      status: "draft_police",
      createdAt,
      updatedAt: now,
      policeOfficerId: input.user.id,
      policeOfficerName: actorName,
      policeSections: {
        ...(existingPayload.policeSections ?? {}),
        ...(input.caseData.policeSections ?? {}),
        sectionA: {
          ...(existingPayload.policeSections?.sectionA ?? {}),
          ...(input.caseData.policeSections?.sectionA ?? {}),
          lastCheckpointAt: now,
          lastCheckpointStepIndex: input.stepIndex,
          lastCheckpointStepKey: input.stepKey,
          checkpointLockedThrough: Math.max(
            Number(existingPayload.policeSections?.sectionA?.checkpointLockedThrough ?? -1),
            input.stepIndex
          ),
          stepCheckpoints: [
            ...(Array.isArray(existingPayload.policeSections?.sectionA?.stepCheckpoints)
              ? existingPayload.policeSections.sectionA.stepCheckpoints
              : []),
            {
              at: now,
              byId: input.user.id,
              byName: actorName,
              stepIndex: input.stepIndex,
              stepKey: input.stepKey,
              action: "checkpoint",
            },
          ],
        },
      },
    }

    const anchor = await anchorCaseOnChain({
      recordId: caseId,
      caseData: merged,
      action: "POLICE_STEP_CHECKPOINT",
    })

    const payloadJson = JSON.stringify({
      ...merged,
      chainAnchor: anchor,
    })

    const title = String(merged.charge || merged.parties || "Case Record")
    const description = String(merged.description || merged.policeSections?.sectionA?.summary || "")

    if (input.caseId) {
      await conn.query(
        `
        UPDATE cases
        SET
          title = ?,
          description = ?,
          status = ?,
          updatedAt = NOW(),
          caseNumber = ?,
          citation = ?,
          district = ?,
          parties = ?,
          charge = ?,
          payload = ?,
          blockchainTxHash = ?,
          blockchainBlockIndex = ?,
          blockchainContentHash = ?
        WHERE id = ?
      `,
        [
          title,
          description,
          "draft_police",
          merged.caseNumber,
          merged.citation ?? null,
          merged.district ?? null,
          merged.parties ?? null,
          merged.charge ?? null,
          payloadJson,
          anchor.txHash,
          anchor.blockNumber,
          anchor.contentHash,
          caseId,
        ]
      )
    } else {
      await conn.query(
        `
        INSERT INTO cases
          (id, title, description, status, createdById, createdByName, createdByRole, createdAt, updatedAt,
           caseNumber, citation, district, parties, charge, payload,
           blockchainTxHash, blockchainBlockIndex, blockchainContentHash)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(),
           ?, ?, ?, ?, ?, ?,
           ?, ?, ?)
      `,
        [
          caseId,
          title,
          description,
          "draft_police",
          input.user.id,
          actorName,
          input.user.role,
          merged.caseNumber,
          merged.citation ?? null,
          merged.district ?? null,
          merged.parties ?? null,
          merged.charge ?? null,
          payloadJson,
          anchor.txHash,
          anchor.blockNumber,
          anchor.contentHash,
        ]
      )
    }

    await conn.query(
      `
      INSERT INTO audit_entries
        (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
      VALUES
        (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
      [
        caseId,
        "POLICE_STEP_CHECKPOINT",
        input.user.id,
        actorName,
        input.user.role,
        JSON.stringify({
          previousStatus,
          nextStatus: "draft_police",
          stepIndex: input.stepIndex,
          stepKey: input.stepKey,
          message: "Police form step checkpoint anchored.",
        }),
        anchor.blockNumber,
        anchor.txHash,
      ]
    )

    await conn.commit()

    return {
      caseId,
      status: "draft_police",
      stepIndex: input.stepIndex,
      stepKey: input.stepKey,
      anchor,
    }
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export async function finalizePoliceCaseSubmission(input: {
  caseId: string
  caseData: Partial<CaseData>
  user: SessionUser
}) {
  // Presentation note: this moves a drafted police case into the investigation queue and records the final blockchain proof for submission.
  await ensureCaseTables()
  const pool = await getDbPool()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [rows] = await conn.query(
      `
      SELECT id, status, createdAt, payload
      FROM cases
      WHERE id = ?
      LIMIT 1
    `,
      [input.caseId]
    )
    const existing = Array.isArray(rows) ? (rows[0] as any) : null
    if (!existing?.id) {
      throw new Error("Case not found for submission.")
    }

    const now = new Date().toISOString()
    const actorName = input.user.name || input.user.fullname || input.user.email
    const existingPayload = safeJsonParse(existing.payload)
    const merged: CaseData = {
      ...(existingPayload as CaseData),
      ...(input.caseData as CaseData),
      caseId: input.caseId,
      status: "pending_investigation",
      createdAt: String(existing.createdAt || existingPayload.createdAt || now),
      updatedAt: now,
      policeOfficerId: input.user.id,
      policeOfficerName: actorName,
      policeSections: {
        ...(existingPayload.policeSections ?? {}),
        ...(input.caseData.policeSections ?? {}),
        sectionA: {
          ...(existingPayload.policeSections?.sectionA ?? {}),
          ...(input.caseData.policeSections?.sectionA ?? {}),
          submittedToInvestigationAt: now,
          submittedToInvestigationById: input.user.id,
          submittedToInvestigationByName: actorName,
        },
      },
    }

    const anchor = await anchorCaseOnChain({
      recordId: input.caseId,
      caseData: merged,
      action: "CASE_SUBMITTED_TO_INVESTIGATION",
    })

    await conn.query(
      `
      UPDATE cases
      SET
        title = ?,
        description = ?,
        status = ?,
        updatedAt = NOW(),
        caseNumber = ?,
        citation = ?,
        district = ?,
        parties = ?,
        charge = ?,
        payload = ?,
        blockchainTxHash = ?,
        blockchainBlockIndex = ?,
        blockchainContentHash = ?
      WHERE id = ?
    `,
      [
        String(merged.charge || merged.parties || "Case Record"),
        String(merged.description || merged.policeSections?.sectionA?.summary || ""),
        "pending_investigation",
        merged.caseNumber,
        merged.citation ?? null,
        merged.district ?? null,
        merged.parties ?? null,
        merged.charge ?? null,
        JSON.stringify({
          ...merged,
          chainAnchor: anchor,
        }),
        anchor.txHash,
        anchor.blockNumber,
        anchor.contentHash,
        input.caseId,
      ]
    )

    await conn.query(
      `
      INSERT INTO audit_entries
        (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
      VALUES
        (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
      [
        input.caseId,
        "CASE_SUBMITTED_TO_INVESTIGATION",
        input.user.id,
        actorName,
        input.user.role,
        JSON.stringify({
          previousStatus: existing.status,
          nextStatus: "pending_investigation",
          message: "Case submitted to investigation after step checkpoints.",
        }),
        anchor.blockNumber,
        anchor.txHash,
      ]
    )

    await conn.commit()

    return {
      caseId: input.caseId,
      status: "pending_investigation",
      anchor,
      caseData: {
        ...merged,
        chainAnchor: anchor,
      } as CaseData,
    }
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export async function markCommissionerClarification(input: {
  caseId: string
  user: SessionUser
  statement: string
}) {
  await ensureCaseTables()
  const pool = await getDbPool()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [rows] = await conn.query(
      `
      SELECT
        id, caseNumber, status, createdAt, payload
      FROM cases
      WHERE id = ?
      LIMIT 1
    `,
      [input.caseId]
    )

    const row = Array.isArray(rows) ? (rows[0] as any) : null
    if (!row?.id) {
      throw new Error("Case not found.")
    }

    const payload = safeJsonParse(row.payload)
    const now = new Date().toISOString()
    const actorName = input.user.name || input.user.fullname || input.user.email
    const statement = String(input.statement || "").trim()
    if (!statement) {
      throw new Error("Clarification statement is required.")
    }

    const previousRequests = Array.isArray(payload?.policeSections?.sectionC?.clarificationRequests)
      ? payload.policeSections.sectionC.clarificationRequests
      : []
    const targetInvestigatorId = String(
      payload?.policeSections?.sectionC?.submittedToCommissionerById ||
        payload?.policeSections?.sectionB?.investigatorId ||
        ""
    ).trim()
    const targetInvestigatorName = String(
      payload?.policeSections?.sectionC?.submittedToCommissionerByName ||
        payload?.policeSections?.sectionB?.investigatorName ||
        ""
    ).trim()

    const clarificationEntry = {
      id: `clar-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      statement,
      requestedAt: now,
      requestedById: input.user.id,
      requestedByName: actorName,
      requestedByRole: input.user.role,
      targetInvestigatorId,
      targetInvestigatorName,
      status: "open",
    }

    const nextCase: CaseData = {
      ...(payload as CaseData),
      caseId: String(row.id),
      caseNumber: String(payload?.caseNumber || row.caseNumber || row.id),
      status: "commissioner_clarification",
      createdAt: String(payload?.createdAt || row.createdAt || now),
      updatedAt: now,
      commissionerDecision: {
        ...(payload?.commissionerDecision ?? {}),
        decision: "clarification",
        // Keep public-facing note generic; full statement remains internal in sectionC.
        notes: "Clarification requested by commissioner.",
        byId: input.user.id,
        byName: actorName,
        at: now,
      },
      policeSections: {
        ...(payload?.policeSections ?? {}),
        sectionC: {
          ...(payload?.policeSections?.sectionC ?? {}),
          clarificationRequests: [clarificationEntry, ...previousRequests],
          latestClarificationStatement: statement,
          latestClarificationAt: now,
          latestClarificationByName: actorName,
          latestClarificationTargetInvestigatorId: targetInvestigatorId,
          latestClarificationTargetInvestigatorName: targetInvestigatorName,
        },
      },
    }

    const anchor = await anchorCaseOnChain({
      recordId: String(row.id),
      caseData: nextCase,
      action: "COMMISSIONER_CLARIFICATION_REQUESTED",
    })

    await conn.query(
      `
      UPDATE cases
      SET
        status = ?,
        updatedAt = NOW(),
        payload = ?,
        blockchainTxHash = ?,
        blockchainBlockIndex = ?,
        blockchainContentHash = ?
      WHERE id = ?
    `,
      [
        "commissioner_clarification",
        JSON.stringify({
          ...nextCase,
          chainAnchor: anchor,
        }),
        anchor.txHash,
        anchor.blockNumber,
        anchor.contentHash,
        input.caseId,
      ]
    )

    await conn.query(
      `
      INSERT INTO audit_entries
        (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
      VALUES
        (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
      [
        input.caseId,
        "COMMISSIONER_CLARIFICATION_REQUESTED",
        input.user.id,
        actorName,
        input.user.role,
        JSON.stringify({
          previousStatus: row.status,
          nextStatus: "commissioner_clarification",
          statement,
          targetInvestigatorId,
          targetInvestigatorName,
        }),
        anchor.blockNumber,
        anchor.txHash,
      ]
    )

    await conn.commit()

    return {
      caseId: input.caseId,
      status: "commissioner_clarification",
      anchor,
      caseData: {
        ...nextCase,
        chainAnchor: anchor,
      } as CaseData,
    }
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export async function markHighCourtRegistryIntake(input: {
  caseId: string
  user: SessionUser
  courtCaseNumber?: string
  notes?: string
  intakeFormData?: Record<string, string>
}) {
  await ensureCaseTables()
  const pool = await getDbPool()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [rows] = await conn.query(
      `
      SELECT
        id, caseNumber, status, createdAt, payload
      FROM cases
      WHERE id = ?
      LIMIT 1
    `,
      [input.caseId]
    )

    const row = Array.isArray(rows) ? (rows[0] as any) : null
    if (!row?.id) {
      throw new Error("Case not found.")
    }

    const payload = safeJsonParse(row.payload)
    const now = new Date().toISOString()
    const actorName = input.user.name || input.user.fullname || input.user.email
    const generatedCourtNo = `HC/${new Date().getFullYear()}/${String(row.id).slice(-6).toUpperCase()}`
    const courtCaseNumber =
      String(input.courtCaseNumber || "").trim() ||
      String(payload?.court?.courtCaseNumber || "").trim() ||
      generatedCourtNo

    const nextCase: CaseData = {
      ...(payload as CaseData),
      caseId: String(row.id),
      caseNumber: String(payload?.caseNumber || row.caseNumber || row.id),
      status: "high_court_registry_intake",
      createdAt: String(payload?.createdAt || row.createdAt || now),
      updatedAt: now,
      court: {
        ...(payload?.court ?? {}),
        courtType: "high",
        courtCaseNumber,
      },
      courtRegistry: {
        ...(payload?.courtRegistry ?? {}),
        intakeAt: now,
        intakeById: input.user.id,
        intakeByName: actorName,
        intakeNotes: String(input.notes || "").trim(),
        intakeFormData: {
          ...(payload?.courtRegistry?.intakeFormData ?? {}),
          ...(input.intakeFormData ?? {}),
        },
      },
    }

    const anchor = await anchorCaseOnChain({
      recordId: String(row.id),
      caseData: nextCase,
      action: "HIGH_COURT_REGISTRY_INTAKE",
    })

    await conn.query(
      `
      UPDATE cases
      SET
        status = ?,
        updatedAt = NOW(),
        payload = ?,
        blockchainTxHash = ?,
        blockchainBlockIndex = ?,
        blockchainContentHash = ?
      WHERE id = ?
    `,
      [
        "high_court_registry_intake",
        JSON.stringify({
          ...nextCase,
          chainAnchor: anchor,
        }),
        anchor.txHash,
        anchor.blockNumber,
        anchor.contentHash,
        input.caseId,
      ]
    )

    await conn.query(
      `
      INSERT INTO audit_entries
        (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
      VALUES
        (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
      [
        input.caseId,
        "HIGH_COURT_REGISTRY_INTAKE",
        input.user.id,
        actorName,
        input.user.role,
        JSON.stringify({
          previousStatus: row.status,
          nextStatus: "high_court_registry_intake",
          courtCaseNumber,
          notes: String(input.notes || "").trim(),
        }),
        anchor.blockNumber,
        anchor.txHash,
      ]
    )

    await conn.commit()

    return {
      caseId: input.caseId,
      status: "high_court_registry_intake",
      courtCaseNumber,
      anchor,
    }
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export async function assignHighCourtCase(input: {
  caseId: string
  user: SessionUser
  judge: {
    id: string
    name: string
  }
  clerk?: {
    id: string
    name: string
  } | null
}) {
  await ensureCaseTables()
  const pool = await getDbPool()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [rows] = await conn.query(
      `
      SELECT
        id, caseNumber, status, createdAt, payload
      FROM cases
      WHERE id = ?
      LIMIT 1
    `,
      [input.caseId]
    )

    const row = Array.isArray(rows) ? (rows[0] as any) : null
    if (!row?.id) {
      throw new Error("Case not found.")
    }

    const payload = safeJsonParse(row.payload)
    const now = new Date().toISOString()
    const actorName = input.user.name || input.user.fullname || input.user.email

    const nextCase: CaseData = {
      ...(payload as CaseData),
      caseId: String(row.id),
      caseNumber: String(payload?.caseNumber || row.caseNumber || row.id),
      status: "assigned_to_high_court_judge",
      createdAt: String(payload?.createdAt || row.createdAt || now),
      updatedAt: now,
      court: {
        ...(payload?.court ?? {}),
        courtType: "high",
        assignedJudgeId: input.judge.id,
        assignedJudgeName: input.judge.name,
      },
      courtRegistry: {
        ...(payload?.courtRegistry ?? {}),
        assignedJudgeId: input.judge.id,
        assignedJudgeName: input.judge.name,
        assignedClerkId: input.clerk?.id || payload?.courtRegistry?.assignedClerkId || "",
        assignedClerkName: input.clerk?.name || payload?.courtRegistry?.assignedClerkName || "",
        assignedAt: now,
        assignedById: input.user.id,
        assignedByName: actorName,
      },
    }

    const anchor = await anchorCaseOnChain({
      recordId: String(row.id),
      caseData: nextCase,
      action: "HIGH_COURT_JUDGE_ASSIGNED",
    })

    await conn.query(
      `
      UPDATE cases
      SET
        status = ?,
        updatedAt = NOW(),
        payload = ?,
        blockchainTxHash = ?,
        blockchainBlockIndex = ?,
        blockchainContentHash = ?
      WHERE id = ?
    `,
      [
        "assigned_to_high_court_judge",
        JSON.stringify({
          ...nextCase,
          chainAnchor: anchor,
        }),
        anchor.txHash,
        anchor.blockNumber,
        anchor.contentHash,
        input.caseId,
      ]
    )

    await conn.query(
      `
      INSERT INTO audit_entries
        (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
      VALUES
        (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
      [
        input.caseId,
        "HIGH_COURT_JUDGE_ASSIGNED",
        input.user.id,
        actorName,
        input.user.role,
        JSON.stringify({
          previousStatus: row.status,
          nextStatus: "assigned_to_high_court_judge",
          assignedJudgeId: input.judge.id,
          assignedJudgeName: input.judge.name,
          assignedClerkId: input.clerk?.id || null,
          assignedClerkName: input.clerk?.name || null,
        }),
        anchor.blockNumber,
        anchor.txHash,
      ]
    )

    await conn.commit()

    return {
      caseId: input.caseId,
      status: "assigned_to_high_court_judge",
      anchor,
    }
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export async function registerAndSendCaseToProsecutor(input: {
  caseId: string
  prosecutorId?: string
  prosecutorName?: string
  user: SessionUser
}) {
  await ensureCaseTables()
  const pool = await getDbPool()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [rows] = await conn.query(
      `
      SELECT id, status, createdAt, payload, caseNumber, citation, district, parties, charge, description
      FROM cases
      WHERE id = ?
      LIMIT 1
    `,
      [input.caseId]
    )

    const row = Array.isArray(rows) ? (rows[0] as any) : null
    if (!row?.id) {
      throw new Error("Case not found.")
    }

    const now = new Date().toISOString()
    const actorName = input.user.name || input.user.fullname || input.user.email
    const payload = safeJsonParse(row.payload)
    const prosecutionReference = `DPP/${new Date().getFullYear()}/${String(input.caseId || "").replace(/[^A-Z0-9]/gi, "").slice(-6).toUpperCase()}`

    const nextCase: CaseData = {
      ...(payload as CaseData),
      caseId: input.caseId,
      caseNumber: String(payload?.caseNumber || row.caseNumber || row.id),
      citation: String(payload?.citation || row.citation || ""),
      district: String(payload?.district || row.district || ""),
      parties: String(payload?.parties || row.parties || row.description || ""),
      charge: String(payload?.charge || row.charge || row.description || ""),
      description: String(payload?.description || row.description || ""),
      status: "assigned_to_prosecutor",
      createdAt: String(payload?.createdAt || row.createdAt || now),
      updatedAt: now,
      prosecutionRegistry: {
        ...(payload?.prosecutionRegistry ?? {}),
        registeredAt: now,
        registeredById: input.user.id,
        registeredByName: actorName,
        prosecutionReference,
      },
      dppReview: {
        ...(payload?.dppReview ?? {}),
        forwardedAt: now,
        forwardedById: input.user.id,
        forwardedByName: actorName,
        registeredAt: now,
        registeredById: input.user.id,
        registeredByName: actorName,
        registryNotes: "Registered in DPP office and sent to prosecutor for confirmation.",
        assignedAt: now,
        assignedById: input.user.id,
        assignedByName: actorName,
        assignedProsecutorId: input.prosecutorId || null,
        assignedProsecutorName: input.prosecutorName || "DPP Prosecutor Queue",
      },
      prosecutionAction: {
        ...(payload?.prosecutionAction ?? {}),
        confirmationRequired: true,
        confirmationStatus: "pending_prosecutor_confirmation",
        confirmationRequestedAt: now,
        confirmationRequestedById: input.user.id,
        confirmationRequestedByName: actorName,
      },
    }

    const anchor = await anchorCaseOnChain({
      recordId: input.caseId,
      caseData: nextCase,
      action: "PROSECUTION_REGISTERED_AND_SENT_TO_PROSECUTOR",
    })

    await conn.query(
      `
      UPDATE cases
      SET
        status = ?,
        updatedAt = NOW(),
        payload = ?,
        blockchainTxHash = ?,
        blockchainBlockIndex = ?,
        blockchainContentHash = ?
      WHERE id = ?
    `,
      [
        "assigned_to_prosecutor",
        JSON.stringify({
          ...nextCase,
          chainAnchor: anchor,
        }),
        anchor.txHash,
        anchor.blockNumber,
        anchor.contentHash,
        input.caseId,
      ]
    )

    await conn.query(
      `
      INSERT INTO audit_entries
        (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
      VALUES
        (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
      [
        input.caseId,
        "PROSECUTION_REGISTERED_AND_SENT_TO_PROSECUTOR",
        input.user.id,
        actorName,
        input.user.role,
        JSON.stringify({
          previousStatus: row.status,
          nextStatus: "assigned_to_prosecutor",
          prosecutionReference,
          assignedProsecutorId: input.prosecutorId || null,
          assignedProsecutorName: input.prosecutorName || "DPP Prosecutor Queue",
        }),
        anchor.blockNumber,
        anchor.txHash,
      ]
    )

    await conn.commit()

    return {
      caseData: {
        ...nextCase,
        chainAnchor: anchor,
      } as CaseData,
      prosecutionReference,
      anchor,
    }
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export async function seedSesothoCases(params: { count: number; actor: SessionUser }) {
  await ensureCaseTables()
  const pool = await getDbPool()
  const [row] = await pool.query("SELECT COUNT(*) AS total FROM cases")
  const total = Array.isArray(row) && row[0] ? Number((row[0] as any).total || 0) : 0

  const needed = Math.max(0, params.count - total)
  const inserted: string[] = []

  if (needed === 0) {
    return { insertedCount: 0, totalCount: total, caseIds: inserted }
  }

  const offences = [
    "Bosholu ba koloi",
    "Bosholu bo hlometseng",
    "Tlhaselo",
    "Polao",
    "Tshenyo ya thepa",
    "Tshotlo ya bana",
    "Kgokahano ya bomenemene",
    "Bosholu ba mehala",
  ]

  const places = ["Maseru", "Berea", "Leribe", "Mafeteng", "Mohales Hoek", "Quthing"]
  const statuses = [
    "draft_police",
    "pending_investigation",
    "in_investigation",
    "pending_commissioner",
    "commissioner_clarification",
    "approved",
    "rejected",
    "submitted_to_dpp",
    "dpp_registry_intake",
    "filed_to_high_court",
    "docket_complete",
    "closed",
  ]

  for (let i = 0; i < needed; i++) {
    const id = makeCaseId()
    const idx = total + i + 1
    const caseNumber = `LS-${new Date().getFullYear()}-${String(idx).padStart(5, "0")}`
    const offence = offences[idx % offences.length]
    const place = places[idx % places.length]
    const status = statuses[idx % statuses.length]
    const citation = `Tokomane ya nyewe: Nyewe ena e mabapi le ${offence} e tlalehilweng ${place}. Dintlha di bolokilwe ka ketane ya blockchain.`

    const caseData: CaseData = {
      caseId: id,
      caseNumber,
      citation,
      district: place,
      parties: `Mmotsi ${idx} vs Moqosu ${idx}`,
      charge: offence,
      description: `Kakaretso ya nyewe ya Sesotho bakeng sa tshebetso ya sechaba.`,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      policeOfficerName: params.actor.name || params.actor.fullname || params.actor.email,
      usersInvolved: [
        "Sgt. Thabo Mokoena",
        "Insp. Lerato Ntsoana",
        "Com. Palesa Mphanya",
        "Adv. Molefi Kabi",
        "Adv. Lineo Letsie",
      ],
      policeSections: {
        sectionA: {
          summary: `Nyewe e butsweng ${place} mabapi le ${offence}.`,
          openedByName: params.actor.name || params.actor.fullname || params.actor.email,
        },
      },
    }

    const anchor = await anchorCaseOnChain({
      recordId: id,
      caseData,
      action: "SEEDED_SESOTHO_CASE",
    })

    await pool.query(
      `
      INSERT INTO cases
        (id, title, description, status, createdById, createdByName, createdByRole, createdAt, updatedAt,
         caseNumber, citation, district, parties, charge, payload, blockchainTxHash, blockchainBlockIndex, blockchainContentHash)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        offence,
        caseData.description || "",
        status,
        params.actor.id,
        params.actor.name || params.actor.fullname || params.actor.email,
        params.actor.role,
        caseNumber,
        citation,
        place,
        caseData.parties,
        offence,
        JSON.stringify({
          ...caseData,
          chainAnchor: anchor,
        }),
        anchor.txHash,
        anchor.blockNumber,
        anchor.contentHash,
      ]
    )

    await pool.query(
      `
      INSERT INTO audit_entries
        (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
      VALUES
        (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
      [
        id,
        "SEEDED_CASE",
        params.actor.id,
        params.actor.name || params.actor.fullname || params.actor.email,
        params.actor.role,
        JSON.stringify({ caseNumber, message: "Sesotho case seeded with blockchain anchor." }),
        anchor.blockNumber,
        anchor.txHash,
      ]
    )

    inserted.push(id)
  }

  return {
    insertedCount: inserted.length,
    totalCount: total + inserted.length,
    caseIds: inserted,
  }
}
