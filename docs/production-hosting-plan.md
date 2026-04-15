# Production Hosting Plan

This plan turns the current working Fabric network into a hostable production deployment.

If you need the no-money path first, use [docs/zero-budget-hosting-plan.md](/C:/Users/BrainTech/Documents/Project2/NewVission/blockchain-mobile-app-mysql-firewall_UPDATED3_FULL_UPDATE/blockchain-mobile-app-FULLMERGED/docs/zero-budget-hosting-plan.md). That path keeps Fabric local and exposes only a token-protected bridge to the hosted app until dedicated infrastructure is available.

## Recommended Real Hosting Path

Use a four-VM layout first:

1. one VM for the orderer
2. one VM for Org1 peer
3. one VM for Org2 peer
4. one VM for the web app, AI service, and reverse proxy

This is not a demo-only topology. It is the minimum clean separation for a real hosted service using the current two-organization endorsement policy.

## Why This Layout

- writes currently require both Org1 and Org2 endorsements
- separating peers reduces single-host coupling
- separating the orderer isolates consensus and ledger services from app traffic
- separating the app host allows public ingress without exposing Fabric internals directly

## VM Roles

### Orderer VM

- Docker Compose bundle:
  - `ops/production/compose/orderer/docker-compose.yml`
- persistent storage:
  - `/srv/fabric/orderer/msp`
  - `/srv/fabric/orderer/tls`
  - `/srv/fabric/orderer/config`
  - `/srv/fabric/orderer/data`

### Org1 Peer VM

- Docker Compose bundle:
  - `ops/production/compose/org1-peer/docker-compose.yml`
- persistent storage:
  - `/srv/fabric/org1-peer/msp`
  - `/srv/fabric/org1-peer/tls`
  - `/srv/fabric/org1-peer/data`

### Org2 Peer VM

- Docker Compose bundle:
  - `ops/production/compose/org2-peer/docker-compose.yml`
- persistent storage:
  - `/srv/fabric/org2-peer/msp`
  - `/srv/fabric/org2-peer/tls`
  - `/srv/fabric/org2-peer/data`

### App VM

- Docker Compose bundle:
  - `ops/production/compose/app/docker-compose.yml`
- public ingress:
  - `80`
  - `443`
- Fabric client secrets:
  - mounted under `/srv/justice/secrets`

## DNS Names

Provision private or internal DNS for:

- `orderer.example.com`
- `peer0.org1.example.com`
- `peer0.org2.example.com`

Provision public DNS for the app, for example:

- `cases.example.org`

## Secrets and Certificates

For the app runtime, provide:

- peer TLS root certificate
- client signcert
- client private key

For Fabric hosts, provide:

- local MSP
- TLS cert and key
- channel artifacts and orderer config where required

## Firewall Rules

Public:

- App VM:
  - allow `80/tcp`
  - allow `443/tcp`

Private only:

- Orderer VM:
  - allow `7050/tcp` from peer VMs and app admin network only
- Org1 peer VM:
  - allow `7051/tcp` from app VM and Org2 peer VM
- Org2 peer VM:
  - allow `9051/tcp` from app VM and Org1 peer VM

Do not expose peer or orderer ports to the public internet.

## Monitoring

Monitor:

- `GET /api/health/system`
- `GET /api/health/blockchain`
- disk usage on all Fabric hosts
- Docker restart counts
- certificate expiration windows

Alert on:

- blockchain health `!= 200`
- orderer container down
- either endorsing peer down
- repeated endorsement policy failures

## Backup Requirements

Back up:

- peer ledger directories
- orderer WAL and snapshot directories
- MSP directories
- application secrets
- database

Test restore:

1. restore orderer state
2. restore peer state
3. restore app secrets
4. confirm case query and write still work

## Remaining Real-World Tasks Outside This Repo

- provision cloud VMs
- configure DNS
- install Docker on hosts
- place final MSP and TLS material on each host
- wire secret manager or secure secret mounts
- set up backup jobs and centralized monitoring

The codebase is now prepared for this path, but those infrastructure steps still need to be executed in your cloud environment.
