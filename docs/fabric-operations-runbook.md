# Fabric Operations Runbook

This runbook captures the working local and pre-production operating model for the `caseflow` Fabric network used by this application.

## What Is Already Working

- Hyperledger Fabric peers and orderer can be started locally with Docker.
- `caseflow` chaincode is deployed on `mychannel`.
- The Next.js backend already uses Fabric Gateway in [lib/blockchain/fabric-client.ts](/C:/Users/BrainTech/Documents/Project2/NewVission/blockchain-mobile-app-mysql-firewall_UPDATED3_FULL_UPDATE/blockchain-mobile-app-FULLMERGED/lib/blockchain/fabric-client.ts).
- The app exposes blockchain health via [app/api/health/blockchain/route.ts](/C:/Users/BrainTech/Documents/Project2/NewVission/blockchain-mobile-app-mysql-firewall_UPDATED3_FULL_UPDATE/blockchain-mobile-app-FULLMERGED/app/api/health/blockchain/route.ts) and overall system health via [app/api/health/system/route.ts](/C:/Users/BrainTech/Documents/Project2/NewVission/blockchain-mobile-app-mysql-firewall_UPDATED3_FULL_UPDATE/blockchain-mobile-app-FULLMERGED/app/api/health/system/route.ts).

## Local Bootstrap

1. Ensure Docker Desktop is running.
2. Ensure `C:\Users\BrainTech\fabric-samples\test-network\organizations` exists.
3. From the app root, run:

```powershell
npm run fabric:bootstrap
```

This script:

- starts `orderer.example.com`, `peer0.org1.example.com`, and `peer0.org2.example.com`
- copies the live Org1 admin MSP into `/tmp/live-org1-admin-msp`
- copies the orderer TLS CA and Org2 peer TLS CA into the Org1 peer container
- rewrites MSP `config.yaml` files inside the running peer container to use Linux-safe certificate paths

## Smoke Test

Run:

```powershell
npm run fabric:smoke
```

This verifies:

- Org1 admin identity is usable
- both peer endorsements can be collected
- orderer TLS submission works
- a new case can be created and read back successfully

## Development Environment Variables

Recommended local development values:

```env
FABRIC_ORGANIZATIONS_DIR=C:/Users/BrainTech/fabric-samples/test-network/organizations
FABRIC_ACCESS_MODE=direct
FABRIC_PEER_ENDPOINT=localhost:7051
FABRIC_PEER_HOST_ALIAS=peer0.org1.example.com
FABRIC_MSP_ID=Org1MSP
FABRIC_CHANNEL_NAME=mychannel
FABRIC_CHAINCODE_NAME=caseflow
```

If `FABRIC_TLS_CERT_PATH`, `FABRIC_CLIENT_CERT_PATH`, and `FABRIC_CLIENT_KEY_PATH` are not explicitly set, the backend resolves them from `FABRIC_ORGANIZATIONS_DIR` or the detected test-network organizations directory.

## Zero-Budget Hosted Mode

When the public app is hosted on a free platform but Fabric stays on your local machine:

- run the public app with `FABRIC_ACCESS_MODE=bridge`
- set `FABRIC_BRIDGE_URL` to the public HTTPS URL of your local bridge
- set `FABRIC_BRIDGE_TOKEN` to a long random secret shared by both the hosted app and the local bridge instance
- run the local bridge instance with:
  - `FABRIC_ACCESS_MODE=direct`
  - `FABRIC_BRIDGE_ONLY=true`
  - the normal local `FABRIC_*` MSP and TLS variables

The bridge-only mode exposes only:

- `GET /api/fabric-bridge/health`
- `POST /api/fabric-bridge/anchor`
- `GET /api/fabric-bridge/latest/[recordId]`
- `GET /api/health/blockchain`

This keeps Fabric credentials on your machine while allowing the hosted app to anchor and verify records remotely.

## Production Requirements

### Identity and MSP

- Replace sample identities with organization-owned MSP material.
- Mount production Fabric secrets through Docker secrets or a secret manager.
- Do not rely on `docker cp` in production.
- Rotate admin and client certificates.

### Endorsement Policy

The current channel policy effectively requires endorsements from both orgs for writes.

Operational impact:

- Org1 and Org2 peers must both be healthy for `createCase`, `addEvent`, `anchorCase`, and `sealCase`.
- Single-peer write attempts will endorse locally but be marked invalid at commit time.

### Networking and TLS

- Keep peer and orderer ports private.
- Use public TLS only at the application reverse proxy.
- Preserve internal Fabric TLS between app clients, peers, and orderer.

### Persistence and Backups

- Persist peer ledger data, orderer WAL/snapshots, and MSP material on durable storage.
- Back up ledger and MSP artifacts separately.
- Test restore and rejoin procedures regularly.

## Hosting Checklist

1. Regenerate or import production MSPs and CA roots.
2. Mount Fabric client cert, key, and peer TLS root cert into the web runtime.
3. Configure `FABRIC_*` environment variables for the production peer and channel.
4. Deploy at least:
   - one orderer for demo
   - or three Raft orderers for real resilience
5. Keep both endorsing peers available if the endorsement policy remains two-org.
6. Monitor:
   - `GET /api/health/blockchain`
   - `GET /api/health/system`
   - container disk usage
   - certificate expiry
7. Add log shipping and alerts for endorsement failures and orderer connectivity issues.

## Remaining Risks

- The current repo documents and scripts a stable hosted path, but it does not yet create a full multi-host production Fabric topology automatically.
- Public hosting still requires external certificate management, secret management, backups, and infrastructure-level monitoring.
