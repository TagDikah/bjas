import bcrypt from "bcryptjs"
import { ethers } from "ethers"
import { randomUUID } from "node:crypto"
import { getDbPool } from "@/lib/db"
import { toCanonicalRole } from "@/lib/roles"
import { anchorCaseOnChain } from "@/lib/blockchain/case-anchor"
import { buildResetUrl, sendLoginNotificationEmail, sendPasswordResetEmail } from "@/lib/server/email"

export type AppUserRecord = {
  id: string
  email: string
  role: string
  name: string
  fullname: string
  department: string | null
  station: string | null
  badge: string | null
  isActive: boolean
  publicKey: string | null
  privateKey?: string | null
  metadata: Record<string, any>
  createdAt?: string | null
  updatedAt?: string | null
  lastLoginAt?: string | null
}

export type CreateUserInput = {
  email: string
  role: string
  name?: string
  fullname?: string
  department?: string | null
  station?: string | null
  badge?: string | null
  password?: string
  isActive?: boolean
  metadata?: Record<string, any>
}

type DbUserRow = {
  id: string
  email: string
  role: string
  name: string | null
  fullname: string | null
  department: string | null
  station: string | null
  badge: string | null
  isActive: number | boolean | null
  publicKey: string | null
  privateKey: string | null
  metadata: string | null
  createdAt: string | null
  updatedAt: string | null
  lastLoginAt: string | null
}

function safeJsonParse(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return {}
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function mapUser(row: DbUserRow): AppUserRecord {
  const fullName = row.fullname || row.name || row.email
  return {
    id: row.id,
    email: row.email,
    role: toCanonicalRole(row.role),
    name: row.name || fullName,
    fullname: fullName,
    department: row.department,
    station: row.station,
    badge: row.badge,
    isActive: row.isActive === 1 || row.isActive === true,
    publicKey: row.publicKey,
    metadata: safeJsonParse(row.metadata),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastLoginAt: row.lastLoginAt,
  }
}

function normalizeUserMetadata(input: Record<string, any> | undefined, createdBy?: string | null) {
  const metadata = input ?? {}
  const system = metadata.system ?? {}
  const profile = metadata.profile ?? {}
  const professional = metadata.professional ?? {}
  const location = metadata.location ?? {}
  const permissions = metadata.permissions ?? {}
  const security = metadata.security ?? {}

  return {
    ...metadata,
    office: metadata.office ?? "General",
    profile: {
      gender: profile.gender ?? metadata.gender ?? "",
      dateOfBirth: profile.dateOfBirth ?? metadata.dateOfBirth ?? "",
      nationalId: profile.nationalId ?? metadata.nationalId ?? "",
      phoneNumber: profile.phoneNumber ?? metadata.phoneNumber ?? "",
      residentialAddress: profile.residentialAddress ?? metadata.residentialAddress ?? "",
    },
    professional: {
      rank: professional.rank ?? metadata.rank ?? "",
      yearsOfService: professional.yearsOfService ?? metadata.yearsOfService ?? "",
      employmentStatus: professional.employmentStatus ?? metadata.employmentStatus ?? "",
    },
    location: {
      region: location.region ?? metadata.region ?? "",
    },
    permissions: typeof permissions === "object" && permissions !== null ? permissions : {},
    security: {
      question: security.question ?? metadata.securityQuestion ?? "",
      answer: security.answer ?? metadata.securityAnswer ?? "",
      twoFactorEnabled: security.twoFactorEnabled ?? metadata.twoFactorEnabled ?? false,
    },
    system: {
      createdBy: system.createdBy ?? metadata.createdBy ?? createdBy ?? null,
      dateCreated: system.dateCreated ?? metadata.dateCreated ?? new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      blockchainAnchorStatus: system.blockchainAnchorStatus ?? metadata.blockchainAnchorStatus ?? "Pending",
    },
  }
}

function makeUserId(role: string) {
  const normalized = toCanonicalRole(role) || "user"
  return `u_${normalized}_${randomUUID().replace(/-/g, "").slice(0, 12)}`
}

function validateRealEmailAddress(emailRaw: string) {
  const email = String(emailRaw || "").trim().toLowerCase()
  const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!basicEmailPattern.test(email)) {
    throw new Error("Enter a valid email address.")
  }

  const [localPart = "", domain = ""] = email.split("@")
  const blockedDomains = new Set([
    "example.com",
    "example.org",
    "example.net",
    "test.com",
    "fake.com",
    "invalid.com",
    "localhost",
    "mailinator.com",
    "tempmail.com",
    "yopmail.com",
    "dummy.com",
  ])
  const blockedLocalParts = new Set([
    "name",
    "user",
    "test",
    "demo",
    "fake",
    "admin",
    "example",
  ])

  if (blockedDomains.has(domain)) {
    throw new Error("Use a real email address. Example and temporary domains are not allowed.")
  }

  if (blockedLocalParts.has(localPart) || localPart.includes("example") || localPart.includes("fake")) {
    throw new Error("Use a real email address, not a placeholder email.")
  }

  return email
}

