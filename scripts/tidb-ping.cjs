const fs = require("fs");
const mysql = require("mysql2/promise");

(async () => {
  const {
    DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL_CA
  } = process.env;

  console.log("HOST:", DB_HOST);
  console.log("PORT:", DB_PORT);
  console.log("USER:", DB_USER);
  console.log("DB  :", DB_NAME);
  console.log("CA  :", DB_SSL_CA, "exists:", DB_SSL_CA ? fs.existsSync(DB_SSL_CA) : false);

  try {
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: DB_SSL_CA ? { ca: fs.readFileSync(DB_SSL_CA) } : { rejectUnauthorized: true },
    });
    const [rows] = await conn.query("SELECT 1 AS ok");
    console.log("✅ Connected:", rows);
    await conn.end();
  } catch (e) {
    console.error("❌ Connect failed:");
    console.error("CODE:", e.code);
    console.error("MSG :", e.message);
    process.exit(1);
  }
})();
