import mysql from "mysql2/promise";

function must(name){
  const v = process.env[name];
  if(!v) throw new Error("Missing " + name);
  return v;
}

const rootCfg = {
  host: must("TIDB_HOST"),
  port: Number(process.env.TIDB_PORT || 4000),
  user: must("TIDB_USER"),
  password: must("TIDB_PASSWORD"),
  database: must("TIDB_DATABASE"),
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
};

const PREFIX = "rEdjoJDR96UYpUa";
const U = {
  police: PREFIX + ".bejas_police",
  dpp:    PREFIX + ".bejas_dpp",
  court:  PREFIX + ".bejas_court",
  admin:  PREFIX + ".bejas_admin",
};

(async () => {
  const c = await mysql.createConnection(rootCfg);

  // 🔐 CHANGE THESE PASSWORDS (strong)
  const policePwd = "PoliceStrongPass!2026";
  const dppPwd    = "DppStrongPass!2026";
  const courtPwd  = "CourtStrongPass!2026";
  const adminPwd  = "AdminStrongPass!2026";

  const db = must("TIDB_DATABASE");

  // TiDB Cloud-safe: avoid ALL PRIVILEGES / REVOKE ALL / FLUSH PRIVILEGES
  const stmts = [
    "SELECT 'creating users...' AS step",

    "CREATE USER IF NOT EXISTS '" + U.police + "' IDENTIFIED BY '" + policePwd + "'",
    "CREATE USER IF NOT EXISTS '" + U.dpp    + "' IDENTIFIED BY '" + dppPwd    + "'",
    "CREATE USER IF NOT EXISTS '" + U.court  + "' IDENTIFIED BY '" + courtPwd  + "'",
    "CREATE USER IF NOT EXISTS '" + U.admin  + "' IDENTIFIED BY '" + adminPwd  + "'",

    // Admin (DB-scoped)
    "GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON `" + db + "`.* TO '" + U.admin + "'",

    // Police
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.users TO '" + U.police + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.cases TO '" + U.police + "'",
    "GRANT SELECT, INSERT ON `" + db + "`.audit_entries TO '" + U.police + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.case_parties TO '" + U.police + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.statements TO '" + U.police + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.evidence_items TO '" + U.police + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.exhibits TO '" + U.police + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.chain_transfers TO '" + U.police + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.case_assignments TO '" + U.police + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.case_events TO '" + U.police + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.file_registry TO '" + U.police + "'",

    // DPP
    "GRANT SELECT ON `" + db + "`.users TO '" + U.dpp + "'",
    "GRANT SELECT, UPDATE ON `" + db + "`.cases TO '" + U.dpp + "'",
    "GRANT SELECT, INSERT ON `" + db + "`.audit_entries TO '" + U.dpp + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.case_assignments TO '" + U.dpp + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.case_events TO '" + U.dpp + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.file_registry TO '" + U.dpp + "'",
    "GRANT SELECT ON `" + db + "`.evidence_items TO '" + U.dpp + "'",
    "GRANT SELECT ON `" + db + "`.statements TO '" + U.dpp + "'",
    "GRANT SELECT ON `" + db + "`.case_parties TO '" + U.dpp + "'",
    "GRANT SELECT ON `" + db + "`.exhibits TO '" + U.dpp + "'",
    "GRANT SELECT ON `" + db + "`.chain_transfers TO '" + U.dpp + "'",

    // Court
    "GRANT SELECT ON `" + db + "`.users TO '" + U.court + "'",
    "GRANT SELECT, UPDATE ON `" + db + "`.cases TO '" + U.court + "'",
    "GRANT SELECT, INSERT ON `" + db + "`.audit_entries TO '" + U.court + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.case_events TO '" + U.court + "'",
    "GRANT SELECT, INSERT, UPDATE ON `" + db + "`.file_registry TO '" + U.court + "'",
    "GRANT SELECT ON `" + db + "`.evidence_items TO '" + U.court + "'",
    "GRANT SELECT ON `" + db + "`.statements TO '" + U.court + "'",
    "GRANT SELECT ON `" + db + "`.case_parties TO '" + U.court + "'",
    "GRANT SELECT ON `" + db + "`.exhibits TO '" + U.court + "'",
    "GRANT SELECT ON `" + db + "`.chain_transfers TO '" + U.court + "'",
  ];

  for (const s of stmts) {
    await c.query(s);
  }

  console.log("✅ Grants applied (TiDB Cloud-safe).");
  console.log("DB users:");
  console.log(" -", U.admin,  " / AdminStrongPass!2026");
  console.log(" -", U.police, " / PoliceStrongPass!2026");
  console.log(" -", U.dpp,    " / DppStrongPass!2026");
  console.log(" -", U.court,  " / CourtStrongPass!2026");

  await c.end();
})().catch(e => {
  console.error("❌ grants failed:", e?.message || e);
  process.exit(1);
});
