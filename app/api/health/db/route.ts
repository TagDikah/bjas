import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

/**
 * GET /api/health/db
 * Verifies DB connectivity and returns basic diagnostics (no secrets).
 */
export async function GET() {
  const startedAt = Date.now();

  // Do NOT return passwords/secrets. These values are safe-ish for diagnostics.
  const host = process.env.DB_HOST ?? "<missing>";
  const port = process.env.DB_PORT ?? "<missing>";
  const database = process.env.DB_NAME ?? "<missing>";

  const sslCaPath =
    process.env.DB_SSL_CA ??
    process.env.TIDB_SSL_CA ??
    null;

  const rejectUnauthorized =
    (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? "true").toLowerCase();

  const insecure =
    (process.env.TIDB_SSL_INSECURE ?? "false").toLowerCase();

  try {
    const pool = getDbPool();

    // Lightweight query + server time (useful to verify actual DB response)
    const [pingRows] = await pool.query<any[]>("SELECT 1 AS ok");
    const [nowRows] = await pool.query<any[]>("SELECT NOW() AS serverTime");

    const elapsedMs = Date.now() - startedAt;

    return NextResponse.json(
      {
        ok: true,
        elapsedMs,
        db: {
          host,
          port,
          database,
          tls: {
            enabled: Boolean(sslCaPath), // our lib/db enables SSL when CA is provided
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
    );
  } catch (err: any) {
    const elapsedMs = Date.now() - startedAt;

    // mysql2 errors often have: code, errno, sqlState
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
          "If you see ENOTFOUND: DB_HOST is wrong (or you used 'tidb' outside Docker).",
          "If you see ECONNRESET / HANDSHAKE_SSL_ERROR: SSL CA path is wrong or IP is not allowlisted in TiDB Cloud.",
          "Verify cert exists: Test-Path .\\certs\\letsencrypt-bundle.pem",
          "Verify network: Test-NetConnection <host> -Port 4000",
        ],
      },
      { status: 500 }
    );
  }
}