-- ============================================
-- QUERIES ÚTEIS PARA OPERAÇÕES COMUNS
-- ============================================

-- ============================================
-- 1. INSERIR NOVO AGENCIADOR
-- ============================================
INSERT INTO agenciadores (
  conta_id,
  nome,
  email,
  telefone,
  cpf,
  percentual_comissao
) VALUES (
  1,
  'João Silva',
  'joao.silva@email.com',
  '(27) 99999-9999',
  '123.456.789-10',
  2.00
);

-- ============================================
-- 2. INSERIR NOVA VENDA
-- ============================================
INSERT INTO vendas_agenciador (
  agenciador_id,
  numero_processo,
  cliente_nome,
  quantidade_chapas,
  valor_total,
  comissao_percentual,
  comissao_valor,
  data_venda,
  descricao,
  status
) VALUES (
  1,
  'PROC001512',
  'CPMG',
  25,
  2590.80,
  2.00,
  51.82,
  '2025-01-15',
  'Venda de chapas de granito',
  'confirmada'
);

-- ============================================
-- 3. INSERIR PARCELAS DE UMA VENDA
-- ============================================
INSERT INTO parcelas_venda (
  venda_id,
  numero_parcela,
  valor,
  data_vencimento,
  forma_pagamento,
  numero_boleto,
  status,
  confirmacao_boleto
) VALUES 
(1, 1, 647.70, '2025-02-28', 'boleto', 'BOL001', 'pendente', 'email enviado'),
(1, 2, 647.70, '2025-03-31', 'boleto', 'BOL002', 'pendente', 'email enviado'),
(1, 3, 647.70, '2025-04-30', 'boleto', 'BOL003', 'pendente', 'email enviado'),
(1, 4, 647.70, '2025-05-31', 'boleto', 'BOL004', 'pendente', 'email enviado');

-- ============================================
-- 4. REGISTRAR PAGAMENTO DE PARCELA
-- ============================================
UPDATE parcelas_venda
SET 
  status = 'paga',
  data_pagamento = CURDATE(),
  data_confirmacao = NOW()
WHERE id = 1;

-- ============================================
-- 5. CALCULAR E REGISTRAR COMISSÃO
-- ============================================
INSERT INTO comissoes_agenciador (
  agenciador_id,
  venda_id,
  valor_venda,
  percentual_comissao,
  valor_comissao,
  periodo_mes,
  periodo_ano,
  status
) VALUES (
  1,
  1,
  2590.80,
  2.00,
  51.82,
  1,
  2025,
  'pendente'
);

-- ============================================
-- 6. OBTER RESUMO DE VENDAS DO AGENCIADOR
-- ============================================
SELECT 
  a.id,
  a.nome,
  COUNT(DISTINCT v.id) as total_vendas,
  SUM(v.valor_total) as valor_total_vendas,
  SUM(v.comissao_valor) as total_comissoes,
  COUNT(DISTINCT CASE WHEN v.status = 'pendente' THEN v.id END) as vendas_pendentes,
  COUNT(DISTINCT CASE WHEN v.status = 'confirmada' THEN v.id END) as vendas_confirmadas
FROM agenciadores a
LEFT JOIN vendas_agenciador v ON a.id = v.agenciador_id AND v.ativo = TRUE
WHERE a.id = 1 AND a.ativo = TRUE
GROUP BY a.id, a.nome;

-- ============================================
-- 7. LISTAR PARCELAS PENDENTES DE UM AGENCIADOR
-- ============================================
SELECT 
  p.id,
  v.numero_processo,
  v.cliente_nome,
  p.numero_parcela,
  p.valor,
  p.data_vencimento,
  p.forma_pagamento,
  p.status,
  DATEDIFF(CURDATE(), p.data_vencimento) as dias_atraso
FROM parcelas_venda p
INNER JOIN vendas_agenciador v ON p.venda_id = v.id
INNER JOIN agenciadores a ON v.agenciador_id = a.id
WHERE a.id = 1 
  AND p.status IN ('pendente', 'atrasada')
  AND p.ativo = TRUE
ORDER BY p.data_vencimento ASC;

-- ============================================
-- 8. OBTER COMISSÕES A RECEBER POR MÊS
-- ============================================
SELECT 
  a.id,
  a.nome,
  c.periodo_mes,
  c.periodo_ano,
  SUM(c.valor_comissao) as total_comissoes,
  COUNT(DISTINCT c.venda_id) as total_vendas,
  COUNT(DISTINCT CASE WHEN c.status = 'pendente' THEN c.id END) as pendentes,
  COUNT(DISTINCT CASE WHEN c.status = 'paga' THEN c.id END) as pagas
FROM agenciadores a
LEFT JOIN comissoes_agenciador c ON a.id = c.agenciador_id AND c.ativo = TRUE
WHERE a.id = 1 AND a.ativo = TRUE
GROUP BY a.id, a.nome, c.periodo_ano, c.periodo_mes
ORDER BY c.periodo_ano DESC, c.periodo_mes DESC;

