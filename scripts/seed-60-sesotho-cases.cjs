require("dotenv").config({ path: ".env.local" })
require("dotenv").config({ path: ".env" })

const fs = require("node:fs")
const path = require("node:path")
const crypto = require("node:crypto")
const mysql = require("mysql2/promise")
const { ethers } = require("ethers")

const host = process.env.DB_HOST || process.env.TIDB_HOST
const port = Number(process.env.DB_PORT || process.env.TIDB_PORT || 4000)
const user = process.env.DB_USER || process.env.TIDB_USER
const password = process.env.DB_PASSWORD || process.env.TIDB_PASSWORD
const database = process.env.DB_NAME || process.env.TIDB_DATABASE
const caRel = process.env.DB_SSL_CA || process.env.TIDB_SSL_CA
const insecure = String(process.env.TIDB_SSL_INSECURE || "false").toLowerCase() === "true"

const abi = require(path.join(process.cwd(), "lib", "blockchain", "CaseAnchor.abi.json"))
const addressJson = require(path.join(process.cwd(), "lib", "blockchain", "case-anchor-address.json"))

const RPC_URL = "http://127.0.0.1:8545"
const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

function must(v, name) {
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function makeId() {
  return `case_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`
}

function hashCase(data) {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)))
}

async function anchorCase(recordId, caseData) {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const contract = new ethers.Contract(addressJson.address, abi, wallet)
  const contentHash = hashCase(caseData)
  const tx = await contract.anchor(recordId, contentHash, "SEEDED_SESOTHO_CASE")
  const receipt = await tx.wait()
  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    contentHash,
  }
}

