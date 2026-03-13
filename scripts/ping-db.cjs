const mysql = require("mysql2/promise");
const fs = require("fs");
const dns = require("dns");

require("dotenv").config({ path: ".env.local" });

// ✅ Force IPv4 first (fixes many ETIMEDOUT issues on some networks)
try { dns.setDefaultResultOrder("ipv4first"); } catch {}

(async () => {
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
        servername: host, // SNI
      }
    : undefined;

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl,
    connectTimeout: 20000, // 20s
  });

  const [rows] = await conn.query("SELECT 1 AS ok, NOW() AS now");
  console.table(rows);

  await conn.end();
  console.log("✅ DB connection OK");
})().catch((e) => {
  console.error("❌ DB ping FAILED:", e?.code, e?.message || e);
  process.exit(1);
});
