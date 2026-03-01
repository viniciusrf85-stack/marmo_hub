@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ═══════════════════════════════════════════════
echo   OLX PEDRA - Iniciando Sistema
echo ═══════════════════════════════════════════════
echo.

echo Verificando dependências...
if not exist backend\node_modules (
    echo ✗ Dependências do backend não encontradas!
    echo Execute primeiro: instalar.bat
    pause
    exit /b 1
)

if not exist frontend\node_modules (
    echo ✗ Dependências do frontend não encontradas!
    echo Execute primeiro: instalar.bat
    pause
    exit /b 1
)

if not exist backend\.env (
    echo ✗ Arquivo .env não encontrado!
    echo Execute primeiro: instalar.bat
    pause
    exit /b 1
)

echo ✓ Todas as dependências OK
echo.

echo Verificando MySQL...
REM Verificar se o MySQL está no PATH (opcional)
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠ MySQL não encontrado no PATH (não é crítico)
    echo O sistema tentará conectar automaticamente via Node.js
    echo.
) else (
    echo ✓ MySQL encontrado no sistema
    echo.
)

REM Teste de conexão será feito pelo próprio Node.js ao iniciar
echo Nota: A conexão com o banco será testada automaticamente ao iniciar o backend
echo.

echo Iniciando Backend (Node.js - Porta 3001)...
start "OLX Pedra - Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Iniciando Frontend (React/Vite - Porta 5173)...
start "OLX Pedra - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ═══════════════════════════════════════════════
echo   Sistema iniciado com sucesso!
echo ═══════════════════════════════════════════════
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:5173

echo.
echo Para parar o sistema, feche as janelas do Backend e Frontend
echo.



