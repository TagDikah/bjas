import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

function must(n){ const v=process.env[n]; if(!v) throw new Error("Missing "+n); return v; }

const cfg = {
  host: must("TIDB_HOST"),
  port: Number(process.env.TIDB_PORT || 4000),
  user: must("TIDB_USER"),
  password: must("TIDB_PASSWORD"),
  database: must("TIDB_DATABASE"),
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
};

const SQL_PATH = path.resolve("db","rbac.sql");
let sql = fs.readFileSync(SQL_PATH, "utf8").replace(/^\uFEFF/, "");

(async () => {
  const c = await mysql.createConnection(cfg);
  await c.query(sql);
  console.log("✅ RBAC tables created.");
  await c.end();
})().catch(e => { console.error("❌ apply rbac failed:", e?.message||e); process.exit(1); });
