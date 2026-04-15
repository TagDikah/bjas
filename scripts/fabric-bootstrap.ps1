param(
  [string]$PeerContainer = "peer0.org1.example.com",
  [string]$Org1Peer = "peer0.org1.example.com:7051",
  [string]$Org2Peer = "peer0.org2.example.com:9051",
  [string]$Orderer = "orderer.example.com:7050"
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message"
}

$homeDir = $env:USERPROFILE
if (-not $homeDir) {
  $homeDir = $env:HOME
}

$testNetworkOrgs = Join-Path $homeDir "fabric-samples\test-network\organizations"
if (-not (Test-Path $testNetworkOrgs)) {
  throw "Fabric test-network organizations directory not found: $testNetworkOrgs"
}

$org1AdminMsp = Join-Path $testNetworkOrgs "peerOrganizations\org1.example.com\users\Admin@org1.example.com\msp"
$ordererTlsCa = Join-Path $testNetworkOrgs "ordererOrganizations\example.com\tlsca\tlsca.example.com-cert.pem"
$org2TlsCa = Join-Path $testNetworkOrgs "peerOrganizations\org2.example.com\tlsca\tlsca.org2.example.com-cert.pem"

Write-Step "Starting Fabric containers"
docker start orderer.example.com peer0.org1.example.com peer0.org2.example.com | Out-Null

Write-Step "Copying admin MSP and TLS certificates into $PeerContainer"
docker cp $org1AdminMsp "${PeerContainer}:/tmp/live-org1-admin-msp" | Out-Null
docker cp $ordererTlsCa "${PeerContainer}:/tmp/orderer-tlsca.pem" | Out-Null
docker cp $org2TlsCa "${PeerContainer}:/tmp/org2-peer-tlsca.pem" | Out-Null

Write-Step "Repairing Linux-style MSP config paths inside the container"
$mspFix = @'
cat > /tmp/live-org1-admin-msp/config.yaml <<'EOF'
NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/ca.org1.example.com-cert.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/ca.org1.example.com-cert.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/ca.org1.example.com-cert.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/ca.org1.example.com-cert.pem
    OrganizationalUnitIdentifier: orderer
EOF

cat > /etc/hyperledger/fabric/msp/config.yaml <<'EOF'
NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/ca.org1.example.com-cert.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/ca.org1.example.com-cert.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/ca.org1.example.com-cert.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/ca.org1.example.com-cert.pem
    OrganizationalUnitIdentifier: orderer
EOF
'@
$mspFix | docker exec -i $PeerContainer sh | Out-Null

Write-Step "Bootstrap summary"
docker ps --format "table {{.Names}}`t{{.Status}}"

Write-Host ""
Write-Host "Fabric admin artifacts are ready inside ${PeerContainer}:"
Write-Host "  CORE_PEER_LOCALMSPID=Org1MSP"
Write-Host "  CORE_PEER_MSPCONFIGPATH=/tmp/live-org1-admin-msp"
Write-Host "  Org1 peer address: $Org1Peer"
Write-Host "  Org2 peer address: $Org2Peer"
Write-Host "  Orderer: $Orderer"
