import mysql from "mysql2/promise";
import "dotenv/config";

async function main() {
  const host = process.env.TIDB_HOST;
  const port = Number(process.env.TIDB_PORT ?? 4000);
  const user = process.env.TIDB_USER;
  const password = process.env.TIDB_PASSWORD;
  const database = process.env.TIDB_DATABASE ?? "test";

  console.log("Connecting to TiDB:", { host, port, user, database, ssl: "TEMP_INSECURE_FOR_DIAG" });

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    connectTimeout: 20000,
    ssl: {
      rejectUnauthorized: false,       // TEMP: only to confirm allowlist/handshake
      minVersion: "TLSv1.2",
      servername: host,
      ciphers: "DEFAULT:@SECLEVEL=1"
    }
  });

  const [rows] = await conn.query("SELECT VERSION() AS version, NOW() AS now");
  console.log(" Connected OK:", rows);
  await conn.end();
}

main().catch((err) => {
  console.error(" TiDB connection FAILED");
  console.error("Name:", err?.name);
  console.error("Code:", err?.code);
  console.error("Errno:", err?.errno);
  console.error("Message:", err?.message);
  console.error(err);
  process.exit(1);
});
