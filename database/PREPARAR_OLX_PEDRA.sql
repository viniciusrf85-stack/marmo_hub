-- ============================================
-- PREPARAR BANCO OLX_PEDRA PARA AGENCIADORES
-- ============================================
-- Este script prepara o banco olx_pedra existente
-- adicionando dados iniciais necessários para testar
-- o sistema de agenciadores

USE olx_pedra;

-- ============================================
-- 1. VERIFICAR E CRIAR TABELA agenciador_empresas
-- ============================================
CREATE TABLE IF NOT EXISTS agenciador_empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agenciador_id INT NOT NULL,
    empresa_nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    comissao_percentual DECIMAL(5, 2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agenciador_id) REFERENCES agenciadores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_agenciador_cnpj (agenciador_id, cnpj),
    INDEX idx_agenciador_id (agenciador_id),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. VERIFICAR TABELAS NECESSÁRIAS
-- ============================================
-- As seguintes tabelas DEVEM existir:
-- - usuarios
-- - agenciadores
-- - planos
-- - tipos_material
-- - contas
-- - materiais

-- ============================================
-- 3. INSERIR PLANOS (Se não existirem)
-- ============================================
INSERT IGNORE INTO planos (id, nome, descricao, quantidade_anuncios, valor_mensal, ativo, ordem, data_cadastro)
VALUES 
  (1, 'Plano Básico', 'Perfeito para começar', 10, 99.90, TRUE, 1, NOW()),
  (2, 'Plano Profissional', 'Para empresas em crescimento', 50, 299.90, TRUE, 2, NOW()),
  (3, 'Plano Premium', 'Máxima visibilidade', 200, 599.90, TRUE, 3, NOW());

-- ============================================
-- 4. INSERIR TIPOS DE MATERIAL (Se não existirem)
-- ============================================
INSERT IGNORE INTO tipos_material (id, nome, descricao, ativo, data_cadastro)
VALUES 
  (1, 'Granito', 'Pedras de granito natural de alta qualidade', TRUE, NOW()),
  (2, 'Mármore', 'Pedras de mármore natural e importado', TRUE, NOW()),
  (3, 'Quartzito', 'Pedras de quartzito resistente', TRUE, NOW()),
  (4, 'Calcário', 'Pedras de calcário natural', TRUE, NOW()),
  (5, 'Ardósia', 'Pedras de ardósia para revestimento', TRUE, NOW());

-- ============================================
-- 5. VERIFICAR ESTRUTURA DAS TABELAS
-- ============================================
-- Executar depois para verificar:
-- SHOW TABLES;
-- DESCRIBE agenciador_empresas;
-- DESCRIBE agenciadores;
-- DESCRIBE usuarios;

-- ============================================
-- 6. DADOS DE TESTE (Opcional)
-- ============================================
-- Descomente para criar dados de teste:

-- Criar usuário agenciador de teste
-- INSERT INTO usuarios (nome, email, telefone, senha, tipo_usuario, ativo, data_cadastro)
-- VALUES ('João Silva Teste', 'joao.teste@example.com', '11999999999', 
--         '$2b$10$...hash_da_senha...', 'agenciador', TRUE, NOW());

-- Criar agenciador de teste
-- INSERT INTO agenciadores (usuario_id, comissao_percentual, total_vendas_intermediadas, total_comissao, ativo, data_cadastro)
-- SELECT id, 5.00, 0, 0.00, TRUE, NOW() FROM usuarios WHERE email = 'joao.teste@example.com' LIMIT 1;

-- Adicionar empresas de teste ao agenciador
-- INSERT INTO agenciador_empresas (agenciador_id, empresa_nome, cnpj, localizacao, comissao_percentual, ativo, data_cadastro)
-- SELECT a.id, 'Mármores Brasil Ltda', '12345678000195', 'São Paulo, SP', 8.50, TRUE, NOW()
-- FROM agenciadores a
-- JOIN usuarios u ON a.usuario_id = u.id
-- WHERE u.email = 'joao.teste@example.com' LIMIT 1;

-- ============================================
-- 7. VERIFICAÇÕES FINAIS
-- ============================================
-- Execute estas queries para verificar:

-- Ver planos criados
-- SELECT * FROM planos;

-- Ver tipos de material criados
-- SELECT * FROM tipos_material;

-- Ver agenciadores existentes
-- SELECT u.id, u.nome, u.email, a.id as agenciador_id, a.comissao_percentual
-- FROM usuarios u
-- JOIN agenciadores a ON u.id = a.usuario_id
-- WHERE u.tipo_usuario = 'agenciador';

-- Ver empresas de um agenciador
-- SELECT * FROM agenciador_empresas WHERE agenciador_id = 1;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- O banco está pronto para testar o sistema de agenciadores!
-- Próximos passos:
-- 1. Configure o .env com DB_NAME=olx_pedra
-- 2. Inicie o servidor: npm start
-- 3. Registre um agenciador via /registro-agenciador
-- 4. Adicione empresas via /agenciador-empresas
