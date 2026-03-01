-- ============================================
-- MARMO HUB - Migração de Banco de Dados
-- Copia olx_pedra → marmo_hub
--
-- Execute no MySQL Workbench, phpMyAdmin ou:
--   mysql -u root -p < migrar_olx_pedra_para_marmo_hub.sql
--
-- ESCOLHA o bloco correto na seção 1:
--   A) Schema com CONTAS (migrado) - backend atual
--   B) Schema com EMPRESAS (original)
-- ============================================

CREATE DATABASE IF NOT EXISTS marmo_hub 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 1. COPIAR TABELAS
-- ============================================

CREATE TABLE marmo_hub.planos LIKE olx_pedra.planos;
INSERT INTO marmo_hub.planos SELECT * FROM olx_pedra.planos;

CREATE TABLE marmo_hub.tipos_material LIKE olx_pedra.tipos_material;
INSERT INTO marmo_hub.tipos_material SELECT * FROM olx_pedra.tipos_material;

-- --- BLOCO A: Schema com CONTAS (descomente se for seu caso) ---
CREATE TABLE marmo_hub.contas LIKE olx_pedra.contas;
INSERT INTO marmo_hub.contas SELECT * FROM olx_pedra.contas;
CREATE TABLE marmo_hub.usuarios LIKE olx_pedra.usuarios;
INSERT INTO marmo_hub.usuarios SELECT * FROM olx_pedra.usuarios;
CREATE TABLE marmo_hub.usuarios_administradores LIKE olx_pedra.usuarios_administradores;
INSERT INTO marmo_hub.usuarios_administradores SELECT * FROM olx_pedra.usuarios_administradores;

-- --- BLOCO B: Schema com EMPRESAS (descomente se for seu caso) ---
-- CREATE TABLE marmo_hub.usuarios LIKE olx_pedra.usuarios;
-- INSERT INTO marmo_hub.usuarios SELECT * FROM olx_pedra.usuarios;
-- CREATE TABLE marmo_hub.empresas LIKE olx_pedra.empresas;
-- INSERT INTO marmo_hub.empresas SELECT * FROM olx_pedra.empresas;

CREATE TABLE marmo_hub.materiais LIKE olx_pedra.materiais;
INSERT INTO marmo_hub.materiais SELECT * FROM olx_pedra.materiais;

CREATE TABLE marmo_hub.fotos_materiais LIKE olx_pedra.fotos_materiais;
INSERT INTO marmo_hub.fotos_materiais SELECT * FROM olx_pedra.fotos_materiais;

CREATE TABLE marmo_hub.contatos LIKE olx_pedra.contatos;
INSERT INTO marmo_hub.contatos SELECT * FROM olx_pedra.contatos;

CREATE TABLE marmo_hub.favoritos LIKE olx_pedra.favoritos;
INSERT INTO marmo_hub.favoritos SELECT * FROM olx_pedra.favoritos;

CREATE TABLE marmo_hub.historico_planos LIKE olx_pedra.historico_planos;
INSERT INTO marmo_hub.historico_planos SELECT * FROM olx_pedra.historico_planos;

CREATE TABLE marmo_hub.agenciadores LIKE olx_pedra.agenciadores;
INSERT INTO marmo_hub.agenciadores SELECT * FROM olx_pedra.agenciadores;

-- ============================================
-- 2. VIEWS (escolha o bloco conforme seu schema)
-- ============================================

USE marmo_hub;

-- --- Views para schema CONTAS (bloco A) ---
CREATE OR REPLACE VIEW vw_materiais_completo AS
SELECT 
    m.id, m.nome, m.descricao, m.cor_predominante, m.origem, m.acabamento,
    m.valor_m2, m.valor_chapa, m.promocao, m.valor_promocional,
    m.quantidade_chapas, m.quantidade_m2, m.visualizacoes, m.destaque,
    m.ativo, m.aprovado, m.data_cadastro,
    tm.nome AS tipo_material,
    c.id AS empresa_id,
    c.nome_fantasia AS empresa_nome,
    c.cidade AS empresa_cidade,
    c.estado AS empresa_estado,
    c.telefone_comercial AS empresa_telefone,
    c.whatsapp AS empresa_whatsapp,
    c.logo AS empresa_logo,
    (SELECT caminho FROM fotos_materiais WHERE material_id = m.id AND principal = TRUE LIMIT 1) AS foto_principal
