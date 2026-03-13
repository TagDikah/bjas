import "dotenv/config"
import mysql from "mysql2/promise"

function must(n){ const v=process.env[n]; if(!v) throw new Error("Missing env var: "+n); return v; }

const host = must("TIDB_HOST")
const port = Number(process.env.TIDB_PORT || 4000)
const user = must("TIDB_USER")
const password = must("TIDB_PASSWORD")
const database = must("TIDB_DATABASE")

const ssl =
  process.env.TIDB_CA_PATH
    ? { ca: await (await import("node:fs/promises")).readFile(process.env.TIDB_CA_PATH, "utf8"), rejectUnauthorized: true }
    : { rejectUnauthorized: true }

const pool = mysql.createPool({ host, port, user, password, database, ssl, connectionLimit: 5 })

const [rows] = await pool.query("SELECT id,email,role FROM users ORDER BY email")
console.table(rows)

await pool.end()
