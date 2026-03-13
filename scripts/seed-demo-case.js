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

const sha256hex = (s) => crypto.createHash("sha256").update(s).digest("hex");

async function main() {
  const c = await mysql.createConnection(db);

  // -----------------------------
  // 1) Create a CASE (idempotent)
  // -----------------------------
  const caseId = "CASE-0001";
  const caseTitle = "Demo Case: Theft & Evidence Chain";
  const caseData = JSON.stringify({
    summary: "Demo case to validate off-chain tables with integrity hashes.",
    openedAt: new Date().toISOString(),
    routing: ["POLICE", "DPP", "MAGISTRATE", "HIGH_COURT"],
  });

  // cases table columns are from your existing init.sql
  // We assume: id, title, data, status, createdAt, createdBy (common in your project)
  // We'll attempt the most likely structure:
  const insertCaseSql = `
    INSERT INTO cases (id, title, data, status, createdAt, createdBy)
    VALUES (?, ?, ?, ?, NOW(), ?)
    ON DUPLICATE KEY UPDATE
      title=VALUES(title),
      data=VALUES(data),
      status=VALUES(status);
  `;
  try {
    await c.execute(insertCaseSql, [caseId, caseTitle, caseData, "OPEN", "u_police_registry_1"]);
  } catch (e) {
    // If your cases schema differs, show structure quickly and stop.
    const [cols] = await c.query("DESCRIBE cases");
    console.log("❌ cases schema mismatch. DESCRIBE cases:");
    console.table(cols);
    throw e;
  }

  // -----------------------------
  // 2) Parties
  // -----------------------------
  const party1 = {
    caseId,
    partyType: "COMPLAINANT",
    fullName: "John Demo",
    nationalId: "ID-123456",
    phone: "+266 5000 0001",
    address: "Maseru, Lesotho",
    notes: "Complainant (demo)",
  };
  const party2 = {
    caseId,
    partyType: "ACCUSED",
    fullName: "Jane Sample",
    nationalId: "ID-654321",
    phone: "+266 5000 0002",
    address: "Maseru, Lesotho",
    notes: "Accused (demo)",
  };

  const insertPartySql = `
    INSERT INTO case_parties (caseId, partyType, fullName, nationalId, phone, address, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await c.execute(insertPartySql, Object.values(party1));
  const [p1] = await c.query("SELECT id FROM case_parties WHERE caseId=? AND partyType=? AND fullName=? ORDER BY id DESC LIMIT 1", [caseId, party1.partyType, party1.fullName]);
  await c.execute(insertPartySql, Object.values(party2));
  const [p2] = await c.query("SELECT id FROM case_parties WHERE caseId=? AND partyType=? AND fullName=? ORDER BY id DESC LIMIT 1", [caseId, party2.partyType, party2.fullName]);

  const complainantPartyId = p1[0].id;
  const accusedPartyId = p2[0].id;

  // -----------------------------
  // 3) Statement (text + hash)
  // -----------------------------
  const stmtText = "I report that my phone was stolen near the taxi rank. I can identify the suspect.";
  const stmtHash = sha256hex(stmtText);

  await c.execute(
    `INSERT INTO statements (caseId, partyId, takenByUserId, statementText, statementHash, ipfsCid, chainAnchorTx)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [caseId, complainantPartyId, "u_police_investigator_1", stmtText, stmtHash, "bafyDemoStatementCid0001", null]
  );

  // -----------------------------
  // 4) Evidence (CID + hash)
  // -----------------------------
  const evidenceMeta = "CCTV clip from shop camera (demo)";
  const evidenceHash = sha256hex(evidenceMeta);

  await c.execute(
    `INSERT INTO evidence_items (caseId, uploadedByUserId, evidenceType, title, description, storageProvider, storageRef, mimeType, bytes, contentHash, chainAnchorTx)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [caseId, "u_police_registry_1", "VIDEO", "CCTV Clip", evidenceMeta, "IPFS", "bafyDemoEvidenceCid0001", "video/mp4", 12345678, evidenceHash, null]
  );

  // -----------------------------
  // 5) Exhibit + Chain Transfer
  // -----------------------------
  await c.execute(
    `INSERT INTO exhibits (caseId, exhibitTag, description, seizedByUserId, currentHolderUserId, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [caseId, "EXH-0001", "Recovered mobile phone (demo)", "u_police_investigator_1", "u_police_investigator_1", "IN_CUSTODY"]
  );
  const [exh] = await c.query("SELECT id FROM exhibits WHERE exhibitTag=? LIMIT 1", ["EXH-0001"]);
  const exhibitId = exh[0].id;

  const transferPayload = JSON.stringify({
    caseId,
    exhibitId,
    from: "u_police_investigator_1",
    to: "u_dpp_registry_1",
    reason: "Submitted exhibit to DPP for review (demo)",
    at: new Date().toISOString(),
  });
  const transferHash = sha256hex(transferPayload);

  await c.execute(
    `INSERT INTO chain_transfers (caseId, exhibitId, fromUserId, toUserId, reason, transferHash, chainAnchorTx)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [caseId, exhibitId, "u_police_investigator_1", "u_dpp_registry_1", "Submitted exhibit to DPP for review (demo)", transferHash, null]
  );

  // Update holder
  await c.execute(`UPDATE exhibits SET currentHolderUserId=? WHERE id=?`, ["u_dpp_registry_1", exhibitId]);

  // -----------------------------
  // 6) Assignments
  // -----------------------------
  await c.execute(
    `INSERT INTO case_assignments (caseId, assignedToUserId, assignedByUserId, assignmentType, note)
     VALUES (?, ?, ?, ?, ?)`,
    [caseId, "u_police_investigator_1", "u_police_registry_1", "INVESTIGATOR", "Assigned investigator (demo)"]
  );
  await c.execute(
    `INSERT INTO case_assignments (caseId, assignedToUserId, assignedByUserId, assignmentType, note)
     VALUES (?, ?, ?, ?, ?)`,
    [caseId, "u_dpp_prosecutor_1", "u_dpp_registry_1", "PROSECUTOR", "Assigned prosecutor (demo)"]
  );

  // -----------------------------
  // 7) Case Events (routing timeline)
  // -----------------------------
  const events = [
    { type: "STATUS_CHANGE", note: "Case opened at Police Registry", by: "u_police_registry_1" },
    { type: "ROUTE", note: "Routed to DPP for review", by: "u_police_registry_1" },
    { type: "ROUTE", note: "DPP routed to Magistrate Court", by: "u_dpp_registry_1" },
    { type: "RETURN_TO_DPP", note: "Magistrate requests additional prosecution guidance", by: "u_magistrate_1" },
    { type: "ROUTE", note: "DPP routed to High Court Registry", by: "u_dpp_registry_1" },
  ];

  for (const ev of events) {
    const payload = JSON.stringify({ caseId, eventType: ev.type, note: ev.note, by: ev.by, at: new Date().toISOString() });
    const eventHash = sha256hex(payload);
    await c.execute(
      `INSERT INTO case_events (caseId, eventType, eventNote, createdByUserId, eventHash, chainAnchorTx)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [caseId, ev.type, ev.note, ev.by, eventHash, null]
    );
  }

  // -----------------------------
  // 8) Audit Entries (simple)
  // -----------------------------
  // audit_entries schema unknown: we will try common (id, action, entityId, actorId, details, createdAt)
  // If mismatch, we'll print DESCRIBE audit_entries and stop.
  const auditTry = async () => {
    const sql = `
      INSERT INTO audit_entries (id, action, entityId, actorId, details, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE details=VALUES(details);
    `;
    await c.execute(sql, [
      "AUDIT-CASE-0001",
      "SEED_DEMO",
      caseId,
      "u_admin",
      JSON.stringify({ ok: true, note: "Demo seeded via terminal script" }),
    ]);
  };

  try {
    await auditTry();
  } catch (e) {
    const [cols] = await c.query("DESCRIBE audit_entries");
    console.log("⚠️ audit_entries schema mismatch. DESCRIBE audit_entries:");
    console.table(cols);
    console.log("✅ Everything else seeded. We'll adjust audit insert once we see the columns.");
  }

  console.log("✅ Demo case seeded:", caseId);
  await c.end();
}

main().catch((e) => {
  console.error("❌ seed-demo failed:", e?.message || e);
  process.exit(1);
});
