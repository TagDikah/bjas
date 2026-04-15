import mysql from "mysql2/promise"
import { readEnv } from "@/lib/server/env"

const host = readEnv("TIDB_HOST") || readEnv("DB_HOST")
const port = Number(readEnv("TIDB_PORT") || readEnv("DB_PORT", { fallback: "4000" }))
const user = readEnv("TIDB_USER") || readEnv("DB_USER")
const password = readEnv("TIDB_PASSWORD") || readEnv("DB_PASSWORD")
const database = readEnv("TIDB_DATABASE") || readEnv("DB_NAME")

function must(v: string | undefined, name: string) {
  if (!v) throw new Error(`Missing ${name}`)
  return v
}

export const pool = mysql.createPool({
  host: must(host, "TIDB_HOST (or DB_HOST)"),
  port,
  user: must(user, "TIDB_USER (or DB_USER)"),
  password: must(password, "TIDB_PASSWORD (or DB_PASSWORD)"),
  database: must(database, "TIDB_DATABASE (or DB_NAME)"),

  // TiDB Cloud requires TLS.
  ssl: { rejectUnauthorized: true },

  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})