async function ensureUserTables() {
  const pool = await getDbPool()

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS fullname VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS passwordHash VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS metadata JSON NULL,
      ADD COLUMN IF NOT EXISTS createdBy VARCHAR(64) NULL,
      ADD COLUMN IF NOT EXISTS updatedAt DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS lastLoginAt DATETIME NULL,
      ADD COLUMN IF NOT EXISTS lastLoginIp VARCHAR(64) NULL
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(64) NOT NULL,
      email VARCHAR(255) NOT NULL,
      tokenHash VARCHAR(255) NOT NULL,
      expiresAt DATETIME NOT NULL,
      usedAt DATETIME NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_reset_email (email),
      INDEX idx_password_reset_user (userId)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS login_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(64) NOT NULL,
      email VARCHAR(255) NOT NULL,
      loginAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ipAddress VARCHAR(64) NULL,
      userAgent TEXT NULL,
      emailSent TINYINT(1) NOT NULL DEFAULT 0,
      details TEXT NULL,
      INDEX idx_login_events_user (userId),
      INDEX idx_login_events_email (email)
    )
  `)
}

export async function listUsers() {
  await ensureUserTables()
  const pool = await getDbPool()
  const [rows] = await pool.query(`
    SELECT id, email, role, name, fullname, department, station, badge, isActive, publicKey, privateKey, metadata, createdAt, updatedAt, lastLoginAt
    FROM users
    ORDER BY role, fullname, name, email
  `)

  return (rows as DbUserRow[]).map(mapUser)
}

export async function getUserOverview() {
  const users = await listUsers()

  const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {})

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.isActive).length,
    inactiveUsers: users.filter((user) => !user.isActive).length,
    roleCounts,
    users,
  }
}

export async function createUser(input: CreateUserInput, createdBy?: string | null) {
  await ensureUserTables()

  const email = validateRealEmailAddress(input.email)
  const role = toCanonicalRole(input.role)
  const fullName = String(input.fullname || input.name || "").trim()
  const shortName = String(input.name || fullName || email).trim()
  const password = String(input.password || "password123")

  if (!email) {
    throw new Error("Email is required.")
  }

  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long.")
  }

  if (!fullName) {
    throw new Error("Full name is required.")
  }

  const pool = await getDbPool()
  const [existingRows] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email])
  if (Array.isArray(existingRows) && existingRows.length > 0) {
    throw new Error("A user with that email already exists.")
  }

  const wallet = ethers.Wallet.createRandom()
  const passwordHash = await bcrypt.hash(password, 10)
  const id = makeUserId(role)
  const metadata = normalizeUserMetadata(input.metadata, createdBy)

  const blockchainMeta: Record<string, any> = {}
  try {
    const anchorResult = await anchorCaseOnChain({
      recordId: id,
      caseData: {
        email,
        role,
        fullname: fullName,
        department: input.department ?? null,
        station: input.station ?? null,
        badge: input.badge ?? null,
      },
      action: "USER_CREATED",
    })
    blockchainMeta.anchor = anchorResult
  } catch (error: any) {
    blockchainMeta.anchorError = error?.message || "Blockchain anchor unavailable"
  }

  const storedMetadata = {
    ...metadata,
    system: {
      ...(metadata.system ?? {}),
      blockchainAnchorStatus: blockchainMeta.anchor ? "Anchored" : (metadata.system?.blockchainAnchorStatus ?? "Pending"),
    },
    blockchain: blockchainMeta,
  }

  await pool.query(
    `
      INSERT INTO users
        (id, role, name, fullname, email, department, station, badge, isActive, publicKey, privateKey, createdAt, updatedAt, createdBy, passwordHash, metadata)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?)
    `,
    [
      id,
      role,
      shortName,
      fullName,
      email,
      input.department ?? null,
      input.station ?? null,
      input.badge ?? null,
      input.isActive === false ? 0 : 1,
      wallet.address,
      wallet.privateKey,
      createdBy ?? null,
      passwordHash,
      JSON.stringify(storedMetadata),
    ]
  )

  return {
    user: {
      id,
      email,
      role,
      name: shortName,
      fullname: fullName,
      department: input.department ?? null,
      station: input.station ?? null,
      badge: input.badge ?? null,
      isActive: input.isActive === false ? false : true,
      publicKey: wallet.address,
      privateKey: wallet.privateKey,
      metadata: storedMetadata,
      updatedAt: new Date().toISOString(),
    } satisfies AppUserRecord,
    temporaryPassword: password,
  }
}

export async function markSuccessfulLogin(params: {
  userId: string
  email: string
  displayName: string
  ipAddress?: string | null
  userAgent?: string | null
}) {
  await ensureUserTables()
  const pool = await getDbPool()
  const loginAt = new Date().toISOString()

  let emailSent = 0
  let emailDetails = "notification skipped"

  try {
    const result = await sendLoginNotificationEmail({
      to: params.email,
      displayName: params.displayName,
      loginAt,
      ipAddress: params.ipAddress,
    })
    emailSent = result.ok ? 1 : 0
    emailDetails = result.ok ? "sent" : result.reason || "notification skipped"
  } catch (error: any) {
    emailDetails = error?.message || "notification failed"
  }

  await pool.query(
    `
      UPDATE users
      SET lastLoginAt = NOW(), lastLoginIp = ?
      WHERE id = ?
    `,
    [params.ipAddress ?? null, params.userId]
  )

  await pool.query(
    `
      INSERT INTO login_events (userId, email, ipAddress, userAgent, emailSent, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      params.userId,
      params.email,
      params.ipAddress ?? null,
      params.userAgent ?? null,
      emailSent,
      emailDetails,
    ]
  )
}

