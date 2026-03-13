import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";

function toBool(v: string | undefined, fallback: boolean) {
  if (v == null) return fallback;
  return ["1", "true", "yes", "y", "on"].includes(String(v).trim().toLowerCase());
}

function readCaIfProvided(caPathRaw: string | undefined) {
  if (!caPathRaw) return undefined;

  // Allow forward/back slashes; resolve relative to project root (process.cwd()).
  const normalized = caPathRaw.replace(/\\/g, "/");
  const abs = path.isAbsolute(normalized) ? normalized : path.resolve(process.cwd(), normalized);

  if (!fs.existsSync(abs)) {
    throw new Error(
      `SSL CA file not found at: ${abs}\n` +
      `Fix your env var DB_SSL_CA / TIDB_SSL_CA path, or place the file there.`
    );
  }

  return fs.readFileSync(abs, "utf8");
}

// Next.js loads .env and .env.local automatically.
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,

  // SSL controls for app runtime
  DB_SSL_CA,
  DB_SSL_REJECT_UNAUTHORIZED,

  // Optional legacy names you already have
  TIDB_SSL_CA,
  TIDB_SSL_INSECURE,
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error(
    "Missing DB env vars. Required: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME"
  );
}

const rejectUnauthorized = toBool(DB_SSL_REJECT_UNAUTHORIZED, true);
const insecure = toBool(TIDB_SSL_INSECURE, false);

// If insecure=true, we override rejectUnauthorized to false
const finalRejectUnauthorized = insecure ? false : rejectUnauthorized;

const caText = readCaIfProvided(DB_SSL_CA || TIDB_SSL_CA);

// Build SSL config only if CA is provided OR if you want TLS without custom CA
// For TiDB Cloud, providing the CA is recommended.
const ssl =
  caText
    ? { ca: caText, rejectUnauthorized: finalRejectUnauthorized }
    : undefined;

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

export function getDbPool() {
  if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,

      // Important for serverless / dev hot-reload
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,

      // TLS
      ssl,

      // Optional: helps keep connections stable
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return global.__mysqlPool;
}
