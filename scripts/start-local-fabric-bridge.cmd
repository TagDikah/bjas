@echo off
setlocal

cd /d "%~dp0.."

if "%FABRIC_ACCESS_MODE%"=="" set "FABRIC_ACCESS_MODE=direct"
if "%FABRIC_BRIDGE_ONLY%"=="" set "FABRIC_BRIDGE_ONLY=true"
if "%FABRIC_BRIDGE_TOKEN%"=="" (
  echo FABRIC_BRIDGE_TOKEN is required before starting the bridge.
  exit /b 1
)
if "%FABRIC_ORGANIZATIONS_DIR%"=="" set "FABRIC_ORGANIZATIONS_DIR=C:\Users\BrainTech\fabric-samples\test-network\organizations"
if "%PORT%"=="" set "PORT=3010"
if "%HOSTNAME%"=="" set "HOSTNAME=127.0.0.1"

echo Starting local Fabric bridge on http://%HOSTNAME%:%PORT%
echo FABRIC_ACCESS_MODE=%FABRIC_ACCESS_MODE%
echo FABRIC_BRIDGE_ONLY=%FABRIC_BRIDGE_ONLY%

call npm run dev -- --hostname %HOSTNAME% --port %PORT%
