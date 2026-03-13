import mysql from "mysql2/promise";
import fs from "fs";

const host = process.env.TIDB_HOST || "gateway01.ap-southeast-1.prod.aws.tidbcloud.com";

const user = process.env.TIDB_USER || "rEdjoJDR96UYpUa.root"; 
const password = process.env.TIDB_PASSWORD || "9h8cAOOHBPigYBzS";
const database = process.env.TIDB_DB || "test"; 

const caPath = process.env.TIDB_CA || "C:/tidb/tidb-ca.pem";

(async () => {
  try {
    const conn = await mysql.createConnection({
      host,
      port: 4000,
      user,
      password,
      database,
      ssl: {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true,
        servername: host,
      },
    });

    const [rows] = await conn.query("SELECT VERSION() AS version, CURRENT_USER() AS user");
    console.log(" CONNECTED OK:", rows[0]);

    await conn.end();
  } catch (e) {
    console.error(" CONNECTION ERROR:", e.code || "", e.message);
    process.exit(1);
  }
})();
