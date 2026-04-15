# Code Guide By User

## User 1 - Next.js

### Files to open
- `app/police/new-case/page.tsx`
- `app/api/auth/login/route.ts`
- `app/api/cases/route.ts`
- `app/api/blockchain/anchor/route.ts`

### Important functions and what to say

#### `buildCasePayload()`
File: `app/police/new-case/page.tsx`
Purpose:
Builds one structured case object from the form inputs.
Say:
"This function collects all form values and prepares them before sending them to the backend."

#### `POST()`
File: `app/api/auth/login/route.ts`
Purpose:
Authenticates the user and creates the session cookie.
Say:
"This login route checks the credentials and creates the session for the user."

#### `GET()`
File: `app/api/cases/route.ts`
Purpose:
Returns case records for authenticated users.
Say:
"This route fetches case data from the backend for display in the interface."

#### `POST()`
File: `app/api/cases/route.ts`
Purpose:
Receives new case data from the frontend.
Say:
"This route receives the submitted form data and passes it to the server logic."

#### `POST()`
File: `app/api/blockchain/anchor/route.ts`
Purpose:
Calls the blockchain anchoring logic.
Say:
"This route allows the app to request blockchain proof for a case action."

## User 2 - Node.js

### Files to open
- `lib/server/cases.ts`
- `lib/server/auth-session.ts`
- `lib/server/users.ts`

### Important functions and what to say

#### `parseSessionValue()`
File: `lib/server/auth-session.ts`
Purpose:
Decodes the auth cookie and rebuilds the logged-in user object.
Say:
"This function identifies the current user from the session cookie."

#### `getSessionUserFromRequest()`
File: `lib/server/auth-session.ts`
Purpose:
Reads the session user from the incoming request.
Say:
"This function protects backend routes by confirming who is making the request."

#### `listCases()`
File: `lib/server/cases.ts`
Purpose:
Loads case records from the database.
Say:
"This function retrieves cases from storage and prepares them for use in the app."

#### `createAndSubmitCase()`
File: `lib/server/cases.ts`
Purpose:
Creates a new case, stores it, writes audit data, and triggers blockchain anchoring.
Say:
"This is the core backend workflow for creating and submitting a case."

#### `checkpointPoliceCaseStep()`
File: `lib/server/cases.ts`
Purpose:
Saves progress at each step of the police form.
Say:
"This function records step-by-step workflow progress and supports traceability."

## User 3 - TiDB

### Files to open
- `lib/db.ts`
- `db/offchain.sql`
- `lib/db/tidb.ts`

### Important functions and what to say

#### `toBool()`
File: `lib/db.ts`
Purpose:
Converts environment string values into true or false.
Say:
"This helper reads database connection settings safely from environment variables."

#### `readCaIfProvided()`
File: `lib/db.ts`
Purpose:
Reads the SSL certificate file for secure TiDB connections.
Say:
"This function loads the certificate used to make the TiDB connection secure."

#### `getDbPool()`
File: `lib/db.ts`
Purpose:
Creates the shared TiDB connection pool.
Say:
"This function gives the whole application a reusable secure connection to TiDB."

#### SQL tables in `db/offchain.sql`
Purpose:
Define structured storage for statements, evidence, exhibits, assignments, and events.
Say:
"This SQL file shows how the system stores operational records in structured tables."

## User 4 - Blockchain

### Files to open
- `lib/blockchain/case-anchor.ts`
- `chain/contracts/CaseAnchor.sol`
- `app/api/blockchain/anchor/route.ts`
- `lib/blockchain.ts`

### Important functions and what to say

#### `getContract()`
File: `lib/blockchain.ts`
Purpose:
Connects the application to the smart contract.
Say:
"This function creates the connection between the application and the blockchain contract."

#### `makeCaseHash()`
File: `lib/blockchain/case-anchor.ts`
Purpose:
Generates the cryptographic fingerprint of the case data.
Say:
"This function creates the hash that lets us detect tampering."

#### `anchorCaseOnChain()`
File: `lib/blockchain/case-anchor.ts`
Purpose:
Stores the case hash and action on blockchain.
Say:
"This function sends proof of the case state to blockchain and returns transaction details."

#### `anchor()`
File: `chain/contracts/CaseAnchor.sol`
Purpose:
Stores the latest hash for a record and emits an event.
Say:
"This smart contract function records the integrity proof permanently on chain."

## Combined Team Line
"Next.js handles the interface, Node.js handles the logic, TiDB stores the full data, and blockchain provides proof of integrity."

## Final Important Sentence
"The database stores the full business record, while blockchain stores proof of integrity and critical action history."