function dateMinus(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function makeCase(idx) {
  const offences = [
    "Bosholu ba koloi",
    "Bosholu bo hlometseng",
    "Tlhaselo",
    "Polao",
    "Tshenyo ya thepa",
    "Tshotlo ya bana",
    "Bosholu ba mehala",
    "Kgokahano ya bomenemene",
  ]
  const places = ["Maseru", "Berea", "Leribe", "Mafeteng", "Mohales Hoek", "Quthing", "Mokhotlong"]
  const statuses = [
    "draft_police",
    "pending_investigation",
    "in_investigation",
    "pending_commissioner",
    "commissioner_clarification",
    "approved",
    "rejected",
    "submitted_to_dpp",
    "dpp_registry_intake",
    "filed_to_high_court",
    "docket_complete",
    "closed",
  ]

  const offence = offences[idx % offences.length]
  const place = places[idx % places.length]
  const status = statuses[idx % statuses.length]
  const id = makeId()
  const caseNumber = `LS-${new Date().getFullYear()}-${String(idx + 1).padStart(5, "0")}`
  const createdAt = dateMinus(120 - (idx % 90))
  const updatedAt = dateMinus(90 - (idx % 60))
  const citation = `Tokomane ya nyewe: Nyewe ena e mabapi le ${offence} e tlalehilweng ${place}. Dintlha di bolokilwe ka mokgwa wa blockchain.`

  return {
    id,
    caseNumber,
    status,
    title: offence,
    description: `Kakaretso ya nyewe: tshebetso ya ${offence} e tsamaile ka mekgahlelo e hlakileng.`,
    citation,
    district: place,
    parties: `Mmotsi ${idx + 1} vs Moqosu ${idx + 1}`,
    charge: offence,
    createdAt,
    updatedAt,
    payload: {
      caseId: id,
      caseNumber,
      citation,
      district: place,
      parties: `Mmotsi ${idx + 1} vs Moqosu ${idx + 1}`,
      charge: offence,
      description: `Kakaretso ya nyewe: tshebetso ya ${offence} e tsamaile ka mekgahlelo e hlakileng.`,
      status,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      policeOfficerName: "Sgt. Thabo Mokoena",
      usersInvolved: [
        "Sgt. Thabo Mokoena",
        "Insp. Lerato Ntsoana",
        "Com. Palesa Mphanya",
        "Adv. Molefi Kabi",
        "Adv. Lineo Letsie",
      ],
      policeSections: {
        sectionA: {
          openedByName: "Sgt. Thabo Mokoena",
          station: place,
          summary: `Nyewe e butsweng ${place} mabapi le ${offence}.`,
        },
        sectionB: {
          investigatorName: "Insp. Lerato Ntsoana",
        },
        sectionC: {
          submittedToCommissionerByName: "Insp. Lerato Ntsoana",
        },
      },
      commissionerDecision:
        status === "rejected"
          ? {
              decision: "rejected",
              notes: "Nyewe e hlotsoe tlhahlobo ya pele.",
              byName: "Com. Palesa Mphanya",
              at: dateMinus(20 - (idx % 7)).toISOString(),
            }
          : undefined,
    },
  }
}

async function main() {
  must(host, "DB_HOST/TIDB_HOST")
  must(user, "DB_USER/TIDB_USER")
  must(password, "DB_PASSWORD/TIDB_PASSWORD")
  must(database, "DB_NAME/TIDB_DATABASE")

  const ssl = caRel
    ? {
        ca: fs.readFileSync(path.isAbsolute(caRel) ? caRel : path.join(process.cwd(), caRel), "utf8"),
        rejectUnauthorized: !insecure,
      }
    : undefined

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl,
  })

  await conn.query(`
    ALTER TABLE cases
      ADD COLUMN IF NOT EXISTS caseNumber VARCHAR(64) NULL,
      ADD COLUMN IF NOT EXISTS citation TEXT NULL,
      ADD COLUMN IF NOT EXISTS district VARCHAR(120) NULL,
      ADD COLUMN IF NOT EXISTS parties VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS charge VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS payload JSON NULL,
      ADD COLUMN IF NOT EXISTS blockchainTxHash VARCHAR(160) NULL,
      ADD COLUMN IF NOT EXISTS blockchainBlockIndex BIGINT NULL,
      ADD COLUMN IF NOT EXISTS blockchainContentHash VARCHAR(160) NULL
  `)

  const [countRows] = await conn.query("SELECT COUNT(*) AS total FROM cases")
  const currentTotal = Number(countRows[0]?.total || 0)
  const need = Math.max(0, 60 - currentTotal)

  if (need === 0) {
    console.log(`✅ Already has ${currentTotal} cases. No insert needed.`)
    await conn.end()
    return
  }

  for (let i = 0; i < need; i++) {
    const idx = currentTotal + i
    const c = makeCase(idx)
    const anchor = await anchorCase(c.id, c.payload)

    await conn.query(
      `
      INSERT INTO cases
        (id, title, description, status, createdById, createdByName, createdByRole, createdAt, updatedAt,
         caseNumber, citation, district, parties, charge, payload,
         blockchainTxHash, blockchainBlockIndex, blockchainContentHash)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        c.id,
        c.title,
        c.description,
        c.status,
        "u_admin",
        "System Admin",
        "admin",
        c.createdAt,
        c.updatedAt,
        c.caseNumber,
        c.citation,
        c.district,
        c.parties,
        c.charge,
        JSON.stringify({
          ...c.payload,
          chainAnchor: anchor,
        }),
        anchor.txHash,
        anchor.blockNumber,
        anchor.contentHash,
      ]
    )

    await conn.query(
      `
      INSERT INTO audit_entries
        (caseId, action, performedById, performedByName, performedByRole, timestamp, details, blockIndex, transactionHash)
      VALUES
        (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `,
      [
        c.id,
        "SEEDED_CASE",
        "u_admin",
        "System Admin",
        "admin",
        JSON.stringify({
          caseNumber: c.caseNumber,
          message: "Seeded Sesotho case with blockchain anchor.",
        }),
        anchor.blockNumber,
        anchor.txHash,
      ]
    )
  }

  const [afterRows] = await conn.query("SELECT COUNT(*) AS total FROM cases")
  const afterTotal = Number(afterRows[0]?.total || 0)
  console.log(`✅ Seeded ${need} cases. Total cases: ${afterTotal}.`)
  await conn.end()
}

main().catch((error) => {
  console.error("❌ Failed to seed 60 Sesotho cases:", error?.message || error)
  process.exit(1)
})

