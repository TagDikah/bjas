/**
 * Seed/Upsert all BEJAS demo users so they exist in the `users` table.
 * - Safe to re-run
 * - Uses TLS (required by TiDB Cloud Serverless)
 */
require("dotenv").config({ path: ".env.local" })
require("dotenv").config({ path: ".env" })

const mysql = require("mysql2/promise")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const dns = require("dns")
const { USERS: users } = require("./user-directory.cjs")

try { dns.setDefaultResultOrder("ipv4first") } catch {}

function envAny(...keys) {
  for (const k of keys) {
    const v = process.env[k]
    if (v && String(v).trim()) return String(v).trim()
  }
  return ""
}

const host = envAny("DB_HOST", "TIDB_HOST")
const port = Number(envAny("DB_PORT", "TIDB_PORT") || "4000")
const user = envAny("DB_USER", "TIDB_USER")
const password = envAny("DB_PASSWORD", "TIDB_PASSWORD")
const database = envAny("DB_NAME", "TIDB_DATABASE", "DB_DATABASE")

const caRel = envAny("DB_SSL_CA", "TIDB_SSL_CA", "TIDB_CA")
const rejectUnauthorized = (envAny("DB_SSL_REJECT_UNAUTHORIZED") || "true").toLowerCase() === "true"
const insecure = (envAny("DB_SSL_INSECURE", "TIDB_SSL_INSECURE") || "false").toLowerCase() === "true"

if (!host || !user || !password || !database) {
  console.error("Missing DB env vars. Need host/user/password/database.")
  console.error({ host, user, database, port })
  process.exit(1)
}

if (!caRel) {
  console.error("Missing SSL CA path env var. Set DB_SSL_CA (or TIDB_SSL_CA) in .env.local/.env")
  process.exit(1)
}

const caPath = path.isAbsolute(caRel) ? caRel : path.join(process.cwd(), caRel)
if (!fs.existsSync(caPath)) {
  console.error("SSL CA file not found at:", caPath)
  process.exit(1)
}

function hex32() {
  return crypto.randomBytes(32).toString("hex")
}

async function main() {
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: insecure ? false : rejectUnauthorized,
      servername: host,
    },
    connectTimeout: 20000,
  })

  const sql = `
INSERT INTO users
  (id, role, name, email, department, station, badge, isActive, publicKey, privateKey, createdAt, createdBy, passwordHash, fullname)
VALUES
  (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, NOW(), 'u_admin', NULL, ?)
ON DUPLICATE KEY UPDATE
  email=VALUES(email),
  role=VALUES(role),
  name=VALUES(name),
  department=VALUES(department),
  station=VALUES(station),
  badge=VALUES(badge),
  isActive=1,
  fullname=VALUES(fullname)
`

  for (const u of users) {
    const pub = hex32()
    const priv = hex32()
    await conn.execute(sql, [u.id, u.role, u.name, u.email, u.department, u.station, u.badge, pub, priv, u.fullname])
  }

  await conn.end()
  console.log("✅ Seed complete.")
}

main().catch((e) => {
  console.error("❌ Seed failed:", e)
  process.exit(1)
})
