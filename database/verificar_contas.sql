-- Verificar contas cadastradas
SELECT 
    id,
    nome_fantasia,
    razao_social,
    cnpj,
    email,
    aprovada,
    ativa,
    plano_id,
    data_cadastro
FROM contas
ORDER BY data_cadastro DESC;

-- Contar contas por status
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN aprovada = 0 THEN 1 ELSE 0 END) as pendentes,
    SUM(CASE WHEN aprovada = 1 THEN 1 ELSE 0 END) as aprovadas,
    SUM(CASE WHEN ativa = 0 THEN 1 ELSE 0 END) as inativas,
    SUM(CASE WHEN ativa = 1 THEN 1 ELSE 0 END) as ativas
FROM contas;
