# 📊 Documentação - Sistema de Controle de Vendas para Agenciadores

## Visão Geral

Este documento descreve o schema de banco de dados para gerenciar vendas, comissões e recebimentos de agenciadores/vendedores no sistema marmo_hub.

---

## 📋 Tabelas do Sistema

### 1. **agenciadores**

Armazena informações dos agenciadores/vendedores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único (PK) |
| conta_id | INT | Referência à conta (FK) |
| nome | VARCHAR(255) | Nome do agenciador |
| email | VARCHAR(255) | Email único |
| telefone | VARCHAR(20) | Telefone de contato |
| cpf | VARCHAR(14) | CPF (único) |
| cnpj | VARCHAR(18) | CNPJ (único) |
| percentual_comissao | DECIMAL(5,2) | % de comissão (padrão: 2%) |
| ativo | BOOLEAN | Status ativo/inativo |
| data_cadastro | TIMESTAMP | Data de criação |
| data_atualizacao | TIMESTAMP | Data de última atualização |

**Índices:**
- `idx_agenciadores_conta_id` - Busca por conta
- `idx_agenciadores_ativo` - Filtro por status
- `idx_agenciadores_email` - Busca por email

---

### 2. **vendas_agenciador**

Armazena as vendas realizadas pelos agenciadores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único (PK) |
| agenciador_id | INT | Referência ao agenciador (FK) |
| numero_processo | VARCHAR(50) | ID único da venda |
| cliente_nome | VARCHAR(255) | Nome do cliente |
| cliente_id | INT | Referência ao cliente (FK) |
| quantidade_chapas | INT | Quantidade de chapas |
| valor_total | DECIMAL(12,2) | Valor total da venda |
| comissao_percentual | DECIMAL(5,2) | % de comissão |
| comissao_valor | DECIMAL(12,2) | Valor da comissão |
| comissao_paga | BOOLEAN | Se comissão foi paga |
| data_venda | DATE | Data da venda |
| descricao | TEXT | Descrição/observações |
| status | ENUM | pendente/confirmada/cancelada |
| ativo | BOOLEAN | Status ativo/inativo |
| data_cadastro | TIMESTAMP | Data de criação |
| data_atualizacao | TIMESTAMP | Data de última atualização |

**Índices:**
- `idx_vendas_agenciador_id` - Busca por agenciador
- `idx_vendas_numero_processo` - Busca por processo
- `idx_vendas_data_venda` - Filtro por data
- `idx_vendas_status` - Filtro por status
- `idx_vendas_comissao_paga` - Filtro por comissão paga
- `idx_vendas_agenciador_data` - Busca combinada

---

### 3. **parcelas_venda**

Armazena as parcelas de cada venda.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único (PK) |
| venda_id | INT | Referência à venda (FK) |
| numero_parcela | INT | Número sequencial da parcela |
| valor | DECIMAL(12,2) | Valor da parcela |
| data_vencimento | DATE | Data de vencimento |
| forma_pagamento | ENUM | boleto/cheque/dinheiro/transferencia/outro |
| numero_boleto | VARCHAR(50) | Número do boleto |
| status | ENUM | pendente/paga/atrasada/cancelada |
| data_pagamento | DATE | Data do pagamento |
| observacao | TEXT | Observações |
| confirmacao_boleto | TEXT | Confirmação de envio |
| data_confirmacao | TIMESTAMP | Data da confirmação |
| ativo | BOOLEAN | Status ativo/inativo |
| data_cadastro | TIMESTAMP | Data de criação |
| data_atualizacao | TIMESTAMP | Data de última atualização |

**Índices:**
- `idx_parcelas_venda_id` - Busca por venda
- `idx_parcelas_status` - Filtro por status
- `idx_parcelas_data_vencimento` - Filtro por vencimento
- `idx_parcelas_forma_pagamento` - Filtro por forma
- `idx_parcelas_venda_status` - Busca combinada

---

### 4. **comissoes_agenciador**

Armazena o histórico de comissões dos agenciadores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único (PK) |
| agenciador_id | INT | Referência ao agenciador (FK) |
| venda_id | INT | Referência à venda (FK) |
| valor_venda | DECIMAL(12,2) | Valor da venda |
| percentual_comissao | DECIMAL(5,2) | % de comissão |
| valor_comissao | DECIMAL(12,2) | Valor da comissão |
| periodo_mes | INT | Mês (1-12) |
| periodo_ano | INT | Ano |
| status | ENUM | pendente/paga/cancelada |
| data_pagamento | DATE | Data do pagamento |
| observacao | TEXT | Observações |
| ativo | BOOLEAN | Status ativo/inativo |
| data_cadastro | TIMESTAMP | Data de criação |
| data_atualizacao | TIMESTAMP | Data de última atualização |

