# 🔄 Guia de Migração - Separar Contas de Usuários

## ⚠️ IMPORTANTE: Backup Antes de Começar

```sql
-- Criar backup do banco
mysqldump -u root -p olx_pedra > backup_olx_pedra_$(date +%Y%m%d_%H%M%S).sql
```

## 📋 Passo a Passo da Migração

### 1. Verificar Estrutura Atual

```sql
USE olx_pedra;

-- Verificar dados existentes
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_empresas FROM empresas;
SELECT tipo_usuario, COUNT(*) FROM usuarios GROUP BY tipo_usuario;
```

### 2. Criar Novas Tabelas

```sql
-- Executar o schema_melhorado.sql
SOURCE database/schema_melhorado.sql;
```

### 3. Migrar Dados de Empresas para Contas

```sql
-- Migrar empresas (tipo_usuario = 'empresa') para tabela contas
INSERT INTO contas (
    email, senha, razao_social, nome_fantasia, cnpj, 
    inscricao_estadual, telefone_comercial, whatsapp, email_comercial, site,
    cep, logradouro, numero, complemento, bairro, cidade, estado,
    plano_id, data_inicio_plano, data_fim_plano,
    anuncios_utilizados, anuncios_disponiveis,
    descricao, logo, banner,
    aprovada, ativa, data_cadastro
)
SELECT 
    u.email, 
    u.senha, 
    e.razao_social, 
    e.nome_fantasia, 
    e.cnpj,
    e.inscricao_estadual,
    e.telefone_comercial,
    e.whatsapp,
    e.email_comercial,
    e.site,
    e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado,
    e.plano_id, 
    e.data_inicio_plano, 
    e.data_fim_plano,
    e.anuncios_utilizados, 
    e.anuncios_disponiveis,
    e.descricao,
    e.logo,
    e.banner,
    e.aprovada, 
    e.ativa, 
    e.data_cadastro
FROM empresas e
INNER JOIN usuarios u ON e.usuario_id = u.id
WHERE u.tipo_usuario = 'empresa';

-- Verificar migração
SELECT COUNT(*) as total_contas FROM contas;
```

### 4. Migrar Dados de Clientes para Usuários

```sql
-- Migrar clientes (tipo_usuario = 'cliente') para nova tabela usuarios
INSERT INTO usuarios (
    email, senha, nome, telefone,
    tipo_documento, cpf, cnpj,
    tipo_consumidor,
    foto_perfil, ativo, data_cadastro
)
SELECT 
    email,
    senha,
    nome,
    telefone,
    CASE 
        WHEN cpf IS NOT NULL AND cpf != '' THEN 'cpf'
        WHEN cnpj IS NOT NULL AND cnpj != '' THEN 'cnpj'
        ELSE 'cpf'
    END as tipo_documento,
    cpf,
    NULL as cnpj, -- Clientes não têm CNPJ na tabela antiga
    'consumidor_final' as tipo_consumidor, -- Padrão, pode ajustar depois
    foto_perfil,
    ativo,
    data_cadastro
FROM usuarios_antiga
WHERE tipo_usuario = 'cliente';

-- Verificar migração
SELECT COUNT(*) as total_usuarios FROM usuarios;
```

### 5. Migrar Administradores

```sql
-- Migrar administradores
INSERT INTO usuarios_administradores (email, senha, nome, telefone, ativo, foto_perfil, data_cadastro)
SELECT email, senha, nome, telefone, ativo, foto_perfil, data_cadastro
FROM usuarios_antiga
WHERE tipo_usuario = 'administrador';

-- Verificar
SELECT COUNT(*) as total_admins FROM usuarios_administradores;
```

### 6. Atualizar Foreign Keys

