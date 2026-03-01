@echo off
chcp 65001 >nul
setlocal DISABLEDELAYEDEXPANSION

cd /d "%~dp0"

echo.
echo ═══════════════════════════════════════════════════════════
echo   MARMO HUB - Criar Banco (Instalação Nova)
echo ═══════════════════════════════════════════════════════════
echo.

mysql --version >nul 2>&1
if errorlevel 1 (
    echo ✗ MySQL não encontrado no PATH!
    goto fim
)

echo ✓ MySQL encontrado
echo.

set /p DB_USER="Usuário MySQL (padrão: root): "
if "%DB_USER%"=="" set DB_USER=root

echo.
echo O MySQL vai solicitar a senha na próxima etapa.
echo.
pause

echo Criando banco marmo_hub...
mysql -u %DB_USER% -p < "%~dp0schema_marmo_hub.sql"
if errorlevel 1 (
    echo.
    echo ✗ Erro! Verifique usuário e senha.
    goto fim
)

echo.
echo ✓ Banco marmo_hub criado com sucesso!
echo.
echo ═══════════════════════════════════════════════════════════
echo   Próximos passos:
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Edite backend\.env:
echo    DB_NAME=marmo_hub
echo    DB_PORT=3306
echo.
echo 2. Login do admin:
echo    Email: admin@marmohub.com.br
echo    Senha: admin123
echo.

:fim
echo.
pause
