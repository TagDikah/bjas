import mysql from "mysql2/promise";
import crypto from "crypto";
let bcrypt = null;
try { bcrypt = await import("bcryptjs"); } catch {}

function must(n){ const v=process.env[n]; if(!v) throw new Error("Missing "+n); return v; }

const cfg = {
  host: must("TIDB_HOST"),
  port: Number(process.env.TIDB_PORT || 4000),
  user: must("TIDB_USER"),
  password: must("TIDB_PASSWORD"),
  database: must("TIDB_DATABASE"),
  ssl: { rejectUnauthorized: true },
};

function strongPassword() {
  const base = crypto.randomBytes(9).toString("base64url");
  return `Bejas!${base}2026`;
}
async function hashPassword(pw) {
  if (bcrypt?.hash) return await bcrypt.hash(pw, 10);
  return crypto.createHash("sha256").update(pw).digest("hex");
}

(async () => {
  const c = await mysql.createConnection(cfg);
  const [users] = await c.query("SELECT id, email, role, name FROM users ORDER BY role, id");

  const out = [];
  for (const u of users) {
    const pw = strongPassword();
    const hash = await hashPassword(pw);
    await c.execute("UPDATE users SET passwordHash=? WHERE id=?", [hash, u.id]);
    out.push({ id: u.id, role: u.role, name: u.name, email: u.email, password: pw, hashType: bcrypt?.hash ? "bcrypt" : "sha256" });
  }

  console.log("✅ App user logins (SAVE THIS NOW):");
  console.table(out);

  await c.end();
})().catch(e => { console.error("❌ seed passwords failed:", e?.message||e); process.exit(1); });
