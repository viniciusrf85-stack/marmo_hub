-- ============================================
-- DADOS DE EXEMPLO PARA TESTES
-- SISTEMA DE CONTROLE DE VENDAS PARA AGENCIADORES
-- ============================================
--
-- INSTRUÇÕES:
-- 1. Execute primeiro o script: EXECUTAR_SCHEMA_MANUAL.sql
-- 2. Depois execute este script para inserir dados de teste
-- 3. Use as queries abaixo para testar o sistema
--
-- ============================================

-- ============================================
-- PASSO 1: INSERIR AGENCIADORES DE TESTE
-- ============================================

-- Agenciador 1: João Silva
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
  '(27) 99999-1111',
  '123.456.789-10',
  2.00
);

-- Agenciador 2: Maria Santos
INSERT INTO agenciadores (
  conta_id,
  nome,
  email,
  telefone,
  cpf,
  percentual_comissao
) VALUES (
  1,
  'Maria Santos',
  'maria.santos@email.com',
  '(27) 99999-2222',
  '987.654.321-00',
  2.50
);

-- Agenciador 3: Carlos Oliveira
INSERT INTO agenciadores (
  conta_id,
  nome,
  email,
  telefone,
  cnpj,
  percentual_comissao
) VALUES (
  1,
  'Carlos Oliveira',
  'carlos.oliveira@email.com',
  '(27) 99999-3333',
  '12.345.678/0001-90',
  3.00
);

-- Verificar agenciadores inseridos
-- SELECT * FROM agenciadores;

-- ============================================
-- PASSO 2: INSERIR CLIENTES DO AGENCIADOR
-- ============================================

-- Clientes do João Silva
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
) VALUES 
(1, 'CPMG', 'contato@cpmg.com.br', '(31) 3333-3333', '12.345.678/0001-90', 'Rua Principal, 100', 'Belo Horizonte', 'MG', '30140-071', 'alta'),
(1, 'Construtora ABC', 'vendas@construtorabc.com.br', '(31) 3333-4444', '98.765.432/0001-11', 'Av. Secundária, 200', 'Belo Horizonte', 'MG', '30140-072', 'media'),
(1, 'Pedras & Mármores', 'contato@pedrasemar.com.br', '(31) 3333-5555', '11.111.111/0001-22', 'Rua Terciária, 300', 'Contagem', 'MG', '30140-073', 'baixa');

-- Clientes da Maria Santos
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
) VALUES 
(2, 'Empresa X', 'contato@empresax.com.br', '(21) 2222-1111', '22.222.222/0001-33', 'Rua A, 500', 'Rio de Janeiro', 'RJ', '20000-000', 'alta'),
(2, 'Empresa Y', 'vendas@empresay.com.br', '(21) 2222-2222', '33.333.333/0001-44', 'Rua B, 600', 'Rio de Janeiro', 'RJ', '20000-001', 'media');

-- Clientes do Carlos Oliveira
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
) VALUES 
(3, 'Pedreira São Paulo', 'contato@pedreirasp.com.br', '(11) 4444-1111', '44.444.444/0001-55', 'Rua C, 700', 'São Paulo', 'SP', '01000-000', 'alta'),
(3, 'Mármores Premium', 'vendas@marmorespremium.com.br', '(11) 4444-2222', '55.555.555/0001-66', 'Rua D, 800', 'São Paulo', 'SP', '01000-001', 'alta');

-- Verificar clientes inseridos
-- SELECT * FROM clientes_agenciador;

-- ============================================
-- PASSO 3: INSERIR VENDAS
-- ============================================

-- Venda 1: João Silva - CPMG
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
  'Venda de chapas de granito - 25 unidades',
  'confirmada'
);

-- Venda 2: João Silva - Construtora ABC
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
  'PROC001513',
  'Construtora ABC',
  15,
  1800.00,
  2.00,
  36.00,
  '2025-01-20',
  'Venda de chapas de mármore - 15 unidades',
  'confirmada'
);

-- Venda 3: Maria Santos - Empresa X
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
  2,
  'PROC001514',
  'Empresa X',
  30,
  3500.00,
  2.50,
  87.50,
  '2025-01-18',
  'Venda de chapas de granito - 30 unidades',
  'confirmada'
);