**Índices:**
- `idx_comissoes_agenciador_id` - Busca por agenciador
- `idx_comissoes_venda_id` - Busca por venda
- `idx_comissoes_status` - Filtro por status
- `idx_comissoes_periodo` - Filtro por período
- `idx_comissoes_agenciador_periodo` - Busca combinada

---

### 5. **recebimentos_agenciador**

Armazena os recebimentos de comissões dos agenciadores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único (PK) |
| agenciador_id | INT | Referência ao agenciador (FK) |
| periodo_mes | INT | Mês (1-12) |
| periodo_ano | INT | Ano |
| valor_total_comissoes | DECIMAL(12,2) | Total de comissões |
| valor_recebido | DECIMAL(12,2) | Valor efetivamente recebido |
| forma_pagamento | ENUM | transferencia/cheque/dinheiro/outro |
| data_recebimento | DATE | Data do recebimento |
| numero_comprovante | VARCHAR(100) | Número do comprovante |
| observacao | TEXT | Observações |
| status | ENUM | pendente/pago/cancelado |
| ativo | BOOLEAN | Status ativo/inativo |
| data_cadastro | TIMESTAMP | Data de criação |
| data_atualizacao | TIMESTAMP | Data de última atualização |

**Índices:**
- `idx_recebimentos_agenciador_id` - Busca por agenciador
- `idx_recebimentos_status` - Filtro por status
- `idx_recebimentos_periodo` - Filtro por período
- `idx_recebimentos_data_recebimento` - Filtro por data

---

### 6. **clientes_agenciador**

Armazena clientes específicos de cada agenciador.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único (PK) |
| agenciador_id | INT | Referência ao agenciador (FK) |
| cliente_id | INT | Referência ao cliente (FK) |
| nome_cliente | VARCHAR(255) | Nome do cliente |
| email | VARCHAR(255) | Email do cliente |
| telefone | VARCHAR(20) | Telefone |
| cnpj_cpf | VARCHAR(18) | CNPJ ou CPF |
| endereco | TEXT | Endereço |
| cidade | VARCHAR(100) | Cidade |
| estado | VARCHAR(2) | Estado (UF) |
| cep | VARCHAR(10) | CEP |
| prioridade | ENUM | alta/media/baixa |
| total_vendas | DECIMAL(12,2) | Total de vendas |
| total_recebido | DECIMAL(12,2) | Total recebido |
| ativo | BOOLEAN | Status ativo/inativo |
| data_cadastro | TIMESTAMP | Data de criação |
| data_atualizacao | TIMESTAMP | Data de última atualização |

**Índices:**
- `idx_clientes_agenciador_id` - Busca por agenciador
- `idx_clientes_cliente_id` - Busca por cliente
- `idx_clientes_prioridade` - Filtro por prioridade
- `idx_clientes_agenciador_prioridade` - Busca combinada

---

### 7. **importacoes_planilha**

Armazena histórico de importações de planilhas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único (PK) |
| agenciador_id | INT | Referência ao agenciador (FK) |
| nome_arquivo | VARCHAR(255) | Nome do arquivo |
| nome_aba | VARCHAR(100) | Nome da aba importada |
| total_linhas | INT | Total de linhas |
| linhas_importadas | INT | Linhas importadas com sucesso |
| linhas_erro | INT | Linhas com erro |
| status | ENUM | pendente/processando/concluida/erro |
| mensagem_erro | TEXT | Mensagem de erro (se houver) |
| data_importacao | TIMESTAMP | Data da importação |
| ativo | BOOLEAN | Status ativo/inativo |
| data_cadastro | TIMESTAMP | Data de criação |

**Índices:**
- `idx_importacoes_agenciador_id` - Busca por agenciador
- `idx_importacoes_status` - Filtro por status
- `idx_importacoes_data_cadastro` - Filtro por data

---

### 8. **relatorios_vendas**

Armazena relatórios gerados para análise.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único (PK) |
| agenciador_id | INT | Referência ao agenciador (FK) |
| tipo_relatorio | ENUM | mensal/trimestral/anual/customizado |
| periodo_mes | INT | Mês (se aplicável) |
| periodo_ano | INT | Ano |
| total_vendas | INT | Quantidade de vendas |
| valor_total_vendas | DECIMAL(12,2) | Valor total de vendas |
| valor_total_recebido | DECIMAL(12,2) | Valor recebido |
| valor_pendente | DECIMAL(12,2) | Valor pendente |
| total_comissoes | DECIMAL(12,2) | Total de comissões |
| comissoes_pagas | DECIMAL(12,2) | Comissões pagas |
| comissoes_pendentes | DECIMAL(12,2) | Comissões pendentes |
| ticket_medio | DECIMAL(12,2) | Valor médio por venda |
| cliente_principal | VARCHAR(255) | Cliente com maior venda |
| data_geracao | TIMESTAMP | Data de geração |
| ativo | BOOLEAN | Status ativo/inativo |

