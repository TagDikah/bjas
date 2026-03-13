import mysql from "mysql2/promise";
import crypto from "crypto";

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const db = {
  host: must("TIDB_HOST"),
  port: Number(process.env.TIDB_PORT || 4000),
  user: must("TIDB_USER"),
  password: must("TIDB_PASSWORD"),
  database: must("TIDB_DATABASE"),
  ssl: { rejectUnauthorized: true },
};

function fakeKey(label) {
  // If your app generates real keys elsewhere, replace these later.
  return crypto.createHash("sha256").update(label).digest("hex");
}

async function upsertUser(c, u) {
  // NOTE: this matches YOUR schema from db/init.sql.
  // If any column names differ, we will adjust after we inspect DESCRIBE users.
  const sql = `
    INSERT INTO users
      (id, role, name, email, department, station, badge, isActive, publicKey, privateKey, createdAt, createdBy)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    ON DUPLICATE KEY UPDATE
      role=VALUES(role),
      name=VALUES(name),
      email=VALUES(email),
      department=VALUES(department),
      station=VALUES(station),
      badge=VALUES(badge),
      isActive=VALUES(isActive),
      publicKey=VALUES(publicKey),
      privateKey=VALUES(privateKey);
  `;
  await c.execute(sql, [
    u.id,
    u.role,
    u.name,
    u.email,
    u.department,
    u.station,
    u.badge,
    u.isActive ? 1 : 0,
    u.publicKey,
    u.privateKey,
    u.createdBy || u.id,
  ]);
}

async function main() {
  const c = await mysql.createConnection(db);

  const users = [
    // ---- ADMIN ----
    {
      id: "u_admin",
      role: "ADMIN",
      name: "System Admin",
      email: "admin@bejas.local",
      department: "ADMIN",
      station: "HQ",
      badge: "0001",
      isActive: true,
      publicKey: fakeKey("u_admin_public"),
      privateKey: fakeKey("u_admin_private"),
      createdBy: "u_admin",
    },

    // ---- POLICE ----
    {
      id: "u_police_registry_1",
      role: "POLICE_REGISTRY",
      name: "Police Registry 1",
      email: "police.registry1@bejas.local",
      department: "POLICE",
      station: "HQ",
      badge: "P-1001",
      isActive: true,
      publicKey: fakeKey("u_police_registry_1_public"),
      privateKey: fakeKey("u_police_registry_1_private"),
      createdBy: "u_admin",
    },
    {
      id: "u_police_investigator_1",
      role: "POLICE_INVESTIGATOR",
      name: "Police Investigator 1",
      email: "police.investigator1@bejas.local",
      department: "POLICE",
      station: "HQ",
      badge: "P-2001",
      isActive: true,
      publicKey: fakeKey("u_police_investigator_1_public"),
      privateKey: fakeKey("u_police_investigator_1_private"),
      createdBy: "u_admin",
    },

    // ---- DPP ----
    {
      id: "u_dpp_registry_1",
      role: "DPP_REGISTRY",
      name: "DPP Registry 1",
      email: "dpp.registry1@bejas.local",
      department: "DPP",
      station: "HQ",
      badge: "D-1001",
      isActive: true,
      publicKey: fakeKey("u_dpp_registry_1_public"),
      privateKey: fakeKey("u_dpp_registry_1_private"),
      createdBy: "u_admin",
    },
    {
      id: "u_dpp_prosecutor_1",
      role: "DPP_PROSECUTOR",
      name: "DPP Prosecutor 1",
      email: "dpp.prosecutor1@bejas.local",
      department: "DPP",
      station: "HQ",
      badge: "D-2001",
      isActive: true,
      publicKey: fakeKey("u_dpp_prosecutor_1_public"),
      privateKey: fakeKey("u_dpp_prosecutor_1_private"),
      createdBy: "u_admin",
    },

    // ---- MAGISTRATE COURT ----
    {
      id: "u_mag_registry_1",
      role: "MAG_REGISTRY",
      name: "Magistrate Registry 1",
      email: "mag.registry1@bejas.local",
      department: "COURT",
      station: "MAGISTRATE",
      badge: "M-1001",
      isActive: true,
      publicKey: fakeKey("u_mag_registry_1_public"),
      privateKey: fakeKey("u_mag_registry_1_private"),
      createdBy: "u_admin",
    },
    {
      id: "u_mag_assist_registry_1",
      role: "MAG_ASSIST_REGISTRY",
      name: "Mag Assistant Registry 1",
      email: "mag.assist1@bejas.local",
      department: "COURT",
      station: "MAGISTRATE",
      badge: "M-1101",
      isActive: true,
      publicKey: fakeKey("u_mag_assist_registry_1_public"),
      privateKey: fakeKey("u_mag_assist_registry_1_private"),
      createdBy: "u_admin",
    },
    {
      id: "u_magistrate_1",
      role: "MAGISTRATE",
      name: "Magistrate 1",
      email: "magistrate1@bejas.local",
      department: "COURT",
      station: "MAGISTRATE",
      badge: "M-9001",
      isActive: true,
      publicKey: fakeKey("u_magistrate_1_public"),
      privateKey: fakeKey("u_magistrate_1_private"),
      createdBy: "u_admin",
    },

    // ---- HIGH COURT ----
    {
      id: "u_high_registry_1",
      role: "HIGH_REGISTRY",
      name: "High Court Registry 1",
      email: "high.registry1@bejas.local",
      department: "COURT",
      station: "HIGH_COURT",
      badge: "H-1001",
      isActive: true,
      publicKey: fakeKey("u_high_registry_1_public"),
      privateKey: fakeKey("u_high_registry_1_private"),
      createdBy: "u_admin",
    },
    {
      id: "u_high_assist_registry_1",
      role: "HIGH_ASSIST_REGISTRY",
      name: "High Assistant Registry 1",
      email: "high.assist1@bejas.local",
      department: "COURT",
      station: "HIGH_COURT",
      badge: "H-1101",
      isActive: true,
      publicKey: fakeKey("u_high_assist_registry_1_public"),
      privateKey: fakeKey("u_high_assist_registry_1_private"),
      createdBy: "u_admin",
    },
    {
      id: "u_judge_1",
      role: "JUDGE",
      name: "High Court Judge 1",
      email: "judge1@bejas.local",
      department: "COURT",
      station: "HIGH_COURT",
      badge: "H-9001",
      isActive: true,
      publicKey: fakeKey("u_judge_1_public"),
      privateKey: fakeKey("u_judge_1_private"),
      createdBy: "u_admin",
    },
  ];

  console.log(`👤 Seeding ${users.length} users...`);
  for (const u of users) await upsertUser(c, u);

  console.log("✅ Users seeded (idempotent).");
  await c.end();
}

main();