FROM materiais m
INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
INNER JOIN contas c ON m.conta_id = c.id;

CREATE OR REPLACE VIEW vw_estatisticas_empresas AS
SELECT 
    c.id, c.nome_fantasia, c.cnpj, p.nome AS plano_nome,
    c.anuncios_disponiveis, c.anuncios_utilizados,
    COUNT(DISTINCT m.id) AS total_anuncios,
    COUNT(DISTINCT CASE WHEN m.ativo = TRUE THEN m.id END) AS anuncios_ativos,
    SUM(m.visualizacoes) AS total_visualizacoes,
    COUNT(DISTINCT ct.id) AS total_contatos,
    c.data_cadastro
FROM contas c
LEFT JOIN planos p ON c.plano_id = p.id
LEFT JOIN materiais m ON c.id = m.conta_id
LEFT JOIN contatos ct ON c.id = ct.conta_id
GROUP BY c.id, c.nome_fantasia, c.cnpj, p.nome, c.anuncios_disponiveis, 
         c.anuncios_utilizados, c.data_cadastro;

-- --- Views para schema EMPRESAS (use se escolheu bloco B - troque contas→empresas, conta_id→empresa_id) ---
-- DROP VIEW IF EXISTS vw_materiais_completo;
-- DROP VIEW IF EXISTS vw_estatisticas_empresas;
-- CREATE VIEW vw_materiais_completo AS SELECT m.*, tm.nome AS tipo_material, e.id AS empresa_id, e.nome_fantasia AS empresa_nome, e.cidade AS empresa_cidade, e.estado AS empresa_estado, e.telefone_comercial AS empresa_telefone, e.whatsapp AS empresa_whatsapp, e.logo AS empresa_logo, (SELECT caminho FROM fotos_materiais WHERE material_id = m.id AND principal = TRUE LIMIT 1) AS foto_principal FROM materiais m INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id INNER JOIN empresas e ON m.empresa_id = e.id;
-- CREATE VIEW vw_estatisticas_empresas AS SELECT e.id, e.nome_fantasia, e.cnpj, p.nome AS plano_nome, e.anuncios_disponiveis, e.anuncios_utilizados, COUNT(DISTINCT m.id) AS total_anuncios, COUNT(DISTINCT CASE WHEN m.ativo = TRUE THEN m.id END) AS anuncios_ativos, SUM(m.visualizacoes) AS total_visualizacoes, COUNT(DISTINCT c.id) AS total_contatos, e.data_cadastro FROM empresas e LEFT JOIN planos p ON e.plano_id = p.id LEFT JOIN materiais m ON e.id = m.empresa_id LEFT JOIN contatos c ON e.id = c.empresa_id GROUP BY e.id, e.nome_fantasia, e.cnpj, p.nome, e.anuncios_disponiveis, e.anuncios_utilizados, e.data_cadastro;

-- ============================================
-- 3. TRIGGERS (usa contas - para empresas, troque contas→empresas e conta_id→empresa_id)
-- ============================================

DELIMITER //

DROP TRIGGER IF EXISTS after_material_insert//
CREATE TRIGGER after_material_insert
AFTER INSERT ON materiais
FOR EACH ROW
BEGIN
    UPDATE contas SET anuncios_utilizados = anuncios_utilizados + 1 WHERE id = NEW.conta_id;
END//

DROP TRIGGER IF EXISTS after_material_delete//
CREATE TRIGGER after_material_delete
AFTER DELETE ON materiais
FOR EACH ROW
BEGIN
    UPDATE contas SET anuncios_utilizados = GREATEST(0, anuncios_utilizados - 1) WHERE id = OLD.conta_id;
END//

DELIMITER ;

-- ============================================
-- Concluído! Atualize backend\.env: DB_NAME=marmo_hub
-- ============================================
