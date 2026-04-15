# 4 Users Presentation Pack

## 1. Problem Statement
Manual or weakly protected justice case systems make it difficult to manage records, track workflow changes, and prove that sensitive case data has not been tampered with.

## 2. SMART Objective
To build a justice case management system that allows users to capture, process, store, and verify case records using Next.js, Node.js, TiDB, and blockchain, with traceable workflow actions and integrity checks during the project demonstration period.

## 3. Best Team Order
1. Next.js
2. Node.js
3. TiDB
4. Blockchain

Reason:
This follows the real system flow: user interface -> backend logic -> database storage -> integrity verification.

## 4. User 1 - Next.js
What to say:
"My part is Next.js. It handles the user interface and the API routes. Users interact with forms and pages here, and the requests are sent to the backend for processing."

Files:
- `app/police/new-case/page.tsx`
- `app/api/auth/login/route.ts`
- `app/api/cases/route.ts`
- `app/api/blockchain/anchor/route.ts`

Functions to mention:
- `POST()` in login route
- `GET()` and `POST()` in cases route
- `POST()` in blockchain anchor route
- `buildCasePayload()`

Short line:
"I explain Next.js, which handles pages, forms, and API routes."

## 5. User 2 - Node.js
What to say:
"My part is Node.js. It handles the server-side logic such as authentication, case processing, workflow control, and system actions behind the scenes."

Files:
- `lib/server/cases.ts`
- `lib/server/auth-session.ts`
- `lib/server/users.ts`

Functions to mention:
- `parseSessionValue()`
- `getSessionUserFromRequest()`
- `createAndSubmitCase()`
- `listCases()`
- `checkpointPoliceCaseStep()`

Short line:
"I explain Node.js, which handles backend logic and workflow processing."

## 6. User 3 - TiDB
What to say:
"My part is TiDB. It stores the full operational case data such as users, case details, evidence, and audit records in a structured SQL database."

Files:
- `lib/db.ts`
- `db/offchain.sql`
- any TiDB pool config file

Functions to mention:
- `getDbPool()`
- `readCaIfProvided()`
- `toBool()`

Strong line:
"TiDB stores the full business record."

## 7. User 4 - Blockchain
What to say:
"My part is blockchain. It does not store the full case data. Instead, it stores a cryptographic fingerprint of the case so that any unauthorized change can be detected."

Files:
- `lib/blockchain/case-anchor.ts`
- `chain/contracts/CaseAnchor.sol`
- blockchain API route if needed

Functions to mention:
- `getContract()`
- `makeCaseHash()`
- `anchorCaseOnChain()`

Strong line:
"Blockchain stores proof of integrity and critical action history."

## 8. Combined Team Line
"Next.js handles the interface, Node.js handles the logic, TiDB stores the full data, and blockchain provides proof of integrity."

## 9. Final Important Sentence
"The database stores the full business record, while blockchain stores proof of integrity and critical action history."
