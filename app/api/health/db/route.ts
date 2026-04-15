import { NextResponse } from "next/server"
import { getDbPool } from "@/lib/db"
import { readEnv, readPathEnv } from "@/lib/server/env"

/**
 * GET /api/health/db
 * Verifies DB connectivity and returns basic diagnostics (no secrets).
 */
export async function GET() {
  const startedAt = Date.now()

  // Do NOT return passwords/secrets. These values are safe-ish for diagnostics.
  const host = readEnv("DB_HOST") ?? "<missing>"
  const port = readEnv("DB_PORT") ?? "<missing>"
  const database = readEnv("DB_NAME") ?? "<missing>"

  const sslCaPath = readPathEnv("DB_SSL_CA") ?? readPathEnv("TIDB_SSL_CA") ?? null

  const rejectUnauthorized = (
    readEnv("DB_SSL_REJECT_UNAUTHORIZED", {
      fallback: "true",
    }) ?? "true"
  ).toLowerCase()

  const insecure = (
    readEnv("TIDB_SSL_INSECURE", {
      fallback: "false",
    }) ?? "false"
  ).toLowerCase()

  try {
    const pool = getDbPool()

    // Lightweight query + server time (useful to verify actual DB response)
    const [pingRows] = await pool.query<any[]>("SELECT 1 AS ok")
    const [nowRows] = await pool.query<any[]>("SELECT NOW() AS serverTime")

    const elapsedMs = Date.now() - startedAt

    return NextResponse.json(
      {
        ok: true,
        elapsedMs,
        db: {
          host,
          port,
          database,
          tls: {
            enabled: Boolean(sslCaPath),
            caPath: sslCaPath,
            rejectUnauthorized,
            insecure,
          },
        },
        result: {
          ping: pingRows?.[0] ?? null,
          serverTime: nowRows?.[0]?.serverTime ?? null,
        },
      },
      { status: 200 }
    )
  } catch (err: any) {
    const elapsedMs = Date.now() - startedAt

    return NextResponse.json(
      {
        ok: false,
        elapsedMs,
        db: { host, port, database },
        error: {
          name: err?.name ?? "Error",
          code: err?.code ?? null,
          errno: err?.errno ?? null,
          sqlState: err?.sqlState ?? null,
          message: err?.message ?? String(err),
        },
        hints: [
          "If you see ENOTFOUND: DB_HOST is wrong.",
          "If you see ECONNRESET or HANDSHAKE_SSL_ERROR: verify the DB CA secret file and network allowlist.",
          "For Docker secrets, confirm DB_PASSWORD_FILE and DB_SSL_CA_FILE are mounted.",
        ],
      },
      { status: 500 }
    )
  }
}
