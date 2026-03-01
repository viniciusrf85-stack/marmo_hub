-- ============================================
-- OLX PEDRA - Schema Melhorado
-- Separação entre CONTAS (Empresas Anunciantes) e USUARIOS (Consumidores)
-- ============================================

USE olx_pedra;

-- ============================================
-- TABELA: contas
-- Empresas anunciantes (CNPJ) vinculadas a planos
-- ============================================
CREATE TABLE IF NOT EXISTS contas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Dados de acesso
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    
    -- Dados da empresa
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    
    -- Contato
    telefone_comercial VARCHAR(20),
    whatsapp VARCHAR(20),
    email_comercial VARCHAR(100),
    site VARCHAR(200),
    
    -- Endereço
    cep VARCHAR(9),
    logradouro VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Plano contratado
    plano_id INT,
    data_inicio_plano DATE,
    data_fim_plano DATE,
    anuncios_utilizados INT DEFAULT 0,
    anuncios_disponiveis INT DEFAULT 0,
    
    -- Informações adicionais
    descricao TEXT,
    logo VARCHAR(255),
    banner VARCHAR(255),
    
    -- Status
    aprovada BOOLEAN DEFAULT FALSE,
    ativa BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_cnpj (cnpj),
    INDEX idx_ativa (ativa),
    INDEX idx_aprovada (aprovada),
    INDEX idx_plano (plano_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: usuarios
-- Consumidores (PF ou PJ) que procuram pedras
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Dados de acesso
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    
    -- Dados pessoais/empresariais
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    
    -- Tipo de documento (PF ou PJ)
    tipo_documento ENUM('cpf', 'cnpj') NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    cnpj VARCHAR(18) UNIQUE,
    
    -- Perfil do consumidor
    tipo_consumidor ENUM('consumidor_final', 'marmorista', 'atacadista', 'construtor', 'outro') NOT NULL,
    
    -- Dados opcionais para PJ
    razao_social VARCHAR(200),
    nome_fantasia VARCHAR(200),
    inscricao_estadual VARCHAR(20),
    
    -- Endereço (opcional)
    cep VARCHAR(9),
    logradouro VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Perfil
    foto_perfil VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_cnpj (cnpj),
    INDEX idx_tipo_consumidor (tipo_consumidor),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: usuarios_administradores
-- Administradores do sistema
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios_administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    foto_perfil VARCHAR(255),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ATUALIZAR TABELA: empresas -> contas
-- Migrar dados existentes
-- ============================================
-- NOTA: Execute este script apenas se já tiver dados na tabela empresas
-- INSERT INTO contas (
--     email, senha, razao_social, nome_fantasia, cnpj, 
--     plano_id, data_inicio_plano, data_fim_plano,
--     anuncios_utilizados, anuncios_disponiveis,
--     aprovada, ativa, data_cadastro
-- )
-- SELECT 
--     u.email, u.senha, e.razao_social, e.nome_fantasia, e.cnpj,
--     e.plano_id, e.data_inicio_plano, e.data_fim_plano,
--     e.anuncios_utilizados, e.anuncios_disponiveis,
--     e.aprovada, e.ativa, e.data_cadastro
-- FROM empresas e
-- INNER JOIN usuarios u ON e.usuario_id = u.id
-- WHERE u.tipo_usuario = 'empresa';

-- ============================================
-- ATUALIZAR TABELA: materiais
-- Alterar referência de empresa_id para conta_id
-- ============================================
-- ALTER TABLE materiais 
-- CHANGE COLUMN empresa_id conta_id INT NOT NULL,
-- DROP FOREIGN KEY materiais_ibfk_1,
-- ADD FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

-- ============================================
-- ATUALIZAR TABELA: contatos
-- Alterar referência de empresa_id para conta_id
-- ============================================
-- ALTER TABLE contatos
-- CHANGE COLUMN empresa_id conta_id INT NOT NULL,
-- DROP FOREIGN KEY contatos_ibfk_2,
-- ADD FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

-- ============================================
-- ATUALIZAR TABELA: historico_planos
-- Alterar referência de empresa_id para conta_id
-- ============================================
-- ALTER TABLE historico_planos
-- CHANGE COLUMN empresa_id conta_id INT NOT NULL,
-- DROP FOREIGN KEY historico_planos_ibfk_1,
-- ADD FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

-- ============================================
-- VIEWS ATUALIZADAS
-- ============================================

-- View: Materiais com detalhes completos (atualizada)
CREATE OR REPLACE VIEW vw_materiais_completo AS
SELECT 
    m.id,
    m.nome,
    m.descricao,
    m.cor_predominante,
    m.origem,
    m.acabamento,
    m.valor_m2,
    m.valor_chapa,
    m.promocao,
    m.valor_promocional,
    m.quantidade_chapas,
    m.quantidade_m2,
    m.visualizacoes,
    m.destaque,
    m.ativo,
    m.aprovado,
    m.data_cadastro,
    
    -- Tipo de material
    tm.nome AS tipo_material,
    
    -- Conta (empresa)
    c.id AS conta_id,
    c.nome_fantasia AS empresa_nome,
    c.cidade AS empresa_cidade,
    c.estado AS empresa_estado,
    c.telefone_comercial AS empresa_telefone,
    c.whatsapp AS empresa_whatsapp,
    c.logo AS empresa_logo,
    
    -- Foto principal
    (SELECT caminho FROM fotos_materiais WHERE material_id = m.id AND principal = TRUE LIMIT 1) AS foto_principal
FROM materiais m
INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
INNER JOIN contas c ON m.conta_id = c.id;

-- View: Estatísticas das contas (atualizada)
CREATE OR REPLACE VIEW vw_estatisticas_contas AS
SELECT 
    c.id,
    c.nome_fantasia,
    c.cnpj,
    p.nome AS plano_nome,
    c.anuncios_disponiveis,
    c.anuncios_utilizados,
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

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir administrador padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO usuarios_administradores (nome, email, senha, ativo) VALUES
('Administrador', 'admin@olxpedra.com', '$2b$10$rI9YqXLZPZR8F4hqXRfqHO9V7v9ZQr2Q1FH5v3X6YzX3Lz5Q1FH5v', TRUE)
ON DUPLICATE KEY UPDATE nome = nome;

-- ============================================
-- FIM DO SCHEMA MELHORADO
-- ============================================
