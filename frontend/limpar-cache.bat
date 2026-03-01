@echo off
echo Limpando cache do Vite e node_modules...

REM Remover cache do Vite
if exist .vite (
    rmdir /s /q .vite
    echo Cache do Vite removido
)

REM Remover dist se existir
if exist dist (
    rmdir /s /q dist
    echo Pasta dist removida
)

echo.
echo Cache limpo! Agora reinicie o servidor com: npm run dev
pause
