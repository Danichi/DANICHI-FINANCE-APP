@echo off
title Danichi Finance
cd /d "%~dp0"

echo Installing dependencies...

if not exist "node_modules" (
    call npm install
)
if not exist "client\node_modules" (
    cd client && call npm install && cd ..
)
if not exist "server\node_modules" (
    cd server && call npm install && cd ..
)

echo Starting Danichi Finance...
call npm run dev
