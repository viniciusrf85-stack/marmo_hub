@echo off
chcp 65001 >nul
setlocal DISABLEDELAYEDEXPANSION

cd /d "%~dp0"

echo.
echo ═══════════════════════════════════════════════════════════
echo   MARMO HUB - Migração de Banco de Dados
echo   olx_pedra  -^>  marmo_hub
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
echo O MySQL vai solicitar a senha. Você precisará digitá-la 2 vezes.
echo.
pause

echo Verificando se o banco olx_pedra existe...
mysql -u %DB_USER% -p -e "USE olx_pedra"
if errorlevel 1 (
    echo.
    echo ✗ Banco 'olx_pedra' não encontrado!
    echo.
    echo É uma INSTALAÇÃO NOVA? Deseja criar marmo_hub direto?
    echo.
    set /p CRIAR_NOVO="Digite S para criar marmo_hub agora, ou N para cancelar: "
    if /i "%CRIAR_NOVO%"=="S" goto CRIAR_MARMO_HUB
    echo.
    goto fim
)

echo ✓ Banco olx_pedra encontrado
echo.

REM Criar pasta de backup
if not exist "backups" mkdir backups
set BACKUP_FILE=backups\backup_olx_pedra_pre_migracao.sql
set MIGRADO_FILE=backups\migracao_para_marmo_hub.sql

echo [1/4] Criando backup... Digite a senha novamente:
mysqldump -u %DB_USER% -p --databases olx_pedra --routines --triggers > "%BACKUP_FILE%"
if errorlevel 1 (
    echo ✗ Erro ao criar backup!
    goto fim
)
echo ✓ Backup salvo

echo.
echo [2/4] Processando...
powershell -Command "(Get-Content '%BACKUP_FILE%' -Raw) -replace 'olx_pedra', 'marmo_hub' | Set-Content '%MIGRADO_FILE%' -Encoding UTF8"

echo [3/4] Importando para marmo_hub... Digite a senha novamente:
mysql -u %DB_USER% -p < "%MIGRADO_FILE%"
if errorlevel 1 (
    echo ✗ Erro ao importar!
    goto fim
)

echo ✓ Banco marmo_hub criado
echo.
goto sucesso

:CRIAR_MARMO_HUB
echo.
echo [Instalação nova] Criando marmo_hub... Digite a senha:
mysql -u %DB_USER% -p < "%~dp0schema_marmo_hub.sql"
if errorlevel 1 (
    echo ✗ Erro ao criar marmo_hub!
    goto fim
)
echo ✓ Banco marmo_hub criado
echo.

:sucesso
echo ═══════════════════════════════════════════════════════════
echo   Concluído!
echo ═══════════════════════════════════════════════════════════
echo.
echo Atualize backend\.env: DB_NAME=marmo_hub e DB_PORT=3306
echo Login admin: admin@marmohub.com.br / admin123
echo.

:fim
echo.
pause