-- ============================================
-- 9. REGISTRAR RECEBIMENTO DE COMISSÃO
-- ============================================
INSERT INTO recebimentos_agenciador (
  agenciador_id,
  periodo_mes,
  periodo_ano,
  valor_total_comissoes,
  valor_recebido,
  forma_pagamento,
  data_recebimento,
  numero_comprovante,
  status
) VALUES (
  1,
  1,
  2025,
  51.82,
  51.82,
  'transferencia',
  CURDATE(),
  'TRF001',
  'pago'
);

-- ============================================
-- 10. ATUALIZAR STATUS DE COMISSÃO COMO PAGA
-- ============================================
UPDATE comissoes_agenciador
SET 
  status = 'paga',
  data_pagamento = CURDATE()
WHERE agenciador_id = 1 
  AND periodo_mes = 1 
  AND periodo_ano = 2025
  AND status = 'pendente';

-- ============================================
-- 11. ADICIONAR CLIENTE AO AGENCIADOR
-- ============================================
INSERT INTO clientes_agenciador (
  agenciador_id,
  nome_cliente,
  email,
  telefone,
  cnpj_cpf,
  endereco,
  cidade,
  estado,
  cep,
  prioridade
) VALUES (
  1,
  'CPMG',
  'contato@cpmg.com.br',
  '(31) 3333-3333',
  '12.345.678/0001-90',
  'Rua Principal, 100',
  'Belo Horizonte',
  'MG',
  '30140-071',
  'alta'
);

-- ============================================
-- 12. OBTER DESEMPENHO DE CLIENTES
-- ============================================
SELECT 
  ca.nome_cliente,
  ca.prioridade,
  COUNT(DISTINCT v.id) as total_vendas,
  SUM(v.valor_total) as valor_total,
  AVG(v.valor_total) as ticket_medio,
  MAX(v.data_venda) as ultima_venda,
  SUM(CASE WHEN p.status = 'pendente' THEN p.valor ELSE 0 END) as valor_pendente
FROM clientes_agenciador ca
LEFT JOIN vendas_agenciador v ON ca.agenciador_id = v.agenciador_id 
  AND ca.nome_cliente = v.cliente_nome 
  AND v.ativo = TRUE
LEFT JOIN parcelas_venda p ON v.id = p.venda_id AND p.ativo = TRUE
WHERE ca.agenciador_id = 1 AND ca.ativo = TRUE
GROUP BY ca.id, ca.nome_cliente, ca.prioridade
ORDER BY valor_total DESC;

-- ============================================
-- 13. RELATÓRIO MENSAL DE VENDAS
-- ============================================
SELECT 
  a.id,
  a.nome,
  YEAR(v.data_venda) as ano,
  MONTH(v.data_venda) as mes,
  COUNT(DISTINCT v.id) as total_vendas,
  SUM(v.valor_total) as valor_total_vendas,
  SUM(v.comissao_valor) as total_comissoes,
  COUNT(DISTINCT CASE WHEN p.status = 'paga' THEN p.id END) as parcelas_pagas,
  COUNT(DISTINCT CASE WHEN p.status = 'pendente' THEN p.id END) as parcelas_pendentes,
  SUM(CASE WHEN p.status = 'paga' THEN p.valor ELSE 0 END) as valor_recebido,
  SUM(CASE WHEN p.status = 'pendente' THEN p.valor ELSE 0 END) as valor_pendente
FROM agenciadores a
LEFT JOIN vendas_agenciador v ON a.id = v.agenciador_id AND v.ativo = TRUE
LEFT JOIN parcelas_venda p ON v.id = p.venda_id AND p.ativo = TRUE
WHERE a.id = 1 AND a.ativo = TRUE
GROUP BY a.id, a.nome, YEAR(v.data_venda), MONTH(v.data_venda)
ORDER BY ano DESC, mes DESC;

-- ============================================
-- 14. OBTER PARCELAS ATRASADAS
-- ============================================
SELECT 
  p.id,
  v.numero_processo,
  v.cliente_nome,
  a.nome as agenciador,
  p.numero_parcela,
  p.valor,
  p.data_vencimento,
  DATEDIFF(CURDATE(), p.data_vencimento) as dias_atraso,
  p.forma_pagamento
FROM parcelas_venda p
INNER JOIN vendas_agenciador v ON p.venda_id = v.id
INNER JOIN agenciadores a ON v.agenciador_id = a.id
WHERE p.status = 'pendente' 
  AND p.data_vencimento < CURDATE()
  AND p.ativo = TRUE
ORDER BY p.data_vencimento ASC;

