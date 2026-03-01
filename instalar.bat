@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════
echo   OLX PEDRA - Script de Instalação
echo ═══════════════════════════════════════════════
echo.

echo [1/4] Instalando dependências do backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ✗ Erro ao instalar dependências do backend
    pause
    exit /b 1
)
echo ✓ Dependências do backend instaladas com sucesso
echo.

echo [2/4] Criando arquivo .env...
if not exist .env (
    copy .env.example .env
    echo ✓ Arquivo .env criado. Por favor, configure suas credenciais!
    echo   Edite o arquivo backend\.env com suas configurações
) else (
    echo ⚠ Arquivo .env já existe, pulando...
)
cd ..
echo.

echo [3/4] Instalando dependências do frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ✗ Erro ao instalar dependências do frontend
    pause
    exit /b 1
)
echo ✓ Dependências do frontend instaladas com sucesso
cd ..
echo.

echo [4/4] Criando estrutura de diretórios...
if not exist backend\uploads mkdir backend\uploads
if not exist backend\uploads\materiais mkdir backend\uploads\materiais
if not exist backend\uploads\empresas mkdir backend\uploads\empresas
if not exist backend\uploads\usuarios mkdir backend\uploads\usuarios
echo ✓ Diretórios criados com sucesso
echo.

echo ═══════════════════════════════════════════════
echo   Instalação concluída com sucesso!
echo ═══════════════════════════════════════════════
echo.
echo PRÓXIMOS PASSOS:
echo.
echo 1. Configure o arquivo backend\.env com suas credenciais
echo 2. Importe o schema do banco de dados:
echo    mysql -u root -p olx_pedra ^< database\schema.sql
echo 3. Execute o sistema com: iniciar.bat
echo.
echo ═══════════════════════════════════════════════
pause