export async function requestPasswordReset(emailRaw: string) {
  await ensureUserTables()
  const email = String(emailRaw || "").trim().toLowerCase()
  const pool = await getDbPool()
  const [rows] = await pool.query(
    `
      SELECT id, email, name, fullname
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  )

  const row = Array.isArray(rows) && rows.length > 0 ? (rows[0] as any) : null

  if (!row) {
    return { ok: true as const, previewResetUrl: null }
  }

  const plainToken = randomUUID() + randomUUID()
  const tokenHash = await bcrypt.hash(plainToken, 10)
  const resetUrl = buildResetUrl(plainToken)

  await pool.query(
    `
      INSERT INTO password_reset_tokens (userId, email, tokenHash, expiresAt)
      VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))
    `,
    [row.id, row.email, tokenHash]
  )

  let previewResetUrl: string | null = null

  try {
    const result = await sendPasswordResetEmail({
      to: row.email,
      displayName: row.fullname || row.name || row.email,
      resetUrl,
    })

    if (!result.ok && process.env.NODE_ENV !== "production") {
      previewResetUrl = resetUrl
    }
  } catch {
    if (process.env.NODE_ENV !== "production") {
      previewResetUrl = resetUrl
    }
  }

  return { ok: true as const, previewResetUrl }
}

export async function resetPassword(token: string, password: string) {
  await ensureUserTables()

  if (!token) {
    throw new Error("Reset token is required.")
  }

  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long.")
  }

  const pool = await getDbPool()
  const [rows] = await pool.query(
    `
      SELECT id, userId, tokenHash
      FROM password_reset_tokens
      WHERE usedAt IS NULL
        AND expiresAt > NOW()
      ORDER BY createdAt DESC
    `
  )

  const match = Array.isArray(rows)
    ? await (async () => {
        for (const row of rows as any[]) {
          const ok = await bcrypt.compare(token, row.tokenHash)
          if (ok) return row
        }
        return null
      })()
    : null

  if (!match) {
    throw new Error("This reset link is invalid or has expired.")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await pool.query("UPDATE users SET passwordHash = ? WHERE id = ?", [passwordHash, match.userId])
  await pool.query("UPDATE password_reset_tokens SET usedAt = NOW() WHERE id = ?", [match.id])
}
