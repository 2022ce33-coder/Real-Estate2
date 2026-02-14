@echo off
echo ================================================
echo Starting Aura Home Server...
echo ================================================
cd /d "%~dp0"
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak >nul
echo.
echo Starting server on port 3001...
echo.
node server.js
pause
