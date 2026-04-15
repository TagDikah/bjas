@echo off
setlocal

set "CLOUDFLARED_EXE=%USERPROFILE%\Desktop\cloudflared.exe"
if not exist "%CLOUDFLARED_EXE%" set "CLOUDFLARED_EXE=%~dp0..\.tools\cloudflared.exe"

if "%TUNNEL_URL%"=="" set "TUNNEL_URL=http://localhost:3010"

echo Starting Cloudflare Quick Tunnel to %TUNNEL_URL%
"%CLOUDFLARED_EXE%" tunnel --url %TUNNEL_URL%
