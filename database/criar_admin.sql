-- ============================================
-- CRIAR/MIGRAR ADMINISTRADOR
-- ============================================
-- Execute este script para garantir que o admin existe

USE olx_pedra;

-- Verificar se a tabela existe
SELECT 'Verificando tabela usuarios_administradores...' as status;

-- Verificar se admin já existe
SELECT 
    'Admin existente' as status,
    COUNT(*) as total
FROM usuarios_administradores 
WHERE email = 'admin@olxpedra.com' OR email = 'admin@marmohub.com.br';

-- Criar admin se não existir
-- Senha padrão: admin123 (hash bcrypt)
-- Criar para ambos os emails possíveis
INSERT INTO usuarios_administradores (nome, email, senha, ativo) 
VALUES 
('Administrador', 'admin@marmohub.com.br', '$2b$10$rI9YqXLZPZR8F4hqXRfqHO9V7v9ZQr2Q1FH5v3X6YzX3Lz5Q1FH5v', TRUE),
('Administrador', 'admin@olxpedra.com', '$2b$10$rI9YqXLZPZR8F4hqXRfqHO9V7v9ZQr2Q1FH5v3X6YzX3Lz5Q1FH5v', TRUE)
ON DUPLICATE KEY UPDATE 
    nome = 'Administrador',
    ativo = TRUE;

-- Verificar resultado
SELECT 
    'Admin criado/atualizado' as status,
    id,
    nome,
    email,
    ativo
FROM usuarios_administradores 
WHERE email = 'admin@marmohub.com.br' OR email = 'admin@olxpedra.com';

-- ============================================
-- NOTA: Senha padrão é 'admin123'
-- ============================================
