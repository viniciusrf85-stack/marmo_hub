-- ============================================
-- OLX PEDRA - Schema do Banco de Dados
-- Sistema de Marketplace de Pedras Ornamentais
-- ============================================

USE olx_pedra;

-- ============================================
-- TABELA: usuarios
-- Armazena todos os usuários do sistema
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    tipo_usuario ENUM('administrador', 'empresa', 'cliente', 'agenciador') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    foto_perfil VARCHAR(255),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tipo (tipo_usuario),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: planos
-- Define os planos de anúncios disponíveis
-- ============================================
CREATE TABLE IF NOT EXISTS planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    quantidade_anuncios INT NOT NULL,
    valor_mensal DECIMAL(10, 2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    destaque BOOLEAN DEFAULT FALSE,
    ordem INT DEFAULT 0,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: empresas
-- Dados das empresas cadastradas
-- ============================================
CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    plano_id INT,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    email_comercial VARCHAR(100),
    telefone_comercial VARCHAR(20),
    whatsapp VARCHAR(20),
    site VARCHAR(200),
    
    -- Endereço
    cep VARCHAR(9),
    logradouro VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Dados do plano
    data_inicio_plano DATE,
    data_fim_plano DATE,
    anuncios_utilizados INT DEFAULT 0,
    anuncios_disponiveis INT DEFAULT 0,
    
    -- Informações adicionais
    descricao TEXT,
    logo VARCHAR(255),
    banner VARCHAR(255),
    
    -- Status e datas
    aprovada BOOLEAN DEFAULT FALSE,
    ativa BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE SET NULL,
    INDEX idx_cnpj (cnpj),
    INDEX idx_ativa (ativa),
    INDEX idx_aprovada (aprovada),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: tipos_material
-- Categorias de materiais (Granito, Mármore, etc)
-- ============================================
CREATE TABLE IF NOT EXISTS tipos_material (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: materiais (Anúncios de pedras)
-- Produtos/materiais anunciados pelas empresas
-- ============================================
CREATE TABLE IF NOT EXISTS materiais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    tipo_material_id INT NOT NULL,
    
    -- Informações básicas
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    
    -- Características técnicas
    cor_predominante VARCHAR(50),
    origem VARCHAR(100),
    acabamento ENUM('polido', 'levigado', 'flameado', 'apicoado', 'bruto') DEFAULT 'polido',
    
    -- Dimensões e disponibilidade
    espessura_cm DECIMAL(5, 2),
    largura_cm DECIMAL(7, 2),
    comprimento_cm DECIMAL(7, 2),
    
    -- Preços
    valor_m2 DECIMAL(10, 2),
    valor_chapa DECIMAL(10, 2),
    promocao BOOLEAN DEFAULT FALSE,
    valor_promocional DECIMAL(10, 2),
    
    -- Estoque
    quantidade_chapas INT DEFAULT 0,
    quantidade_m2 DECIMAL(10, 2),
    
    -- Visualizações e destaques
    visualizacoes INT DEFAULT 0,
    destaque BOOLEAN DEFAULT FALSE,
    
    -- Status
    aprovado BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    
    -- Datas
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_material_id) REFERENCES tipos_material(id),
    INDEX idx_empresa (empresa_id),
    INDEX idx_tipo (tipo_material_id),
    INDEX idx_ativo (ativo),
    INDEX idx_aprovado (aprovado),
    INDEX idx_destaque (destaque),
    INDEX idx_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: fotos_materiais
-- Fotos dos materiais (1 principal + até 3 adicionais)
-- ============================================
CREATE TABLE IF NOT EXISTS fotos_materiais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    caminho VARCHAR(255) NOT NULL,
    principal BOOLEAN DEFAULT FALSE,
    ordem INT DEFAULT 0,
    legenda VARCHAR(200),
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE CASCADE,
    INDEX idx_material (material_id),
    INDEX idx_principal (principal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: agenciadores
-- Dados específicos dos agenciadores
-- ============================================
CREATE TABLE IF NOT EXISTS agenciadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    comissao_percentual DECIMAL(5, 2) DEFAULT 5.00,
    total_vendas_intermediadas INT DEFAULT 0,
    total_comissao DECIMAL(10, 2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: contatos
-- Registro de contatos entre clientes e empresas
-- ============================================
CREATE TABLE IF NOT EXISTS contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    empresa_id INT NOT NULL,
    cliente_id INT,
    
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    mensagem TEXT NOT NULL,
    
    respondido BOOLEAN DEFAULT FALSE,
    data_contato TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_material (material_id),
    INDEX idx_empresa (empresa_id),
    INDEX idx_respondido (respondido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: favoritos
-- Materiais favoritados pelos clientes
-- ============================================
CREATE TABLE IF NOT EXISTS favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    material_id INT NOT NULL,
    data_favorito TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorito (usuario_id, material_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_material (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: historico_planos
-- Histórico de mudanças de planos das empresas
-- ============================================
CREATE TABLE IF NOT EXISTS historico_planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    plano_anterior_id INT,
    plano_novo_id INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    valor_pago DECIMAL(10, 2),
    observacoes TEXT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_anterior_id) REFERENCES planos(id),
    FOREIGN KEY (plano_novo_id) REFERENCES planos(id),
    INDEX idx_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERÇÃO DE DADOS INICIAIS
-- ============================================

-- Inserir planos
INSERT INTO planos (nome, descricao, quantidade_anuncios, valor_mensal, ordem) VALUES
('Básico', 'Ideal para começar no marketplace', 3, 99.90, 1),
('Bronze', 'Para pequenas empresas', 6, 179.90, 2),
('Prata', 'Para médias empresas', 9, 249.90, 3),
('Ouro', 'Para grandes empresas', 12, 319.90, 4),
('Platina', 'Para distribuidores', 15, 389.90, 5),
('Diamante', 'Para grandes distribuidores', 18, 449.90, 6),
('Premium', 'Para indústrias completas', 21, 499.90, 7);

-- Inserir tipos de materiais
INSERT INTO tipos_material (nome, descricao) VALUES
('Granito', 'Pedra natural de origem magmática, muito resistente'),
('Mármore', 'Pedra natural de origem metamórfica, elegante e sofisticada'),
('Quartzito', 'Pedra metamórfica com alta resistência'),
('Limestone', 'Pedra calcária com visual único'),
('Travertino', 'Pedra porosa com aspecto rústico'),
('Ardósia', 'Pedra com camadas, ideal para revestimentos');

-- Inserir usuário administrador padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO usuarios (nome, email, senha, tipo_usuario, ativo) VALUES
('Administrador', 'admin@olxpedra.com', '$2b$10$rI9YqXLZPZR8F4hqXRfqHO9V7v9ZQr2Q1FH5v3X6YzX3Lz5Q1FH5v', 'administrador', TRUE);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Materiais com detalhes completos
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
    
    -- Empresa
    e.id AS empresa_id,
    e.nome_fantasia AS empresa_nome,
    e.cidade AS empresa_cidade,
    e.estado AS empresa_estado,
    e.telefone_comercial AS empresa_telefone,
    e.whatsapp AS empresa_whatsapp,
    e.logo AS empresa_logo,
    
    -- Foto principal
    (SELECT caminho FROM fotos_materiais WHERE material_id = m.id AND principal = TRUE LIMIT 1) AS foto_principal
FROM materiais m
INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
INNER JOIN empresas e ON m.empresa_id = e.id;

-- View: Estatísticas das empresas
CREATE OR REPLACE VIEW vw_estatisticas_empresas AS
SELECT 
    e.id,
    e.nome_fantasia,
    e.cnpj,
    p.nome AS plano_nome,
    e.anuncios_disponiveis,
    e.anuncios_utilizados,
    COUNT(DISTINCT m.id) AS total_anuncios,
    COUNT(DISTINCT CASE WHEN m.ativo = TRUE THEN m.id END) AS anuncios_ativos,
    SUM(m.visualizacoes) AS total_visualizacoes,
    COUNT(DISTINCT c.id) AS total_contatos,
    e.data_cadastro
FROM empresas e
LEFT JOIN planos p ON e.plano_id = p.id
LEFT JOIN materiais m ON e.id = m.empresa_id
LEFT JOIN contatos c ON e.id = c.empresa_id
GROUP BY e.id, e.nome_fantasia, e.cnpj, p.nome, e.anuncios_disponiveis, 
         e.anuncios_utilizados, e.data_cadastro;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Atualizar contador de anúncios ao inserir material
DELIMITER //
CREATE TRIGGER after_material_insert
AFTER INSERT ON materiais
FOR EACH ROW
BEGIN
    UPDATE empresas 
    SET anuncios_utilizados = anuncios_utilizados + 1
    WHERE id = NEW.empresa_id;
END//
DELIMITER ;

-- Trigger: Atualizar contador de anúncios ao deletar material
DELIMITER //
CREATE TRIGGER after_material_delete
AFTER DELETE ON materiais
FOR EACH ROW
BEGIN
    UPDATE empresas 
    SET anuncios_utilizados = GREATEST(0, anuncios_utilizados - 1)
    WHERE id = OLD.empresa_id;
END//
DELIMITER ;

-- ============================================
-- FIM DO SCHEMA
-- ============================================


