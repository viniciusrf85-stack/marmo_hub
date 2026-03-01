@echo off
chcp 65001 >nul
echo ============================================
echo   OLX PEDRA - Resetar Senha do Admin
echo ============================================
echo.

cd backend
node reset-senha-admin.js

cd ..
echo.
pause

