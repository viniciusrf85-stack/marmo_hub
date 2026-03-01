-- ============================================
-- SCHEMA DE CONTROLE DE VENDAS PARA AGENCIADORES
-- ============================================
-- Este script cria as tabelas necessárias para gerenciar
-- vendas, parcelas, comissões e recebimentos dos agenciadores

-- ============================================
-- 1. TABELA: AGENCIADORES
-- ============================================
-- Armazena informações dos agenciadores/vendedores
CREATE TABLE IF NOT EXISTS agenciadores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conta_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14) UNIQUE,
  cnpj VARCHAR(18),
  percentual_comissao DECIMAL(5, 2) DEFAULT 2.00,
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE,
  INDEX idx_agenciadores_conta_id (conta_id),
  INDEX idx_agenciadores_ativo (ativo),
  INDEX idx_agenciadores_email (email)
);

-- ============================================
-- 2. TABELA: VENDAS_AGENCIADOR
-- ============================================
-- Armazena as vendas realizadas pelos agenciadores
CREATE TABLE IF NOT EXISTS vendas_agenciador (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agenciador_id INT NOT NULL,
  numero_processo VARCHAR(50) NOT NULL UNIQUE,
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_id INT,
  quantidade_chapas INT,
  valor_total DECIMAL(12, 2) NOT NULL,
  comissao_percentual DECIMAL(5, 2) DEFAULT 2.00,
  comissao_valor DECIMAL(12, 2),
  comissao_paga BOOLEAN DEFAULT FALSE,
  data_venda DATE NOT NULL,
  descricao TEXT,
  status ENUM('pendente', 'confirmada', 'cancelada') DEFAULT 'pendente',
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (agenciador_id) REFERENCES agenciadores(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_vendas_agenciador_id (agenciador_id),
  INDEX idx_vendas_numero_processo (numero_processo),
  INDEX idx_vendas_data_venda (data_venda),
  INDEX idx_vendas_status (status),
  INDEX idx_vendas_comissao_paga (comissao_paga),
  INDEX idx_vendas_agenciador_data (agenciador_id, data_venda)
);

-- ============================================
-- 3. TABELA: PARCELAS_VENDA
-- ============================================
-- Armazena as parcelas de cada venda
CREATE TABLE IF NOT EXISTS parcelas_venda (
  id INT PRIMARY KEY AUTO_INCREMENT,
  venda_id INT NOT NULL,
  numero_parcela INT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  forma_pagamento ENUM('boleto', 'cheque', 'dinheiro', 'transferencia', 'outro') DEFAULT 'boleto',
  numero_boleto VARCHAR(50),
  status ENUM('pendente', 'paga', 'atrasada', 'cancelada') DEFAULT 'pendente',
  data_pagamento DATE,
  observacao TEXT,
  confirmacao_boleto TEXT,
  data_confirmacao TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (venda_id) REFERENCES vendas_agenciador(id) ON DELETE CASCADE,
  UNIQUE KEY uk_venda_parcela (venda_id, numero_parcela),
  INDEX idx_parcelas_venda_id (venda_id),
  INDEX idx_parcelas_status (status),
  INDEX idx_parcelas_data_vencimento (data_vencimento),
  INDEX idx_parcelas_forma_pagamento (forma_pagamento),
  INDEX idx_parcelas_venda_status (venda_id, status)
);

-- ============================================
-- 4. TABELA: COMISSOES_AGENCIADOR
-- ============================================
-- Armazena o histórico de comissões dos agenciadores
CREATE TABLE IF NOT EXISTS comissoes_agenciador (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agenciador_id INT NOT NULL,
  venda_id INT NOT NULL,
  valor_venda DECIMAL(12, 2) NOT NULL,
  percentual_comissao DECIMAL(5, 2) NOT NULL,
  valor_comissao DECIMAL(12, 2) NOT NULL,
  periodo_mes INT NOT NULL,
  periodo_ano INT NOT NULL,
  status ENUM('pendente', 'paga', 'cancelada') DEFAULT 'pendente',
  data_pagamento DATE,
  observacao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (agenciador_id) REFERENCES agenciadores(id) ON DELETE CASCADE,
  FOREIGN KEY (venda_id) REFERENCES vendas_agenciador(id) ON DELETE CASCADE,
  INDEX idx_comissoes_agenciador_id (agenciador_id),
  INDEX idx_comissoes_venda_id (venda_id),
  INDEX idx_comissoes_status (status),
  INDEX idx_comissoes_periodo (periodo_ano, periodo_mes),
  INDEX idx_comissoes_agenciador_periodo (agenciador_id, periodo_ano, periodo_mes)
);

-- ============================================
-- 5. TABELA: RECEBIMENTOS_AGENCIADOR
-- ============================================
-- Armazena os recebimentos de comissões dos agenciadores
CREATE TABLE IF NOT EXISTS recebimentos_agenciador (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agenciador_id INT NOT NULL,
  periodo_mes INT NOT NULL,
  periodo_ano INT NOT NULL,
  valor_total_comissoes DECIMAL(12, 2) NOT NULL,
  valor_recebido DECIMAL(12, 2),
  forma_pagamento ENUM('transferencia', 'cheque', 'dinheiro', 'outro') DEFAULT 'transferencia',
  data_recebimento DATE,
  numero_comprovante VARCHAR(100),
  observacao TEXT,
  status ENUM('pendente', 'pago', 'cancelado') DEFAULT 'pendente',
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (agenciador_id) REFERENCES agenciadores(id) ON DELETE CASCADE,
  UNIQUE KEY uk_agenciador_periodo (agenciador_id, periodo_ano, periodo_mes),
  INDEX idx_recebimentos_agenciador_id (agenciador_id),
  INDEX idx_recebimentos_status (status),
  INDEX idx_recebimentos_periodo (periodo_ano, periodo_mes),
  INDEX idx_recebimentos_data_recebimento (data_recebimento)
);

-- ============================================
-- 6. TABELA: CLIENTES_AGENCIADOR
-- ============================================
-- Armazena clientes específicos de cada agenciador
CREATE TABLE IF NOT EXISTS clientes_agenciador (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agenciador_id INT NOT NULL,
  cliente_id INT,
  nome_cliente VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cnpj_cpf VARCHAR(18),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  prioridade ENUM('alta', 'media', 'baixa') DEFAULT 'media',
  total_vendas DECIMAL(12, 2) DEFAULT 0,
  total_recebido DECIMAL(12, 2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (agenciador_id) REFERENCES agenciadores(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_clientes_agenciador_id (agenciador_id),
  INDEX idx_clientes_cliente_id (cliente_id),
  INDEX idx_clientes_prioridade (prioridade),
  INDEX idx_clientes_agenciador_prioridade (agenciador_id, prioridade)
);

-- ============================================
-- 7. TABELA: IMPORTACOES_PLANILHA
-- ============================================
-- Armazena histórico de importações de planilhas
CREATE TABLE IF NOT EXISTS importacoes_planilha (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agenciador_id INT NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  nome_aba VARCHAR(100),
  total_linhas INT,
  linhas_importadas INT,
  linhas_erro INT,
  status ENUM('pendente', 'processando', 'concluida', 'erro') DEFAULT 'pendente',
  mensagem_erro TEXT,
  data_importacao TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (agenciador_id) REFERENCES agenciadores(id) ON DELETE CASCADE,
  INDEX idx_importacoes_agenciador_id (agenciador_id),
  INDEX idx_importacoes_status (status),
  INDEX idx_importacoes_data_cadastro (data_cadastro)
);

-- ============================================
-- 8. TABELA: RELATORIOS_VENDAS
-- ============================================
-- Armazena relatórios gerados para análise
CREATE TABLE IF NOT EXISTS relatorios_vendas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agenciador_id INT NOT NULL,
  tipo_relatorio ENUM('mensal', 'trimestral', 'anual', 'customizado') DEFAULT 'mensal',
  periodo_mes INT,
  periodo_ano INT,
  total_vendas INT,
  valor_total_vendas DECIMAL(12, 2),
  valor_total_recebido DECIMAL(12, 2),
  valor_pendente DECIMAL(12, 2),
  total_comissoes DECIMAL(12, 2),
  comissoes_pagas DECIMAL(12, 2),
  comissoes_pendentes DECIMAL(12, 2),
  ticket_medio DECIMAL(12, 2),
  cliente_principal VARCHAR(255),
  data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE,
  
  FOREIGN KEY (agenciador_id) REFERENCES agenciadores(id) ON DELETE CASCADE,
  INDEX idx_relatorios_agenciador_id (agenciador_id),
  INDEX idx_relatorios_tipo (tipo_relatorio),
  INDEX idx_relatorios_periodo (periodo_ano, periodo_mes),
  INDEX idx_relatorios_data_geracao (data_geracao)
);

-- ============================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================

-- Índices compostos para queries comuns
CREATE INDEX idx_vendas_agenciador_data_status 
ON vendas_agenciador(agenciador_id, data_venda, status);

CREATE INDEX idx_parcelas_venda_status_vencimento 
ON parcelas_venda(venda_id, status, data_vencimento);

CREATE INDEX idx_comissoes_agenciador_status_periodo 
ON comissoes_agenciador(agenciador_id, status, periodo_ano, periodo_mes);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Resumo de Vendas por Agenciador
CREATE OR REPLACE VIEW vw_vendas_por_agenciador AS
SELECT 
  a.id as agenciador_id,
  a.nome as agenciador_nome,
  COUNT(DISTINCT v.id) as total_vendas,
  SUM(v.valor_total) as valor_total_vendas,
  SUM(v.comissao_valor) as total_comissoes,
  COUNT(DISTINCT CASE WHEN v.status = 'pendente' THEN v.id END) as vendas_pendentes,
  COUNT(DISTINCT CASE WHEN v.status = 'confirmada' THEN v.id END) as vendas_confirmadas,
  YEAR(v.data_venda) as ano,
  MONTH(v.data_venda) as mes
FROM agenciadores a
LEFT JOIN vendas_agenciador v ON a.id = v.agenciador_id AND v.ativo = TRUE
WHERE a.ativo = TRUE
GROUP BY a.id, a.nome, YEAR(v.data_venda), MONTH(v.data_venda);

-- View: Parcelas Pendentes
CREATE OR REPLACE VIEW vw_parcelas_pendentes AS
SELECT 
  p.id as parcela_id,
  v.numero_processo,
  v.agenciador_id,
  a.nome as agenciador_nome,
  c.nome_cliente,
  p.numero_parcela,
  p.valor,
  p.data_vencimento,
  p.forma_pagamento,
  DATEDIFF(CURDATE(), p.data_vencimento) as dias_atraso,
  CASE 
    WHEN DATEDIFF(CURDATE(), p.data_vencimento) > 0 THEN 'atrasada'
    ELSE 'pendente'
  END as status_real
FROM parcelas_venda p
INNER JOIN vendas_agenciador v ON p.venda_id = v.id
INNER JOIN agenciadores a ON v.agenciador_id = a.id
LEFT JOIN clientes_agenciador c ON v.agenciador_id = c.agenciador_id AND v.cliente_nome = c.nome_cliente
WHERE p.status = 'pendente' AND p.ativo = TRUE
ORDER BY p.data_vencimento ASC;

-- View: Comissões a Receber
CREATE OR REPLACE VIEW vw_comissoes_a_receber AS
SELECT 
  a.id as agenciador_id,
  a.nome as agenciador_nome,
  YEAR(DATE_ADD(CURDATE(), INTERVAL -1 MONTH)) as periodo_ano,
  MONTH(DATE_ADD(CURDATE(), INTERVAL -1 MONTH)) as periodo_mes,
  SUM(c.valor_comissao) as total_comissoes,
  COUNT(DISTINCT c.venda_id) as total_vendas,
  COUNT(DISTINCT CASE WHEN c.status = 'pendente' THEN c.id END) as comissoes_pendentes,
  COUNT(DISTINCT CASE WHEN c.status = 'paga' THEN c.id END) as comissoes_pagas
FROM agenciadores a
LEFT JOIN comissoes_agenciador c ON a.id = c.agenciador_id AND c.ativo = TRUE
WHERE a.ativo = TRUE
GROUP BY a.id, a.nome, periodo_ano, periodo_mes;

-- View: Desempenho de Clientes
CREATE OR REPLACE VIEW vw_desempenho_clientes AS
SELECT 
  ca.agenciador_id,
  ca.id as cliente_id,
  ca.nome_cliente,
  ca.prioridade,
  COUNT(DISTINCT v.id) as total_vendas,
  SUM(v.valor_total) as valor_total,
  AVG(v.valor_total) as ticket_medio,
  MAX(v.data_venda) as ultima_venda,
  COUNT(DISTINCT CASE WHEN p.status = 'pendente' THEN p.id END) as parcelas_pendentes,
  SUM(CASE WHEN p.status = 'pendente' THEN p.valor ELSE 0 END) as valor_pendente
FROM clientes_agenciador ca
LEFT JOIN vendas_agenciador v ON ca.agenciador_id = v.agenciador_id AND ca.nome_cliente = v.cliente_nome AND v.ativo = TRUE
LEFT JOIN parcelas_venda p ON v.id = p.venda_id AND p.ativo = TRUE
WHERE ca.ativo = TRUE
GROUP BY ca.agenciador_id, ca.id, ca.nome_cliente, ca.prioridade
ORDER BY ca.agenciador_id, valor_total DESC;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
