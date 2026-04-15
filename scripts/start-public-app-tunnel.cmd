@echo off
setlocal

cd /d "%~dp0.."

if "%TUNNEL_PORT%"=="" set "TUNNEL_PORT=3000"
if "%TUNNEL_LOCAL_HOST%"=="" set "TUNNEL_LOCAL_HOST=127.0.0.1"

echo Starting public app tunnel to http://%TUNNEL_LOCAL_HOST%:%TUNNEL_PORT%
call npm run app:tunnel
