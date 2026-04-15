require("dotenv").config({ path: ".env.local" })
require("dotenv").config({ path: ".env" })

const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
const fs = require("fs")
const path = require("path")

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

const caRel = envAny("DB_SSL_CA", "TIDB_SSL_CA")
const insecure = (envAny("DB_SSL_INSECURE", "TIDB_SSL_INSECURE") || "false").toLowerCase() === "true"

if (!host || !user || !password || !database) {
  console.error("Missing DB env vars. Need host/user/password/database.")
  console.error({ host, user, database, port })
  process.exit(1)
}

if (!caRel) {
  console.error("Missing SSL CA path env var. Set DB_SSL_CA (or TIDB_SSL_CA).")
  process.exit(1)
}

const caPath = path.isAbsolute(caRel) ? caRel : path.join(process.cwd(), caRel)
if (!fs.existsSync(caPath)) {
  console.error("SSL CA file not found at:", caPath)
  process.exit(1)
}

const emails = [
  "system.admin@justice.gov.ls",
  "police.admin@police.gov.ls",
  "police.commissioner@police.gov.ls",
  "police.investigator1@police.gov.ls",
  "police.registry1@police.gov.ls",
  "dpp.admin@justice.gov.ls",
  "dpp.prosecutor1@justice.gov.ls",
  "dpp.registry1@justice.gov.ls",
  "court.admin@judiciary.gov.ls",
  "high.assistant.registry1@judiciary.gov.ls",
  "high.registry1@judiciary.gov.ls",
  "judge1@judiciary.gov.ls",
  "judge.clerk1@judiciary.gov.ls",
  "magistrate1@judiciary.gov.ls",
  "mag.assistant.registry1@judiciary.gov.ls",
  "mag.registry1@judiciary.gov.ls",
]

async function main() {
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: {
      ca: fs.readFileSync(caPath, "utf8"),
      rejectUnauthorized: !insecure,
    },
  })

  const plain = "password123"
  const hash = await bcrypt.hash(plain, 10)

  for (const email of emails) {
    const [res] = await conn.execute(
      "UPDATE users SET passwordHash=?, isActive=1 WHERE email=?",
      [hash, email]
    )
    console.log(email, "affectedRows=", res.affectedRows, "changedRows=", res.changedRows)
  }

  await conn.end()
  console.log("✅ All passwords set to:", plain)
}

main().catch((e) => {
  console.error("❌ set-password failed:", e)
  process.exit(1)
})
