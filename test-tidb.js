import "dotenv/config";
import mysql from "mysql2/promise";

const host = process.env.TIDB_HOST;
const port = Number(process.env.TIDB_PORT || "4000");
const user = process.env.TIDB_USER;
const password = process.env.TIDB_PASSWORD;
const database = process.env.TIDB_DATABASE;

if (!host || !user || !password || !database) {
  console.error("Missing env vars:", { host, user, database, hasPassword: !!password });
  process.exit(1);
}

async function main() {
  console.log("🔎 Using:", { host, port, user, database, ssl: "ON", tls: "1.2 forced", verify: "OFF (diagnostic)" });

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    connectTimeout: 20000,
    enableKeepAlive: true,
    ssl: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
      maxVersion: "TLSv1.2",
      servername: host,
    },
  });

  const [rows] = await conn.query("SELECT 1 AS ok");
  console.log("✅ Connected:", rows);
  await conn.end();
}

main().catch((err) => {
  console.error("CONNECTION ERROR:", err.code || err.name, err.message);
  process.exit(1);
});
