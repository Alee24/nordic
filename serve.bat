@echo off
setlocal
title NORDIC Launcher

echo ==========================================
echo Starting NORDIC Development Servers
echo ==========================================

:: Start Vite Frontend
echo [*] Starting Vite (Port 8542)...
start "Nordic-Frontend" cmd /k "npm run dev"

:: Start PHP Backend
echo [*] Starting PHP (Port 8000)...
start "Nordic-Backend" cmd /k "C:\xampp\php\php.exe -S localhost:8000"

echo.
echo [+] Services launched!
echo [+] Frontend: http://localhost:8542
echo [+] Backend (Local PHP): http://localhost:8000/backend/api
echo [+] Backend (XAMPP): http://localhost/nordic/backend/api
echo.
echo [!] NOTE: To use the Local PHP server instead of XAMPP,
echo     create a .env file in the root with:
echo     VITE_API_URL=http://localhost:8000/backend/api
echo.
timeout /t 2
start http://localhost:8542
pause
