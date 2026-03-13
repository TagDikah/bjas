import "dotenv/config";
import mysql from "mysql2/promise";

async function test() {
  try {
    const host = process.env.TIDB_HOST;
    const port = Number(process.env.TIDB_PORT || 4000);
    const user = process.env.TIDB_USER;
    const password = process.env.TIDB_PASSWORD;
    const database = process.env.TIDB_DATABASE;

    if (!host || !user || !password || !database) {
      throw new Error("Missing TIDB env vars. Check .env (TIDB_HOST, TIDB_USER, TIDB_PASSWORD, TIDB_DATABASE).");
    }

    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: true },
    });

    console.log("✅ DB CONNECTED TO TIDB CLOUD");

    const [rows] = await connection.query("SELECT 1 + 1 AS result");
    console.log("Query result:", rows);

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

test();
