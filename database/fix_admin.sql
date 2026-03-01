-- ============================================
-- CORRIGIR ADMINISTRADOR
-- ============================================
-- Execute este script para garantir que o admin funciona

USE olx_pedra;

-- 1. Verificar se a tabela existe
SELECT 'Verificando tabela usuarios_administradores...' as status;

-- 2. Verificar se admin existe
SELECT 
    'Admin existente' as status,
    id,
    nome,
    email,
    ativo,
    LENGTH(senha) as tamanho_senha_hash
FROM usuarios_administradores 
WHERE email IN ('admin@marmohub.com.br', 'admin@olxpedra.com');

-- 3. Deletar admins antigos (se houver duplicatas)
DELETE FROM usuarios_administradores 
WHERE email = 'admin@marmohub.com.br' AND id NOT IN (
    SELECT MIN(id) FROM (SELECT id FROM usuarios_administradores WHERE email = 'admin@marmohub.com.br') AS temp
);

-- 4. Criar/Atualizar admin com senha correta
-- Senha: admin123
-- Hash bcrypt gerado: $2b$10$J7bZOWiMJNv8PefVbFEECeJqy.FxyuqW3EH0N1BuS572h4DDnCqFu
INSERT INTO usuarios_administradores (nome, email, senha, ativo) 
VALUES 
('Administrador', 'admin@marmohub.com.br', '$2b$10$J7bZOWiMJNv8PefVbFEECeJqy.FxyuqW3EH0N1BuS572h4DDnCqFu', TRUE)
ON DUPLICATE KEY UPDATE 
    nome = 'Administrador',
    senha = '$2b$10$J7bZOWiMJNv8PefVbFEECeJqy.FxyuqW3EH0N1BuS572h4DDnCqFu',
    ativo = TRUE;

-- 5. Verificar resultado final
SELECT 
    'Admin configurado' as status,
    id,
    nome,
    email,
    ativo,
    'Senha: admin123' as credenciais
FROM usuarios_administradores 
WHERE email = 'admin@marmohub.com.br';

-- ============================================
-- CREDENCIAIS:
-- Email: admin@marmohub.com.br
-- Senha: admin123
-- ============================================
