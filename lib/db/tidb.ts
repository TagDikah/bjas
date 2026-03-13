import mysql from "mysql2/promise";

const host = process.env.TIDB_HOST || process.env.DB_HOST;
const port = Number(process.env.TIDB_PORT || process.env.DB_PORT || 4000);
const user = process.env.TIDB_USER || process.env.DB_USER;
const password = process.env.TIDB_PASSWORD || process.env.DB_PASSWORD;
const database = process.env.TIDB_DATABASE || process.env.DB_NAME;

function must(v: string | undefined, name: string) {
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export const pool = mysql.createPool({
  host: must(host, "TIDB_HOST (or DB_HOST)"),
  port,
  user: must(user, "TIDB_USER (or DB_USER)"),
  password: must(password, "TIDB_PASSWORD (or DB_PASSWORD)"),
  database: must(database, "TIDB_DATABASE (or DB_NAME)"),

  // ✅ TiDB Cloud requires TLS
  ssl: { rejectUnauthorized: true },

  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
