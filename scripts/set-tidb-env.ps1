$env:TIDB_HOST="gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
$env:TIDB_PORT="4000"
$env:TIDB_USER="rEdjoJDR96UYpUa.root"
$env:TIDB_PASSWORD="PASTE_REAL_PASSWORD"
$env:TIDB_DATABASE="test"
$env:TIDB_CA="certs\tidb-ca.pem"

"TIDB_HOST=$env:TIDB_HOST"
"TIDB_PORT=$env:TIDB_PORT"
"TIDB_USER=$env:TIDB_USER"
"TIDB_DATABASE=$env:TIDB_DATABASE"
"TIDB_CA=$env:TIDB_CA"
"PASS_SET=" + (-not [string]::IsNullOrWhiteSpace($env:TIDB_PASSWORD))
