import fs from "fs";
import mysql from "mysql2/promise";

const host = process.env.TIDB_HOST || process.env.DB_HOST;
const port = Number(process.env.TIDB_PORT || process.env.DB_PORT || 4000);
const user = process.env.TIDB_USER || process.env.DB_USER;
const password = process.env.TIDB_PASSWORD || process.env.DB_PASSWORD;
const database = process.env.TIDB_DATABASE || process.env.DB_NAME;
const caPath = process.env.TIDB_CA || process.env.DB_CA || "certs/tidb-ca.pem";

const ca = fs.readFileSync(caPath, "utf8");

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  ssl: {
    ca,
    rejectUnauthorized: true,
    servername: host,
    minVersion: "TLSv1.2",
  },
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 15000,
});

async function main() {
  // 1) create a demo table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS demo_events (
      id BIGINT PRIMARY KEY AUTO_RANDOM,
      name VARCHAR(255) NOT NULL,
      payload JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2) insert one row (safe parameterized)
  const name = "hello-from-terminal";
  const payload = { ok: true, ts: new Date().toISOString() };

  const [result] = await pool.execute(
    "INSERT INTO demo_events (name, payload) VALUES (?, ?)",
    [name, JSON.stringify(payload)]
  );

  console.log("✅ Inserted row. insertId:", result.insertId);

  // 3) read back latest rows
  const [rows] = await pool.query(
    "SELECT id, name, created_at FROM demo_events ORDER BY created_at DESC LIMIT 5"
  );

  console.table(rows);
  await pool.end();
}

main().catch((e) => {
  console.error("❌ Insert failed:", e.code, e.message);
  process.exit(1);
});
