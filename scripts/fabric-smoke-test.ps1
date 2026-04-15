param(
  [string]$CaseId = "CASE_SMOKE_001",
  [string]$PeerContainer = "peer0.org1.example.com"
)

$ErrorActionPreference = "Stop"

function Invoke-InPeer {
  param([string]$Script)

  $Script | docker exec -i `
    -e CORE_PEER_LOCALMSPID=Org1MSP `
    -e CORE_PEER_MSPCONFIGPATH=/tmp/live-org1-admin-msp `
    $PeerContainer sh
}

function Query-Case {
  param([string]$Id)

  $queryScript = @"
peer chaincode query -C mychannel -n caseflow -c '{"Args":["readCase","$Id"]}'
"@

  Invoke-InPeer -Script $queryScript
}

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message"
}

Write-Step "Running Fabric bootstrap"
powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "fabric-bootstrap.ps1") -PeerContainer $PeerContainer

Write-Step "Querying $CaseId before create"
$queryBefore = try {
  Query-Case -Id $CaseId 2>&1
} catch {
  $_ | Out-String
}
Write-Host $queryBefore

Write-Step "Creating $CaseId with endorsements from both peers"
$createScript = @"
payload='{"createdByUid":"admin","createdByRole":"clerk","title":"Smoke test case","description":"Fabric smoke test","evidenceHashes":[]}'
esc_payload=`$(printf '%s' "`$payload" | sed 's/\\/\\\\/g; s/"/\\"/g')
ctor=`$(printf '{"Args":["createCase","$CaseId","%s"]}' "`$esc_payload")
peer chaincode invoke -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /tmp/orderer-tlsca.pem -C mychannel -n caseflow --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /etc/hyperledger/fabric/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /tmp/org2-peer-tlsca.pem --waitForEvent -c "`$ctor"
"@
Invoke-InPeer -Script $createScript

Write-Step "Reading back $CaseId"
$queryAfter = Query-Case -Id $CaseId
Write-Host $queryAfter
