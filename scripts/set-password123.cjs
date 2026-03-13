require("dotenv").config({ path: ".env.local" })
require("dotenv").config({ path: ".env" })

const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")

function must(n){ const v=process.env[n]; if(!v) throw new Error("Missing env var: "+n); return v; }

async function main(){
  const pool = mysql.createPool({
    host: must("TIDB_HOST"),
    port: Number(process.env.TIDB_PORT || 4000),
    user: must("TIDB_USER"),
    password: must("TIDB_PASSWORD"),
    database: must("TIDB_DATABASE"),
    ssl: process.env.TIDB_CA_PATH ? { ca: require("fs").readFileSync(process.env.TIDB_CA_PATH, "utf8"), rejectUnauthorized: true } : { rejectUnauthorized: true },
    connectionLimit: 5,
  })

  const password = "password123"
  const hash = await bcrypt.hash(password, 10)

  const [users] = await pool.query("SELECT email FROM users WHERE email LIKE '%@bejas.local' ORDER BY email")
  console.log("Setting password123 for", users.length, "users...")

  for (const u of users) {
    const email = String(u.email)
    const [res] = await pool.query("UPDATE users SET passwordHash=? WHERE email=?", [hash, email])
    console.log(email, "affectedRows=", res.affectedRows, "changedRows=", res.changedRows)
  }

  const [check] = await pool.query("SELECT email, LENGTH(passwordHash) pwHashLen FROM users WHERE email LIKE '%@bejas.local' ORDER BY email")
  console.table(check)

  await pool.end()
}

main().catch(e=>{ console.error(e); process.exit(1) })