-- Venda 4: Carlos Oliveira - Pedreira São Paulo
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
  3,
  'PROC001515',
  'Pedreira São Paulo',
  50,
  6000.00,
  3.00,
  180.00,
  '2025-01-22',
  'Venda de chapas de mármore - 50 unidades',
  'confirmada'
);

-- Venda 5: Carlos Oliveira - Mármores Premium
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
  3,
  'PROC001516',
  'Mármores Premium',
  20,
  2400.00,
  3.00,
  72.00,
  '2025-02-01',
  'Venda de chapas de granito - 20 unidades',
  'pendente'
);

-- Verificar vendas inseridas
-- SELECT * FROM vendas_agenciador;

-- ============================================
-- PASSO 4: INSERIR PARCELAS DAS VENDAS
-- ============================================

-- Parcelas da Venda 1 (PROC001512) - 4 parcelas
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
(1, 1, 647.70, '2025-02-28', 'boleto', 'BOL001', 'paga', 'email enviado em 18-01'),
(1, 2, 647.70, '2025-03-31', 'boleto', 'BOL002', 'pendente', 'email enviado em 18-01'),
(1, 3, 647.70, '2025-04-30', 'boleto', 'BOL003', 'pendente', 'email enviado em 18-01'),
(1, 4, 647.70, '2025-05-31', 'boleto', 'BOL004', 'pendente', 'email enviado em 18-01');

-- Parcelas da Venda 2 (PROC001513) - 3 parcelas
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
(2, 1, 600.00, '2025-02-28', 'boleto', 'BOL005', 'paga', 'email enviado em 20-01'),
(2, 2, 600.00, '2025-03-31', 'boleto', 'BOL006', 'pendente', 'email enviado em 20-01'),
(2, 3, 600.00, '2025-04-30', 'boleto', 'BOL007', 'pendente', 'email enviado em 20-01');

-- Parcelas da Venda 3 (PROC001514) - 3 parcelas
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
(3, 1, 1166.67, '2025-02-28', 'boleto', 'BOL008', 'paga', 'email enviado em 18-01'),
(3, 2, 1166.67, '2025-03-31', 'boleto', 'BOL009', 'pendente', 'email enviado em 18-01'),
(3, 3, 1166.66, '2025-04-30', 'boleto', 'BOL010', 'pendente', 'email enviado em 18-01');

-- Parcelas da Venda 4 (PROC001515) - 2 parcelas
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
(4, 1, 3000.00, '2025-02-28', 'boleto', 'BOL011', 'paga', 'email enviado em 22-01'),
(4, 2, 3000.00, '2025-03-31', 'boleto', 'BOL012', 'pendente', 'email enviado em 22-01');

-- Parcelas da Venda 5 (PROC001516) - 2 parcelas
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
(5, 1, 1200.00, '2025-03-01', 'boleto', 'BOL013', 'pendente', 'email enviado em 01-02'),
(5, 2, 1200.00, '2025-04-01', 'boleto', 'BOL014', 'pendente', 'email enviado em 01-02');

-- Verificar parcelas inseridas
-- SELECT * FROM parcelas_venda;

-- ============================================
-- PASSO 5: REGISTRAR COMISSÕES
-- ============================================

-- Comissão Venda 1 - João Silva
INSERT INTO comissoes_agenciador (
  agenciador_id,
  venda_id,
  valor_venda,
  percentual_comissao,
  valor_comissao,
  periodo_mes,
  periodo_ano,
  status
) VALUES (1, 1, 2590.80, 2.00, 51.82, 1, 2025, 'pendente');

-- Comissão Venda 2 - João Silva
INSERT INTO comissoes_agenciador (
  agenciador_id,
  venda_id,
  valor_venda,
  percentual_comissao,
  valor_comissao,
  periodo_mes,
  periodo_ano,
  status
) VALUES (1, 2, 1800.00, 2.00, 36.00, 1, 2025, 'pendente');

