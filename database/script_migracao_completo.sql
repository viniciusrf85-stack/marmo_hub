-- ============================================
-- SCRIPT DE MIGRAÇÃO COMPLETO
-- Separar Contas de Usuários
-- ============================================
-- ⚠️ IMPORTANTE: Faça backup antes de executar!
-- ⚠️ Execute passo a passo e valide cada etapa

USE olx_pedra;

-- ============================================
-- ETAPA 1: Criar tabelas temporárias para backup
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios_backup AS SELECT * FROM usuarios;
CREATE TABLE IF NOT EXISTS empresas_backup AS SELECT * FROM empresas;

-- ============================================
-- ETAPA 2: Criar novas tabelas
-- ============================================
-- Executar schema_melhorado.sql primeiro
-- SOURCE database/schema_melhorado.sql;

-- ============================================
-- ETAPA 3: Migrar Empresas para Contas
-- ============================================
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
WHERE u.tipo_usuario = 'empresa'
ON DUPLICATE KEY UPDATE email = email;

-- Verificar
SELECT 
    'Empresas migradas' as status,
    COUNT(*) as total 
FROM contas;

-- ============================================
-- ETAPA 4: Migrar Clientes para Usuários
-- ============================================
-- Primeiro, criar tabela temporária com dados atualizados
CREATE TEMPORARY TABLE usuarios_temp AS
SELECT 
    id,
    email,
    senha,
    nome,
    telefone,
    cpf,
    NULL as cnpj, -- Clientes não têm CNPJ na estrutura antiga
    foto_perfil,
    ativo,
    data_cadastro,
    CASE 
        WHEN cpf IS NOT NULL AND cpf != '' THEN 'cpf'
        ELSE 'cpf' -- Padrão
    END as tipo_documento,
    'consumidor_final' as tipo_consumidor -- Padrão, pode ajustar depois
FROM usuarios
WHERE tipo_usuario = 'cliente';

-- Inserir na nova tabela usuarios
INSERT INTO usuarios (
    email, senha, nome, telefone,
    tipo_documento, cpf, cnpj,
    tipo_consumidor,
    foto_perfil, ativo, data_cadastro
)
SELECT 
    email, senha, nome, telefone,
    tipo_documento, cpf, cnpj,
    tipo_consumidor,
    foto_perfil, ativo, data_cadastro
FROM usuarios_temp
ON DUPLICATE KEY UPDATE email = email;

-- Verificar
SELECT 
    'Usuários migrados' as status,
    COUNT(*) as total 
FROM usuarios;

-- ============================================
-- ETAPA 5: Migrar Administradores
-- ============================================
INSERT INTO usuarios_administradores (email, senha, nome, telefone, ativo, foto_perfil, data_cadastro)
SELECT email, senha, nome, telefone, ativo, foto_perfil, data_cadastro
FROM usuarios
WHERE tipo_usuario = 'administrador'
ON DUPLICATE KEY UPDATE email = email;

-- Verificar
SELECT 
    'Administradores migrados' as status,
    COUNT(*) as total 
FROM usuarios_administradores;

-- ============================================
-- ETAPA 6: Criar mapeamento de IDs
-- ============================================
CREATE TEMPORARY TABLE mapeamento_contas AS
SELECT 
    e.id as empresa_id_antiga,
    c.id as conta_id_nova
FROM empresas e
INNER JOIN usuarios u ON e.usuario_id = u.id
INNER JOIN contas c ON c.cnpj = e.cnpj AND c.email = u.email;

-- Verificar mapeamento
SELECT COUNT(*) as total_mapeados FROM mapeamento_contas;

-- ============================================
-- ETAPA 7: Atualizar Foreign Keys
-- ============================================
-- Criar coluna temporária em materiais
ALTER TABLE materiais ADD COLUMN conta_id_temp INT;

-- Atualizar com novos IDs
UPDATE materiais m
INNER JOIN mapeamento_contas mc ON m.empresa_id = mc.empresa_id_antiga
SET m.conta_id_temp = mc.conta_id_nova;

-- Verificar atualização
SELECT 
    COUNT(*) as total_materiais,
    COUNT(conta_id_temp) as materiais_atualizados
FROM materiais;

-- Se tudo estiver OK, renomear coluna
-- ALTER TABLE materiais DROP COLUMN empresa_id;
-- ALTER TABLE materiais CHANGE COLUMN conta_id_temp conta_id INT NOT NULL;

-- Repetir para contatos
ALTER TABLE contatos ADD COLUMN conta_id_temp INT;

UPDATE contatos ct
INNER JOIN mapeamento_contas mc ON ct.empresa_id = mc.empresa_id_antiga
SET ct.conta_id_temp = mc.conta_id_nova;

-- Repetir para historico_planos
ALTER TABLE historico_planos ADD COLUMN conta_id_temp INT;

UPDATE historico_planos hp
INNER JOIN mapeamento_contas mc ON hp.empresa_id = mc.empresa_id_antiga
SET hp.conta_id_temp = mc.conta_id_nova;

-- ============================================
-- ETAPA 8: Validação Final
-- ============================================
SELECT 
    'Validação' as etapa,
    (SELECT COUNT(*) FROM usuarios_backup WHERE tipo_usuario = 'empresa') as empresas_antigas,
    (SELECT COUNT(*) FROM contas) as contas_novas,
    (SELECT COUNT(*) FROM usuarios_backup WHERE tipo_usuario = 'cliente') as clientes_antigos,
    (SELECT COUNT(*) FROM usuarios) as usuarios_novos;

-- Verificar integridade
SELECT 
    'Integridade' as check_type,
    COUNT(*) as materiais_sem_conta
FROM materiais m 
LEFT JOIN mapeamento_contas mc ON m.empresa_id = mc.empresa_id_antiga
WHERE mc.conta_id_nova IS NULL;

-- ============================================
-- ETAPA 9: Finalização (SÓ EXECUTAR APÓS VALIDAR)
-- ============================================
-- ⚠️ DESCOMENTE APENAS APÓS VALIDAR QUE TUDO ESTÁ OK

-- Remover colunas antigas e renomear
-- ALTER TABLE materiais DROP COLUMN empresa_id;
-- ALTER TABLE materiais CHANGE COLUMN conta_id_temp conta_id INT NOT NULL;
-- ALTER TABLE materiais ADD CONSTRAINT fk_materiais_conta FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

-- ALTER TABLE contatos DROP COLUMN empresa_id;
-- ALTER TABLE contatos CHANGE COLUMN conta_id_temp conta_id INT NOT NULL;
-- ALTER TABLE contatos ADD CONSTRAINT fk_contatos_conta FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

-- ALTER TABLE historico_planos DROP COLUMN empresa_id;
-- ALTER TABLE historico_planos CHANGE COLUMN conta_id_temp conta_id INT NOT NULL;
-- ALTER TABLE historico_planos ADD CONSTRAINT fk_historico_contas FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
