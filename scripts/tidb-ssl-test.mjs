import fs from "fs";
import mysql from "mysql2/promise";

const host = process.env.TIDB_HOST || process.env.DB_HOST;
const port = Number(process.env.TIDB_PORT || process.env.DB_PORT || 4000);
const user = process.env.TIDB_USER || process.env.DB_USER;
const password = process.env.TIDB_PASSWORD || process.env.DB_PASSWORD;
const database = process.env.TIDB_DATABASE || process.env.DB_NAME;
const caPath = process.env.TIDB_CA || process.env.DB_CA || "certs/tidb-ca.pem";

(async () => {
  const ca = fs.readFileSync(caPath, "utf8");

  try {
    const conn = await mysql.createConnection({
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
      connectTimeout: 15000,
    });

    const [rows] = await conn.query("SELECT VERSION() AS v");
    console.log("Connected. Version:", rows[0].v);
    await conn.end();
  } catch (e) {
    console.error("Connect failed:");
    console.error("CODE:", e.code);
    console.error("MSG :", e.message);
    process.exit(1);
  }
})();