-- Comissão Venda 3 - Maria Santos
INSERT INTO comissoes_agenciador (
  agenciador_id,
  venda_id,
  valor_venda,
  percentual_comissao,
  valor_comissao,
  periodo_mes,
  periodo_ano,
  status
) VALUES (2, 3, 3500.00, 2.50, 87.50, 1, 2025, 'pendente');

-- Comissão Venda 4 - Carlos Oliveira
INSERT INTO comissoes_agenciador (
  agenciador_id,
  venda_id,
  valor_venda,
  percentual_comissao,
  valor_comissao,
  periodo_mes,
  periodo_ano,
  status
) VALUES (3, 4, 6000.00, 3.00, 180.00, 1, 2025, 'pendente');

-- Comissão Venda 5 - Carlos Oliveira
INSERT INTO comissoes_agenciador (
  agenciador_id,
  venda_id,
  valor_venda,
  percentual_comissao,
  valor_comissao,
  periodo_mes,
  periodo_ano,
  status
) VALUES (3, 5, 2400.00, 3.00, 72.00, 2, 2025, 'pendente');

-- Verificar comissões inseridas
-- SELECT * FROM comissoes_agenciador;

-- ============================================
-- PASSO 6: REGISTRAR RECEBIMENTOS
-- ============================================

-- Recebimento João Silva - Janeiro 2025
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
  87.82,
  87.82,
  'transferencia',
  '2025-02-05',
  'TRF001',
  'pago'
);

-- Recebimento Maria Santos - Janeiro 2025
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
  2,
  1,
  2025,
  87.50,
  87.50,
  'transferencia',
  '2025-02-05',
  'TRF002',
  'pago'
);

-- Recebimento Carlos Oliveira - Janeiro 2025
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
  3,
  1,
  2025,
  180.00,
  180.00,
  'transferencia',
  '2025-02-05',
  'TRF003',
  'pago'
);

-- Verificar recebimentos inseridos
-- SELECT * FROM recebimentos_agenciador;

-- ============================================
-- PASSO 7: TESTES COM QUERIES
-- ============================================

-- TESTE 1: Resumo de Vendas por Agenciador
-- SELECT * FROM vw_vendas_por_agenciador;

-- TESTE 2: Parcelas Pendentes
-- SELECT * FROM vw_parcelas_pendentes;

-- TESTE 3: Comissões a Receber
-- SELECT * FROM vw_comissoes_a_receber;

-- TESTE 4: Desempenho de Clientes
-- SELECT * FROM vw_desempenho_clientes;

-- TESTE 5: Total de Vendas por Agenciador
-- SELECT 
--   a.id,
--   a.nome,
--   COUNT(DISTINCT v.id) as total_vendas,
--   SUM(v.valor_total) as valor_total,
--   SUM(v.comissao_valor) as comissoes_totais
-- FROM agenciadores a
-- LEFT JOIN vendas_agenciador v ON a.id = v.agenciador_id AND v.ativo = TRUE
-- WHERE a.ativo = TRUE
-- GROUP BY a.id, a.nome;

-- TESTE 6: Parcelas Pagas vs Pendentes
-- SELECT 
--   v.agenciador_id,
--   a.nome,
--   COUNT(DISTINCT CASE WHEN p.status = 'paga' THEN p.id END) as pagas,
--   COUNT(DISTINCT CASE WHEN p.status = 'pendente' THEN p.id END) as pendentes,
--   SUM(CASE WHEN p.status = 'paga' THEN p.valor ELSE 0 END) as valor_pago,
--   SUM(CASE WHEN p.status = 'pendente' THEN p.valor ELSE 0 END) as valor_pendente
-- FROM vendas_agenciador v
-- INNER JOIN agenciadores a ON v.agenciador_id = a.id
-- LEFT JOIN parcelas_venda p ON v.id = p.venda_id AND p.ativo = TRUE
-- WHERE v.ativo = TRUE
-- GROUP BY v.agenciador_id, a.nome;

-- ============================================
-- FIM DOS DADOS DE TESTE
-- ============================================
--
-- PRÓXIMOS PASSOS:
-- 1. Execute as queries de teste acima
-- 2. Verifique se os dados foram inseridos corretamente
-- 3. Teste as views para garantir que estão funcionando
-- 4. Proceda com a implementação das APIs
--
-- ============================================
