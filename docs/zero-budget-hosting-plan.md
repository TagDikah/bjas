# Zero-Budget Hosting Plan

This plan is for the no-money path:

- the public Next.js app is hosted on a free platform
- the Hyperledger Fabric network stays on your local machine
- a token-protected Fabric bridge is exposed from your machine through an HTTPS tunnel

## Architecture

1. Public app host
   - runs the normal Next.js application
   - uses TiDB and the AI service as usual
   - uses `FABRIC_ACCESS_MODE=bridge`
   - never stores Fabric admin MSP or private key material

2. Local bridge host
   - runs the same Next.js build on your machine
   - uses `FABRIC_ACCESS_MODE=direct`
   - uses `FABRIC_BRIDGE_ONLY=true`
   - keeps the Fabric admin certificate, key, TLS cert, and Docker-based peer/orderer access local
   - serves only the Fabric bridge API and blockchain health route

3. Tunnel
   - forwards a public HTTPS URL to the local bridge host
   - should be protected with the shared `FABRIC_BRIDGE_TOKEN`

## Hosted App Environment

Use values like these on the free public host:

```env
APP_URL=https://your-public-app.example
NEXT_PUBLIC_APP_URL=https://your-public-app.example
FABRIC_ACCESS_MODE=bridge
FABRIC_BRIDGE_URL=https://your-bridge-url.example
FABRIC_BRIDGE_TOKEN=replace_with_a_long_random_secret
FABRIC_BRIDGE_TIMEOUT_MS=15000
```

Do not set:

- `FABRIC_CLIENT_KEY_PATH`
- `FABRIC_CLIENT_CERT_PATH`
- `FABRIC_TLS_CERT_PATH`
- `FABRIC_ORGANIZATIONS_DIR`

Those stay only on the local bridge machine.

## Local Bridge Environment

Use values like these on your machine:

```env
APP_URL=http://127.0.0.1:3010
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3010
FABRIC_ACCESS_MODE=direct
FABRIC_BRIDGE_ONLY=true
FABRIC_BRIDGE_TOKEN=replace_with_the_same_long_random_secret
FABRIC_ORGANIZATIONS_DIR=C:/Users/BrainTech/fabric-samples/test-network/organizations
FABRIC_PEER_ENDPOINT=localhost:7051
FABRIC_PEER_HOST_ALIAS=peer0.org1.example.com
FABRIC_MSP_ID=Org1MSP
FABRIC_CHANNEL_NAME=mychannel
FABRIC_CHAINCODE_NAME=caseflow
```

## Bring-Up Sequence

1. Start Docker Desktop.
2. Run `npm run fabric:bootstrap`.
3. Start the local bridge instance:

```powershell
$env:FABRIC_BRIDGE_TOKEN="replace_with_a_long_random_secret"
npm run fabric:bridge
```

4. Expose port `3010` through your tunnel provider and copy the HTTPS URL.
   Or use the included quick-tunnel helper:

```powershell
cmd /c scripts\start-cloudflare-quick-tunnel.cmd
```

5. Configure the hosted app with:
   - `FABRIC_ACCESS_MODE=bridge`
   - `FABRIC_BRIDGE_URL=<your tunnel url>`
   - `FABRIC_BRIDGE_TOKEN=<same secret>`
6. Verify:
   - hosted `GET /api/health/blockchain`
   - hosted `GET /api/health/system`
   - create a case from the public app
   - query and verify the same case

## Operational Notes

- If your machine is off, blockchain anchoring is off.
- If the tunnel changes URL, update `FABRIC_BRIDGE_URL` on the hosted app.
- Keep the bridge token secret. Rotate it if the URL or machine is exposed.
- Keep the local Fabric machine on a stable internet connection and avoid sleeping/hibernating while the system is in use.

## Graduation Path

When money or sponsored infrastructure becomes available:

1. move the Fabric bridge from local machine to a VM
2. move peers and orderer to dedicated hosts
3. replace the tunnel with real DNS and TLS
4. keep the hosted app in `bridge` mode until the full Fabric client can safely run beside the peers
