# Migração do Banco: olx_pedra → marmo_hub

## Opção 1: Script Automatizado (Recomendado)

Execute o arquivo `migrar_banco_marmo_hub.bat` na pasta `database`:

```batch
cd database
migrar_banco_marmo_hub.bat
```

Ou dê duplo clique no arquivo.

**Pré-requisitos:**
- MySQL instalado e no PATH do sistema
- Banco `olx_pedra` já criado e com dados (se for instalação nova, use o schema.sql antes)

**O script irá:**
1. Fazer backup de `olx_pedra` na pasta `backups/`
2. Criar o banco `marmo_hub` com toda a estrutura e dados
3. Manter o banco `olx_pedra` intacto (não remove)

---

## Opção 2: Migração Manual

Se o MySQL não estiver no PATH, use os comandos abaixo no prompt do MySQL ou CMD:

```batch
cd c:\Sistemas\marmo_hub\database

REM 1. Fazer backup
mysqldump -u root -p --databases olx_pedra --routines --triggers > backups\backup.sql

REM 2. Criar arquivo migrado (substituir olx_pedra por marmo_hub)
powershell -Command "(Get-Content 'backups\backup.sql' -Raw) -replace 'olx_pedra', 'marmo_hub' | Set-Content 'backups\marmo_hub_import.sql' -Encoding UTF8"

REM 3. Importar
mysql -u root -p < backups\marmo_hub_import.sql
```

---

## Após a Migração

1. **Atualize o arquivo `backend\.env`:**
   ```
   DB_NAME=marmo_hub
   ```

2. **Reinicie o backend** para usar o novo banco

3. **Opcional - Remover banco antigo** (apenas quando tiver certeza que tudo funciona):
   ```sql
   DROP DATABASE olx_pedra;
   ```
