require("dotenv").config({ path: ".env.local" })
require("dotenv").config({ path: ".env" })

const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")
const dns = require("dns")
const { USERS: users } = require("./user-directory.cjs")

try { dns.setDefaultResultOrder("ipv4first") } catch {}

function envAny(...keys) {
  for (const key of keys) {
    const value = process.env[key]
    if (value && String(value).trim()) return String(value).trim()
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

async function main() {
  if (!host || !user || !password || !database) {
    throw new Error("Missing DB env vars. Need host/user/password/database.")
  }

  if (!caRel) {
    throw new Error("Missing SSL CA path env var. Set DB_SSL_CA or TIDB_SSL_CA.")
  }

  const caPath = path.isAbsolute(caRel) ? caRel : path.join(process.cwd(), caRel)
  if (!fs.existsSync(caPath)) {
    throw new Error(`SSL CA file not found at: ${caPath}`)
  }

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

  try {
    for (const userRecord of users) {
      await conn.execute(
        `
        UPDATE users
        SET email = ?, role = ?, name = ?, fullname = ?, department = ?, station = ?, badge = ?, isActive = 1
        WHERE id = ?
        `,
        [
          userRecord.email,
          userRecord.role,
          userRecord.name,
          userRecord.fullname,
          userRecord.department,
          userRecord.station,
          userRecord.badge,
          userRecord.id,
        ]
      )
    }

    const [rows] = await conn.query(
      "SELECT id, email, role FROM users WHERE id IN (?) ORDER BY id",
      [users.map((userRecord) => userRecord.id)]
    )

    console.table(rows)
    console.log("OK: User emails updated.")
  } finally {
    await conn.end()
  }
}

main().catch((error) => {
  console.error("ERROR: Failed to update user emails:", error.message || error)
  process.exit(1)
})