**Índices:**
- `idx_relatorios_agenciador_id` - Busca por agenciador
- `idx_relatorios_tipo` - Filtro por tipo
- `idx_relatorios_periodo` - Filtro por período
- `idx_relatorios_data_geracao` - Filtro por data

---

## 📊 Views Disponíveis

### 1. **vw_vendas_por_agenciador**

Resumo de vendas por agenciador, mês e ano.

```sql
SELECT * FROM vw_vendas_por_agenciador 
WHERE agenciador_id = 1 AND ano = 2025;
```

### 2. **vw_parcelas_pendentes**

Todas as parcelas pendentes com informações de atraso.

```sql
SELECT * FROM vw_parcelas_pendentes 
WHERE dias_atraso > 0;
```

### 3. **vw_comissoes_a_receber**

Comissões a receber por agenciador e período.

```sql
SELECT * FROM vw_comissoes_a_receber 
WHERE agenciador_id = 1;
```

### 4. **vw_desempenho_clientes**

Desempenho de cada cliente de um agenciador.

```sql
SELECT * FROM vw_desempenho_clientes 
WHERE agenciador_id = 1 
ORDER BY valor_total DESC;
```

---

## 🔄 Fluxo de Dados

### Processo de Venda

1. **Criar Venda** → Inserir em `vendas_agenciador`
2. **Adicionar Parcelas** → Inserir em `parcelas_venda`
3. **Registrar Pagamento** → Atualizar status em `parcelas_venda`
4. **Calcular Comissão** → Inserir em `comissoes_agenciador`
5. **Registrar Recebimento** → Inserir em `recebimentos_agenciador`

### Cálculo de Comissão

```
Comissão = Valor da Venda × Percentual de Comissão / 100

Exemplo:
Venda: R$ 2.590,80
Comissão: 2%
Comissão = 2.590,80 × 2 / 100 = R$ 51,82
```

---

## 📈 Relatórios Principais

### 1. Resumo de Vendas Mensais

Mostra total de vendas, recebimentos e comissões por mês.

### 2. Parcelas Pendentes

Lista todas as parcelas não pagas com dias de atraso.

### 3. Comissões a Receber

Mostra comissões pendentes por período.

### 4. Desempenho de Clientes

Ranking de clientes por valor de vendas.

### 5. Recebimentos

Histórico de recebimentos de comissões.

---

## 🔐 Segurança e Integridade

### Constraints

- **Foreign Keys**: Todas as referências são validadas
- **Unique Keys**: Email, CPF, CNPJ, Número de Processo
- **Check Constraints**: Percentuais entre 0-100, valores positivos
- **Cascading Deletes**: Ao deletar agenciador, todas as vendas são deletadas

### Auditoria

- **data_cadastro**: Registra quando foi criado
- **data_atualizacao**: Registra última modificação
- **ativo**: Permite soft delete

---

## 📊 Índices para Performance

### Índices Simples

- Busca por agenciador
- Busca por status
- Busca por período
- Busca por data

### Índices Compostos

- `(agenciador_id, data_venda, status)`
- `(venda_id, status, data_vencimento)`
- `(agenciador_id, status, periodo_ano, periodo_mes)`

---

## 🚀 Como Usar

### Instalação

```bash
# 1. Executar script de schema
mysql -u root -p olx_pedra < vendas_agenciadores_schema.sql

# 2. Verificar tabelas criadas
SHOW TABLES;

# 3. Verificar views criadas
SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';
```

### Exemplos de Uso

```bash
# Ver queries de exemplo
cat vendas_agenciadores_queries.sql
```

---

## 📝 Notas Importantes

1. **Comissão Automática**: Deve ser calculada ao registrar pagamento
2. **Parcelas Atrasadas**: Status muda automaticamente se vencimento passou
3. **Soft Delete**: Use `ativo = FALSE` em vez de deletar registros
4. **Auditoria**: Sempre registre quem fez alterações (adicionar user_id)

---

## 🔄 Próximos Passos

1. Criar APIs para CRUD de vendas
2. Criar dashboard de visualização
3. Implementar importação de Excel
4. Criar sistema de notificações
5. Gerar relatórios em PDF

---

**Data**: 01/03/2026  
**Versão**: 1.0.0  
**Status**: Pronto para Implementação
