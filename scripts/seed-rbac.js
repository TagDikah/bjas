import mysql from "mysql2/promise";

function must(n){ const v=process.env[n]; if(!v) throw new Error("Missing "+n); return v; }

const cfg = {
  host: must("TIDB_HOST"),
  port: Number(process.env.TIDB_PORT || 4000),
  user: must("TIDB_USER"),
  password: must("TIDB_PASSWORD"),
  database: must("TIDB_DATABASE"),
  ssl: { rejectUnauthorized: true },
};

const PERMS = [
  ["CASE_CREATE","Create new case"],
  ["CASE_VIEW","View case"],
  ["CASE_UPDATE","Update case"],
  ["CASE_ASSIGN","Assign case"],
  ["CASE_ROUTE","Route case between departments"],
  ["STATEMENT_ADD","Add statement"],
  ["EVIDENCE_ADD","Add evidence metadata"],
  ["EXHIBIT_CREATE","Create exhibit record"],
  ["EXHIBIT_TRANSFER","Transfer exhibit custody"],
  ["COURT_EVENT_ADD","Add court/workflow event"],
  ["FILE_UPLOAD","Add file_registry records"],
  ["AUDIT_WRITE","Write audit log"],
  ["USER_MANAGE","Manage users"],
];

const ROLE_MAP = {
  ADMIN: ["CASE_CREATE","CASE_VIEW","CASE_UPDATE","CASE_ASSIGN","CASE_ROUTE","STATEMENT_ADD","EVIDENCE_ADD","EXHIBIT_CREATE","EXHIBIT_TRANSFER","COURT_EVENT_ADD","FILE_UPLOAD","AUDIT_WRITE","USER_MANAGE"],

  POLICE_REGISTRY: ["CASE_CREATE","CASE_VIEW","CASE_UPDATE","CASE_ASSIGN","CASE_ROUTE","STATEMENT_ADD","EVIDENCE_ADD","EXHIBIT_CREATE","EXHIBIT_TRANSFER","COURT_EVENT_ADD","AUDIT_WRITE","FILE_UPLOAD"],
  POLICE_INVESTIGATOR: ["CASE_VIEW","CASE_UPDATE","STATEMENT_ADD","EVIDENCE_ADD","EXHIBIT_CREATE","EXHIBIT_TRANSFER","COURT_EVENT_ADD","AUDIT_WRITE"],

  DPP_REGISTRY: ["CASE_VIEW","CASE_ASSIGN","CASE_ROUTE","COURT_EVENT_ADD","AUDIT_WRITE","FILE_UPLOAD"],
  DPP_PROSECUTOR: ["CASE_VIEW","CASE_UPDATE","CASE_ROUTE","COURT_EVENT_ADD","AUDIT_WRITE","FILE_UPLOAD"],

  MAG_REGISTRY: ["CASE_VIEW","COURT_EVENT_ADD","FILE_UPLOAD","AUDIT_WRITE"],
  MAG_ASSIST_REGISTRY: ["CASE_VIEW","COURT_EVENT_ADD","FILE_UPLOAD","AUDIT_WRITE"],
  MAGISTRATE: ["CASE_VIEW","CASE_UPDATE","COURT_EVENT_ADD","AUDIT_WRITE"],

  HIGH_REGISTRY: ["CASE_VIEW","COURT_EVENT_ADD","FILE_UPLOAD","AUDIT_WRITE"],
  HIGH_ASSIST_REGISTRY: ["CASE_VIEW","COURT_EVENT_ADD","FILE_UPLOAD","AUDIT_WRITE"],
  JUDGE: ["CASE_VIEW","CASE_UPDATE","COURT_EVENT_ADD","AUDIT_WRITE"],
};

const DEPT_POLICY = {
  POLICE: { canCreateCase: true },
  DPP: { canCreateCase: false },
  COURT: { canCreateCase: false },
  ADMIN: { canCreateCase: true },
};

(async () => {
  const c = await mysql.createConnection(cfg);

  // permissions
  for (const [code, desc] of PERMS) {
    await c.execute(
      "INSERT IGNORE INTO permissions(code, description) VALUES (?,?)",
      [code, desc]
    );
  }

  // role_permissions
  for (const [role, perms] of Object.entries(ROLE_MAP)) {
    for (const p of perms) {
      await c.execute(
        "INSERT IGNORE INTO role_permissions(role, permissionCode) VALUES (?,?)",
        [role, p]
      );
    }
  }

  // department policies
  for (const [dept, policy] of Object.entries(DEPT_POLICY)) {
    await c.execute(
      "INSERT INTO department_policies(department, policyJson) VALUES (?, CAST(? AS JSON)) ON DUPLICATE KEY UPDATE policyJson=VALUES(policyJson)",
      [dept, JSON.stringify(policy)]
    );
  }

  console.log("✅ RBAC seeded.");
  await c.end();
})().catch(e => { console.error("❌ seed rbac failed:", e?.message||e); process.exit(1); });
