# Fabric Production Hardening

This project now uses Hyperledger Fabric as the application blockchain backend. The items below define the production-ready operating model for legal case handling.

## Deployment Baseline

- Use `docker-compose.production.yml` only as a bootstrap reference, not as a single-host forever architecture.
- Terminate public TLS at NGINX with real domain certificates in `ops/nginx/certs/`.
- Mount all secrets through Docker secrets or an external secret manager. Do not place production private keys in `.env.local` or `.env.production`.
- Use persistent storage for the AI model cache and for any reverse-proxy certificates.

## Fabric Network Requirements

- Replace the sample `fabric-samples/test-network` identities with organization-owned MSP material.
- Create separate organizations and certificate authorities for:
  - Police
  - DPP
  - Judiciary
  - Registry
  - Corrections
- Issue distinct admin and client identities for each organization.
- Rotate certificates and private keys on a schedule and on role changes.
- Store peer, orderer, and CA data on persistent hosts or managed volumes with backup coverage.

## Recommended Endorsement Policy

Use a policy stronger than a single-organization endorsement. For legal case anchoring, require at least Judiciary plus one operational authority:

`AND('JudiciaryOrgMSP.peer', OR('PoliceOrgMSP.peer', 'RegistryOrgMSP.peer', 'DPPOrgMSP.peer'))`

If sentencing or prison-transfer events are anchored, consider:

`AND('JudiciaryOrgMSP.peer', 'CorrectionsOrgMSP.peer')`

## Identity Issuance Model

- Judges: issued by Judiciary CA, role-scoped certificates, no shared admin identities.
- Police: issued by Police CA, station-level affiliation, revocation on transfer or suspension.
- Registry: issued by Registry CA, intake-only and scheduling-only roles separated where practical.
- DPP: issued by DPP CA, prosecution review permissions only.
- Correctional officers: issued by Corrections CA, post-sentence event permissions only.

Map the certificate subject or Fabric attributes into application authorization checks before allowing anchor actions.

## Monitoring And Audit

- Poll `GET /api/health/system` for the full app status.
- Poll `GET /api/health/blockchain` for Fabric-only status.
- Retain container logs with rotation. The production compose file already limits Docker log growth.
- Forward NGINX, web, and AI logs into your central logging stack.
- Alert on:
  - blockchain health endpoint returning non-200
  - database health endpoint returning non-200
  - repeated chaincode invocation failures
  - expiring TLS or MSP certificates
  - disk pressure on peer/orderer hosts

## Backup And Recovery

- Back up Fabric MSP material, channel configuration blocks, and ledger volumes.
- Back up application secrets separately from application code.
- Keep database backups and ledger backups on different retention schedules.
- Test restore procedures quarterly:
  - restore DB
  - restore peer/orderer state
  - rejoin channel
  - revalidate app anchor/compare flows

## Cleanup Guidance

- The app runtime no longer depends on Hardhat RPC or the old `CaseAnchor` contract helper.
- Remove the `chain/` demo assets only after you confirm no local training, demos, or historical docs still rely on them.
- Before deletion, search for any remaining references to `8545`, `CaseAnchor`, or `hardhat`.
