@echo off
chcp 65001 >nul
echo ============================================
echo   OLX PEDRA - Atualizar Configuracao .env
echo ============================================
echo.
echo Este script atualizara o arquivo backend\.env
echo com as credenciais do MySQL que voce informar.
echo.

set /p DB_USER="Usuario MySQL (padrao: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASSWORD="Senha MySQL: "

set /p DB_NAME="Nome do banco (padrao: olx_pedra): "
if "%DB_NAME%"=="" set DB_NAME=olx_pedra

echo.
echo Testando conexao...
mysql -u %DB_USER% -p%DB_PASSWORD% -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERRO] Nao foi possivel conectar ao MySQL com essas credenciais!
    echo Verifique se o MySQL esta rodando e se o usuario/senha estao corretos.
    pause
    exit /b 1
)

echo [OK] Conexao estabelecida com sucesso!
echo.

echo Criando banco de dados (se nao existir)...
mysql -u %DB_USER% -p%DB_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>&1

echo Atualizando arquivo .env...
(
echo # Configuracoes do Servidor
echo PORT=3001
echo NODE_ENV=development
echo.
echo # Configuracoes do Banco de Dados MySQL
echo DB_HOST=localhost
echo DB_PORT=3306
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo DB_NAME=%DB_NAME%
echo.
echo # Configuracoes JWT
echo JWT_SECRET=olx_pedra_super_secret_key_change_in_production_12345
echo JWT_EXPIRES_IN=7d
echo.
echo # Configuracoes de Upload
echo MAX_FILE_SIZE=5242880
echo UPLOAD_PATH=./uploads
echo.
echo # URLs
echo FRONTEND_URL=http://localhost:5173
echo BACKEND_URL=http://localhost:3001
) > backend\.env

echo.
echo [OK] Arquivo .env atualizado com sucesso!
echo.

set /p IMPORTAR="Deseja importar o schema do banco? (S/N): "
if /i "%IMPORTAR%"=="S" (
    if exist database\schema.sql (
        echo Importando schema...
        mysql -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < database\schema.sql
        echo [OK] Schema importado!
    ) else (
        echo [AVISO] Arquivo database\schema.sql nao encontrado!
    )
)

echo.
echo ============================================
echo   Configuracao concluida!
echo ============================================
echo.
pause

