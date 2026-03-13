param(
  [Parameter(Mandatory=$true)][string]$PublicKey,
  [Parameter(Mandatory=$true)][string]$PrivateKey,
  [Parameter(Mandatory=$true)][string]$ClusterId
)

$ip = (Invoke-WebRequest -UseBasicParsing "https://api.ipify.org").Content.Trim()
$cidr = "$ip/32"

Write-Host "Your public IP:" $ip
Write-Host "Adding CIDR to TiDB Cloud allowlist:" $cidr

# TiDB Cloud API base
$base = "https://api.tidbcloud.com/api/v1beta"

# NOTE: TiDB Cloud uses public/private key auth (basic style) for API calls.
# We'll use Authorization: Basic base64(public:private)
$bytes = [System.Text.Encoding]::UTF8.GetBytes("$PublicKey`:$PrivateKey")
$auth = [Convert]::ToBase64String($bytes)

$headers = @{
  "Authorization" = "Basic $auth"
  "Content-Type"  = "application/json"
}

# List current IP access rules
$listUrl = "$base/clusters/$ClusterId/allowed-ips"
try {
  $existing = Invoke-RestMethod -Method GET -Uri $listUrl -Headers $headers
} catch {
  Write-Host " Failed to fetch allowed IPs. Check keys/clusterId."
  throw
}

# If already present, exit
$already = $false
if ($existing -and $existing.items) {
  foreach ($item in $existing.items) {
    if ($item.cidr -eq $cidr) { $already = $true }
  }
}

if ($already) {
  Write-Host " IP already allowed:" $cidr
  exit 0
}

# Add new allow rule
$addUrl = "$base/clusters/$ClusterId/allowed-ips"
$body = @{ cidr = $cidr; description = "Dev machine auto-added" } | ConvertTo-Json

try {
  Invoke-RestMethod -Method POST -Uri $addUrl -Headers $headers -Body $body | Out-Null
  Write-Host " Added allowlist rule:" $cidr
} catch {
  Write-Host " Failed to add allowlist rule."
  throw
}
