const mysql = require("mysql2/promise");
const fs = require("fs");
const dns = require("dns");
require("dotenv").config({ path: ".env.local" });

try { dns.setDefaultResultOrder("ipv4first"); } catch {}

async function main() {
  const q = process.argv.slice(2).join(" ").trim();
  if (!q) {
    console.error('Usage: node scripts/sql.cjs "SELECT 1"');
    process.exit(2);
  }

  const host = process.env.TIDB_HOST || process.env.DB_HOST;
  const port = Number(process.env.TIDB_PORT || process.env.DB_PORT || 4000);
  const user = process.env.TIDB_USER || process.env.DB_USER;
  const password = process.env.TIDB_PASSWORD || process.env.DB_PASSWORD;
  const database = process.env.TIDB_DATABASE || process.env.DB_NAME;

  const caPath = process.env.TIDB_SSL_CA || process.env.DB_SSL_CA;
  const ssl = caPath
    ? {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: String(process.env.DB_SSL_REJECT_UNAUTHORIZED ?? "true").toLowerCase() === "true",
        servername: host,
      }
    : undefined;

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl,
    connectTimeout: 20000,
  });

  const [rows] = await conn.query(q);
  if (Array.isArray(rows)) console.table(rows);
  else console.log(rows);

  await conn.end();
}

main().catch((e) => {
  console.error("SQL ERROR:", e?.code || "", e?.message || e);
  process.exit(1);
});