-- ============================================
-- 15. OBTER COMISSÕES NÃO PAGAS
-- ============================================
SELECT 
  a.id,
  a.nome,
  c.periodo_mes,
  c.periodo_ano,
  COUNT(DISTINCT c.id) as total_comissoes,
  SUM(c.valor_comissao) as valor_total,
  MIN(c.data_cadastro) as data_mais_antiga
FROM agenciadores a
INNER JOIN comissoes_agenciador c ON a.id = c.agenciador_id
WHERE c.status = 'pendente' AND c.ativo = TRUE
GROUP BY a.id, a.nome, c.periodo_ano, c.periodo_mes
ORDER BY c.periodo_ano ASC, c.periodo_mes ASC;

-- ============================================
-- 16. ATUALIZAR TOTAL DE VENDAS DO CLIENTE
-- ============================================
UPDATE clientes_agenciador ca
SET total_vendas = (
  SELECT COALESCE(SUM(v.valor_total), 0)
  FROM vendas_agenciador v
  WHERE v.agenciador_id = ca.agenciador_id
    AND v.cliente_nome = ca.nome_cliente
    AND v.ativo = TRUE
)
WHERE ca.id = 1;

-- ============================================
-- 17. OBTER ESTATÍSTICAS GERAIS DO AGENCIADOR
-- ============================================
SELECT 
  a.id,
  a.nome,
  a.percentual_comissao,
  COUNT(DISTINCT v.id) as total_vendas_historico,
  SUM(v.valor_total) as valor_total_historico,
  SUM(v.comissao_valor) as comissoes_totais,
  COUNT(DISTINCT ca.id) as total_clientes,
  COUNT(DISTINCT CASE WHEN ca.prioridade = 'alta' THEN ca.id END) as clientes_prioritarios,
  (SELECT COUNT(*) FROM parcelas_venda p 
   INNER JOIN vendas_agenciador v2 ON p.venda_id = v2.id
   WHERE v2.agenciador_id = a.id AND p.status = 'pendente') as parcelas_pendentes,
  (SELECT SUM(valor_comissao) FROM comissoes_agenciador c 
   WHERE c.agenciador_id = a.id AND c.status = 'pendente') as comissoes_pendentes
FROM agenciadores a
LEFT JOIN vendas_agenciador v ON a.id = v.agenciador_id AND v.ativo = TRUE
LEFT JOIN clientes_agenciador ca ON a.id = ca.agenciador_id AND ca.ativo = TRUE
WHERE a.id = 1 AND a.ativo = TRUE
GROUP BY a.id, a.nome, a.percentual_comissao;

-- ============================================
-- 18. LISTAR TODAS AS VENDAS COM DETALHES
-- ============================================
SELECT 
  v.id,
  v.numero_processo,
  v.cliente_nome,
  v.quantidade_chapas,
  v.valor_total,
  v.comissao_valor,
  v.data_venda,
  v.status,
  COUNT(DISTINCT p.id) as total_parcelas,
  SUM(CASE WHEN p.status = 'paga' THEN 1 ELSE 0 END) as parcelas_pagas,
  SUM(CASE WHEN p.status = 'pendente' THEN p.valor ELSE 0 END) as valor_pendente
FROM vendas_agenciador v
LEFT JOIN parcelas_venda p ON v.id = p.venda_id AND p.ativo = TRUE
WHERE v.agenciador_id = 1 AND v.ativo = TRUE
GROUP BY v.id, v.numero_processo, v.cliente_nome, v.quantidade_chapas, 
         v.valor_total, v.comissao_valor, v.data_venda, v.status
ORDER BY v.data_venda DESC;

-- ============================================
-- 19. OBTER RESUMO POR FORMA DE PAGAMENTO
-- ============================================
SELECT 
  v.agenciador_id,
  p.forma_pagamento,
  COUNT(DISTINCT p.id) as total_parcelas,
  SUM(p.valor) as valor_total,
  COUNT(DISTINCT CASE WHEN p.status = 'paga' THEN p.id END) as pagas,
  COUNT(DISTINCT CASE WHEN p.status = 'pendente' THEN p.id END) as pendentes,
  COUNT(DISTINCT CASE WHEN p.status = 'atrasada' THEN p.id END) as atrasadas
FROM parcelas_venda p
INNER JOIN vendas_agenciador v ON p.venda_id = v.id
WHERE v.agenciador_id = 1 AND p.ativo = TRUE
GROUP BY v.agenciador_id, p.forma_pagamento
ORDER BY valor_total DESC;

-- ============================================
-- 20. OBTER HISTÓRICO DE IMPORTAÇÕES
-- ============================================
SELECT 
  id,
  nome_arquivo,
  nome_aba,
  total_linhas,
  linhas_importadas,
  linhas_erro,
  status,
  data_cadastro
FROM importacoes_planilha
WHERE agenciador_id = 1
ORDER BY data_cadastro DESC
LIMIT 10;

-- ============================================
-- FIM DAS QUERIES
-- ============================================
