# Production Deployment Bundle

This folder contains a real multi-server deployment layout for hosting the Fabric-backed justice platform on cloud VMs.

## Target Topology

- `vm-orderer-01`
  - `orderer.example.com`
- `vm-peer-org1-01`
  - `peer0.org1.example.com`
- `vm-peer-org2-01`
  - `peer0.org2.example.com`
- `vm-app-01`
  - `web`
  - `ai-judge`
  - `nginx`

This is the minimum serious hosted layout for the current two-organization endorsement policy.

## Folder Layout

- `compose/orderer`
- `compose/org1-peer`
- `compose/org2-peer`
- `compose/app`
- `env`

## Before You Deploy

1. Build or export final MSP and TLS material for each host.
2. Copy the right certs/keys to `/srv/fabric/...` on each VM.
3. Create the Docker network names exactly as documented in each compose file.
4. Open only required ports between hosts.
5. Keep the Fabric ports private to your cloud network or VPN.

## Shared Assumptions

- Ubuntu or Debian VM hosts
- Docker Engine and Docker Compose plugin installed
- Persistent storage under `/srv/fabric`
- Private DNS or hostfile entries for:
  - `orderer.example.com`
  - `peer0.org1.example.com`
  - `peer0.org2.example.com`

## Deployment Order

1. Bring up `vm-orderer-01`
2. Bring up `vm-peer-org1-01`
3. Bring up `vm-peer-org2-01`
4. Verify channel join and gossip connectivity
5. Bring up `vm-app-01`
6. Check:
   - `/api/health/blockchain`
   - `/api/health/system`

## Important Note

This bundle is production-oriented host configuration, not a one-click cloud account deployer. You still need actual VM provisioning, DNS, TLS certificates, secrets, backups, and monitoring in your target environment.
