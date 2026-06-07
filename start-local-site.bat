@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0start-local-site.ps1"
pause
