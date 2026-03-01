@echo off
chcp 65001 >nul
echo ============================================
echo   OLX PEDRA - Verificar/Iniciar MySQL
echo ============================================
echo.

REM Tentar diferentes nomes de serviço MySQL
set MYSQL_SERVICE=
for %%s in (MySQL80 MySQL MySQL57 MySQL5.7) do (
    sc query %%s >nul 2>&1
    if not errorlevel 1 (
        set MYSQL_SERVICE=%%s
        goto :found_service
    )
)

:found_service
if "%MYSQL_SERVICE%"=="" (
    echo [AVISO] Servico MySQL nao encontrado nos servicos do Windows
    echo.
    echo Solucoes:
    echo   1. Inicie o MySQL manualmente pelo XAMPP/WAMP
    echo   2. Inicie o MySQL manualmente pelo painel de controle
    echo   3. Verifique se o MySQL esta instalado
    echo.
    goto :test_connection
)

echo Servico MySQL encontrado: %MYSQL_SERVICE%
sc query %MYSQL_SERVICE% | find "RUNNING" >nul
if errorlevel 1 (
    echo MySQL nao esta rodando. Tentando iniciar...
    echo.
    echo [AVISO] Voce precisa executar como Administrador para iniciar servicos!
    echo.
    net start %MYSQL_SERVICE% 2>nul
    if errorlevel 1 (
        echo [ERRO] Nao foi possivel iniciar o MySQL automaticamente
        echo Execute este script como Administrador ou inicie manualmente
        echo.
    ) else (
        echo [OK] MySQL iniciado com sucesso!
        timeout /t 2 /nobreak >nul
    )
) else (
    echo [OK] MySQL ja esta rodando!
)

:test_connection
echo.
echo Testando conexao...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo [AVISO] MySQL nao encontrado no PATH
    echo Mas isso nao impede o sistema de funcionar se estiver rodando
) else (
    echo [OK] MySQL encontrado no PATH
)

echo.
pause

