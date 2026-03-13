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
  console.error("Missing SSL CA path env var. Set DB_SSL_CA (or TIDB_SSL_CA) in .env.local/.env")
  process.exit(1)
}

const caPath = path.isAbsolute(caRel) ? caRel : path.join(process.cwd(), caRel)
if (!fs.existsSync(caPath)) {
  console.error("SSL CA file not found at:", caPath)
  process.exit(1)
}

const users = [
  { id: "u_admin", role: "ADMIN", name: "System Admin", fullname: "System Admin", email: "admin@bejas.local", department: "ADMIN", station: "HQ", badge: "0001" },

  { id: "u_dpp_prosecutor_1", role: "DPP_PROSECUTOR", name: "DPP Prosecutor 1", fullname: "DPP Prosecutor 1", email: "dpp.prosecutor1@bejas.local", department: "DPP", station: "HQ", badge: "DPP-0001" },
  { id: "u_dpp_registry_1", role: "DPP_REGISTRY", name: "DPP Registry 1", fullname: "DPP Registry 1", email: "dpp.registry1@bejas.local", department: "DPP", station: "HQ", badge: "DPP-REG-0001" },

  { id: "u_high_assist_registry_1", role: "HIGH_ASSIST_REGISTRY", name: "High Assistant Registry 1", fullname: "High Assistant Registry 1", email: "high.assist1@bejas.local", department: "HIGH_COURT", station: "HQ", badge: "HC-AR-0001" },
  { id: "u_high_registry_1", role: "HIGH_REGISTRY", name: "High Court Registry 1", fullname: "High Court Registry 1", email: "high.registry1@bejas.local", department: "HIGH_COURT", station: "HQ", badge: "HC-R-0001" },

  { id: "u_judge_1", role: "JUDGE", name: "High Court Judge 1", fullname: "High Court Judge 1", email: "judge1@bejas.local", department: "HIGH_COURT", station: "HQ", badge: "J-0001" },

  { id: "u_magistrate_1", role: "MAGISTRATE", name: "Magistrate 1", fullname: "Magistrate 1", email: "magistrate1@bejas.local", department: "MAG_COURT", station: "HQ", badge: "M-0001" },
  { id: "u_mag_assist_registry_1", role: "MAG_ASSIST_REGISTRY", name: "Mag Assistant Registry 1", fullname: "Mag Assistant Registry 1", email: "mag.assist1@bejas.local", department: "MAG_COURT", station: "HQ", badge: "MC-AR-0001" },
  { id: "u_mag_registry_1", role: "MAG_REGISTRY", name: "Magistrate Registry 1", fullname: "Magistrate Registry 1", email: "mag.registry1@bejas.local", department: "MAG_COURT", station: "HQ", badge: "MC-R-0001" },

  { id: "u_police_investigator_1", role: "POLICE_INVESTIGATOR", name: "Police Investigator 1", fullname: "Police Investigator 1", email: "police.investigator1@bejas.local", department: "POLICE", station: "HQ", badge: "P-INV-0001" },
  { id: "u_police_registry_1", role: "POLICE_REGISTRY", name: "Police Registry 1", fullname: "Police Registry 1", email: "police.registry1@bejas.local", department: "POLICE", station: "HQ", badge: "P-REG-0001" },
]

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
      ca: fs.readFileSync(caPath, "utf8"),
      rejectUnauthorized: !insecure,
    },
  })

  const sql = `
INSERT INTO users
  (id, role, name, email, department, station, badge, isActive, publicKey, privateKey, createdAt, createdBy, passwordHash, fullname)
VALUES
  (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, NOW(), 'u_admin', NULL, ?)
ON DUPLICATE KEY UPDATE
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
