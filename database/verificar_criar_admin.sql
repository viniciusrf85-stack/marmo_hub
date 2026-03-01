-- ============================================
-- VERIFICAR E CRIAR ADMINISTRADOR
-- ============================================
-- Execute este script para garantir que o admin existe

USE olx_pedra;

-- Verificar se admin existe
SELECT 
    'Verificando admin...' as status,
    COUNT(*) as total_admins
FROM usuarios_administradores 
WHERE email IN ('admin@marmohub.com.br', 'admin@olxpedra.com');

-- Criar admin se não existir
-- Senha padrão: admin123
-- Hash bcrypt gerado: $2b$10$J7bZOWiMJNv8PefVbFEECeJqy.FxyuqW3EH0N1BuS572h4DDnCqFu
INSERT INTO usuarios_administradores (nome, email, senha, ativo) 
SELECT 'Administrador', 'admin@marmohub.com.br', '$2b$10$J7bZOWiMJNv8PefVbFEECeJqy.FxyuqW3EH0N1BuS572h4DDnCqFu', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios_administradores WHERE email = 'admin@marmohub.com.br'
);

-- Verificar resultado
SELECT 
    'Admin criado/verificado' as status,
    id,
    nome,
    email,
    ativo
FROM usuarios_administradores 
WHERE email = 'admin@marmohub.com.br';

-- ============================================
-- CREDENCIAIS:
-- Email: admin@marmohub.com.br
-- Senha: admin123
-- ============================================
