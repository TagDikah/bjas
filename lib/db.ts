import mysql from "mysql2/promise"
import { readEnv, readFileText, readPathEnv, readRequiredEnv } from "@/lib/server/env"

function toBool(v: string | undefined, fallback: boolean) {
  if (v == null) return fallback
  return ["1", "true", "yes", "y", "on"].includes(String(v).trim().toLowerCase())
}

// Presentation note: this helper loads the TiDB SSL certificate so the app can connect securely in cloud environments.
function readCaIfProvided(caPathRaw: string | undefined) {
  if (!caPathRaw) return undefined
  return readFileText(caPathRaw)
}

type DbRuntimeConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
  ssl?: {
    ca: string
    rejectUnauthorized: boolean
  }
}

function getDbRuntimeConfig(): DbRuntimeConfig {
  const DB_HOST = readRequiredEnv("DB_HOST")
  const DB_PORT = readRequiredEnv("DB_PORT", { fallback: "4000" })
  const DB_USER = readRequiredEnv("DB_USER")
  const DB_PASSWORD = readRequiredEnv("DB_PASSWORD")
  const DB_NAME = readRequiredEnv("DB_NAME")
  const DB_SSL_CA = readPathEnv("DB_SSL_CA")
  const DB_SSL_REJECT_UNAUTHORIZED = readEnv("DB_SSL_REJECT_UNAUTHORIZED", {
    fallback: "true",
  })
  const TIDB_SSL_CA = readPathEnv("TIDB_SSL_CA")
  const TIDB_SSL_INSECURE = readEnv("TIDB_SSL_INSECURE", {
    fallback: "false",
  })

  const rejectUnauthorized = toBool(DB_SSL_REJECT_UNAUTHORIZED, true)
  const insecure = toBool(TIDB_SSL_INSECURE, false)
  const finalRejectUnauthorized = insecure ? false : rejectUnauthorized
  const caText = readCaIfProvided(DB_SSL_CA || TIDB_SSL_CA)

  return {
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: caText
      ? { ca: caText, rejectUnauthorized: finalRejectUnauthorized }
      : undefined,
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined
}

export function getDbPool() {
  // Presentation note: this is the single shared database connection pool used by the API routes and server services.
  if (!global.__mysqlPool) {
    const config = getDbRuntimeConfig()
    global.__mysqlPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,

      // Important for serverless / dev hot-reload
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,

      // TLS
      ssl: config.ssl,

      // Optional: helps keep connections stable
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    })
  }
  return global.__mysqlPool
}
