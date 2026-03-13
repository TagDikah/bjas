import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const SQL_PATH = path.resolve("db", "offchain.sql");
if (!fs.existsSync(SQL_PATH)) throw new Error(`Could not find ${SQL_PATH}`);

let sql = fs.readFileSync(SQL_PATH, "utf8");
// Strip UTF-8 BOM if present
sql = sql.replace(/^\uFEFF/, "");

const config = {
  host: must("TIDB_HOST"),
  port: Number(process.env.TIDB_PORT || 4000),
  user: must("TIDB_USER"),
  password: must("TIDB_PASSWORD"),
  database: must("TIDB_DATABASE"),
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
};

(async () => {
  console.log("🔐 Connecting to TiDB...");
  const conn = await mysql.createConnection(config);

  console.log("🧱 Applying db/offchain.sql ...");
  await conn.query(sql);

  console.log("✅ Done. Off-chain tables created/updated.");
  await conn.end();
})().catch((e) => {
  console.error("❌ Failed:", e?.message || e);
  process.exit(1);
});