```sql
-- Criar tabela temporária para mapear IDs antigos -> novos
CREATE TEMPORARY TABLE mapeamento_contas AS
SELECT 
    e.id as empresa_id_antiga,
    c.id as conta_id_nova
FROM empresas e
INNER JOIN usuarios u ON e.usuario_id = u.id
INNER JOIN contas c ON c.cnpj = e.cnpj;

-- Atualizar tabela materiais
UPDATE materiais m
INNER JOIN mapeamento_contas mc ON m.empresa_id = mc.empresa_id_antiga
SET m.empresa_id = mc.conta_id_nova;

-- Atualizar tabela contatos
UPDATE contatos ct
INNER JOIN mapeamento_contas mc ON ct.empresa_id = mc.empresa_id_antiga
SET ct.empresa_id = mc.conta_id_nova;

-- Atualizar tabela historico_planos
UPDATE historico_planos hp
INNER JOIN mapeamento_contas mc ON hp.empresa_id = mc.empresa_id_antiga
SET hp.empresa_id = mc.conta_id_nova;
```

### 7. Renomear Colunas (Se necessário)

```sql
-- Renomear empresa_id para conta_id nas tabelas
ALTER TABLE materiais CHANGE COLUMN empresa_id conta_id INT NOT NULL;
ALTER TABLE contatos CHANGE COLUMN empresa_id conta_id INT NOT NULL;
ALTER TABLE historico_planos CHANGE COLUMN empresa_id conta_id INT NOT NULL;

-- Atualizar foreign keys
ALTER TABLE materiais 
DROP FOREIGN KEY materiais_ibfk_1,
ADD CONSTRAINT fk_materiais_conta FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

ALTER TABLE contatos 
DROP FOREIGN KEY contatos_ibfk_2,
ADD CONSTRAINT fk_contatos_conta FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

ALTER TABLE historico_planos 
DROP FOREIGN KEY historico_planos_ibfk_1,
ADD CONSTRAINT fk_historico_contas FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;
```

### 8. Verificar Integridade

```sql
-- Verificar se todos os dados foram migrados
SELECT 
    (SELECT COUNT(*) FROM usuarios_antiga WHERE tipo_usuario = 'empresa') as empresas_antigas,
    (SELECT COUNT(*) FROM contas) as contas_novas;

SELECT 
    (SELECT COUNT(*) FROM usuarios_antiga WHERE tipo_usuario = 'cliente') as clientes_antigos,
    (SELECT COUNT(*) FROM usuarios WHERE tipo_consumidor IS NOT NULL) as usuarios_novos;

-- Verificar foreign keys
SELECT COUNT(*) as materiais_sem_conta 
FROM materiais m 
LEFT JOIN contas c ON m.conta_id = c.id 
WHERE c.id IS NULL;
```

### 9. Limpeza (APÓS VALIDAÇÃO)

```sql
-- ⚠️ SÓ EXECUTAR APÓS VALIDAR QUE TUDO ESTÁ FUNCIONANDO

-- Renomear tabela antiga (backup)
RENAME TABLE usuarios TO usuarios_backup_antiga;
RENAME TABLE empresas TO empresas_backup_antiga;

-- Ou deletar se tiver certeza
-- DROP TABLE usuarios_backup_antiga;
-- DROP TABLE empresas_backup_antiga;
```

## ✅ Checklist de Validação

- [ ] Backup criado
- [ ] Novas tabelas criadas
- [ ] Dados de empresas migrados para contas
- [ ] Dados de clientes migrados para usuarios
- [ ] Administradores migrados
- [ ] Foreign keys atualizadas
- [ ] Views atualizadas
- [ ] Testes de integridade passaram
- [ ] Aplicação testada

## 🐛 Troubleshooting

### Erro: Foreign key constraint fails
```sql
-- Verificar dados órfãos
SELECT * FROM materiais WHERE empresa_id NOT IN (SELECT id FROM empresas);
```

### Erro: Duplicate entry
```sql
-- Verificar duplicatas
SELECT email, COUNT(*) FROM usuarios GROUP BY email HAVING COUNT(*) > 1;
SELECT cnpj, COUNT(*) FROM contas GROUP BY cnpj HAVING COUNT(*) > 1;
```

## 📝 Notas

- Mantenha as tabelas antigas como backup por pelo menos 1 semana
- Teste todas as funcionalidades após migração
- Atualize o código da aplicação antes de deletar tabelas antigas
