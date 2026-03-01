# 📘 Guia Completo do Sistema de Agenciadores

## Índice
1. [Visão Geral](#visão-geral)
2. [Fluxo Completo do Agenciador](#fluxo-completo-do-agenciador)
3. [Passo a Passo: Criação de Conta](#passo-a-passo-criação-de-conta)
4. [Passo a Passo: Registrar Vendas](#passo-a-passo-registrar-vendas)
5. [Passo a Passo: Gerenciar Parcelas](#passo-a-passo-gerenciar-parcelas)
6. [Passo a Passo: Acompanhar Comissões](#passo-a-passo-acompanhar-comissões)
7. [Passo a Passo: Receber Comissões](#passo-a-passo-receber-comissões)
8. [Endpoints da API](#endpoints-da-api)
9. [Exemplos de Requisições](#exemplos-de-requisições)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O sistema de agenciadores permite que vendedores e intermediários controlem suas vendas, acompanhem parcelas de pagamento e recebam comissões automáticas.

### Benefícios para Agenciadores

- ✅ **Controle Total de Vendas**: Registre todas as vendas, mesmo as fora do aplicativo
- ✅ **Acompanhamento de Parcelas**: Visualize status de pagamento de cada parcela
- ✅ **Cálculo Automático de Comissões**: Comissões calculadas automaticamente
- ✅ **Relatórios Detalhados**: Análise mensal e anual de desempenho
- ✅ **Gerenciamento de Clientes**: Organize clientes por prioridade
- ✅ **Rastreamento de Recebimentos**: Acompanhe quando recebe as comissões

---

## Fluxo Completo do Agenciador

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DO AGENCIADOR                          │
└─────────────────────────────────────────────────────────────────┘

1. CRIAÇÃO DE CONTA
   ├─ Registrar como Usuário
   ├─ Criar Conta (Empresa/Pessoa)
   └─ Ativar como Agenciador

2. CONFIGURAÇÃO INICIAL
   ├─ Definir Comissão Padrão
   ├─ Adicionar Clientes
   └─ Configurar Preferências

3. REGISTRAR VENDAS
   ├─ Criar Nova Venda
   ├─ Adicionar Múltiplas Parcelas
   ├─ Definir Formas de Pagamento
   └─ Confirmar Venda

4. GERENCIAR PARCELAS
   ├─ Visualizar Parcelas Pendentes
   ├─ Atualizar Status de Pagamento
   ├─ Registrar Boletos
   └─ Acompanhar Atrasos

5. ACOMPANHAR COMISSÕES
   ├─ Visualizar Comissões Geradas
   ├─ Ver Comissões Pagas/Pendentes
   ├─ Consultar Relatórios
   └─ Analisar Desempenho

6. RECEBER COMISSÕES
   ├─ Solicitar Recebimento
   ├─ Confirmar Pagamento
   ├─ Registrar Comprovante
   └─ Visualizar Histórico
```

---

## Passo a Passo: Criação de Conta

### 1️⃣ Registrar como Usuário

**Endpoint**: `POST /api/auth/registro-usuario`

```bash
curl -X POST http://localhost:3001/api/auth/registro-usuario \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11999999999",
    "senha": "Senha@123",
    "tipo_usuario": "agenciador"
  }'
```

**Resposta de Sucesso** (201):
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "tipo_usuario": "agenciador",
    "ativo": true,
    "data_cadastro": "2024-03-01T10:00:00Z"
  }
}
```

### 2️⃣ Criar Conta (Empresa/Pessoa)

**Endpoint**: `POST /api/auth/registro-conta`

```bash
curl -X POST http://localhost:3001/api/auth/registro-conta \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "nome_empresa": "João Silva Vendas",
    "cnpj_cpf": "12345678901234",
    "tipo_pessoa": "pj",
    "telefone": "11999999999",
    "email": "empresa@example.com",
    "endereco": "Rua das Flores, 123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234567"
  }'
```

**Resposta de Sucesso** (201):
```json
{
  "success": true,
  "message": "Conta criada com sucesso",
  "data": {
    "id": 1,
    "usuario_id": 1,
    "nome_empresa": "João Silva Vendas",
    "cnpj_cpf": "12345678901234",
    "tipo_pessoa": "pj",
    "ativo": true,
    "data_cadastro": "2024-03-01T10:05:00Z"
  }
}
```

### 3️⃣ Ativar como Agenciador

**Endpoint**: `POST /api/agenciadores` (Criar Agenciador)

```bash
curl -X POST http://localhost:3001/api/agenciadores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "usuario_id": 1,
    "comissao_percentual": 5.00
  }'
```

**Resposta de Sucesso** (201):
```json
{
  "success": true,
  "message": "Agenciador criado com sucesso",
  "data": {
    "id": 1,
    "usuario_id": 1,
    "comissao_percentual": 5.00,
    "total_vendas_intermediadas": 0,
    "total_comissao": 0.00,
    "ativo": true,
    "data_cadastro": "2024-03-01T10:10:00Z"
  }
}
```

---

## Passo a Passo: Registrar Vendas

### 1️⃣ Acessar Dashboard

Após fazer login, o agenciador acessa: `/agenciador-dashboard`

### 2️⃣ Criar Nova Venda

**Clique em**: "+ Nova Venda"

**Preencha os dados**:
- Número do Processo: `PROC-001`
- Cliente: `Cliente XYZ`
- Data da Venda: `01/03/2024`
- Quantidade de Chapas: `5`
- Valor Total: `R$ 5.000,00`
- Comissão (%): `5%` (padrão)
- Descrição: `Venda de granito cinza`

### 3️⃣ Adicionar Parcelas

**Para cada parcela, preencha**:
- Número da Parcela: `1` (auto-incremento)
- Valor: `R$ 1.000,00`
- Data de Vencimento: `01/04/2024`
- Forma de Pagamento: `Boleto`
- Número do Boleto: `123456789` (opcional)

**Clique em**: "+ Adicionar Parcela"

**Repita para as 5 parcelas**

### 4️⃣ Confirmar Venda

**Clique em**: "Salvar Venda"

**Resultado**:
- Venda registrada no sistema
- Comissão calculada automaticamente (5% de R$ 5.000 = R$ 250)
- Parcelas criadas com status "pendente"
- Agenciador recebe confirmação

---

## Passo a Passo: Gerenciar Parcelas

### 1️⃣ Visualizar Parcelas

**Acesse**: Dashboard → Aba "Parcelas"

**Visualiza**:
- Número do processo
- Número da parcela
- Valor
- Data de vencimento
- Status (pendente, paga, atrasada)
- Forma de pagamento

### 2️⃣ Atualizar Status de Pagamento

**Endpoint**: `PUT /api/parcelas-agenciador/:id`

```bash
curl -X PUT http://localhost:3001/api/parcelas-agenciador/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "status": "paga",
    "data_pagamento": "2024-04-01",
    "numero_boleto": "123456789"
  }'
```

### 3️⃣ Acompanhar Atrasos

**Parcelas com vencimento passado** aparecem como "atrasada"

**Sistema calcula**:
- Dias de atraso
- Valor em atraso
- Alertas automáticos

---

## Passo a Passo: Acompanhar Comissões

### 1️⃣ Visualizar Comissões Geradas

**Endpoint**: `GET /api/comissoes-agenciador?agenciador_id=1`

```bash
curl -X GET "http://localhost:3001/api/comissoes-agenciador?agenciador_id=1" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agenciador_id": 1,
      "venda_id": 1,
      "valor_venda": 5000.00,
      "percentual_comissao": 5.00,
      "valor_comissao": 250.00,
      "periodo_mes": 3,
      "periodo_ano": 2024,
      "status": "pendente",
      "data_cadastro": "2024-03-01T10:15:00Z"
    }
  ]
}
```

### 2️⃣ Ver Comissões por Período

**Endpoint**: `GET /api/comissoes-agenciador/agenciador/1/periodo?periodo_mes=3&periodo_ano=2024`

```bash
curl -X GET "http://localhost:3001/api/comissoes-agenciador/agenciador/1/periodo?periodo_mes=3&periodo_ano=2024" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "valor_comissao": 250.00,
      "status": "pendente"
    },
    {
      "id": 2,
      "valor_comissao": 180.00,
      "status": "pendente"
    }
  ],
  "resumo": {
    "total_comissoes": 2,
    "valor_total": 430.00,
    "pagas": 0,
    "pendentes": 2,
    "valor_pago": 0.00,
    "valor_pendente": 430.00
  }
}
```

### 3️⃣ Consultar Relatório de Desempenho

**Endpoint**: `GET /api/relatorios-agenciador/agenciador/1/desempenho`

```bash
curl -X GET "http://localhost:3001/api/relatorios-agenciador/agenciador/1/desempenho" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "agenciador": {
      "id": 1,
      "comissao_percentual": 5.00,
      "total_vendas_intermediadas": 5,
      "total_comissao": 430.00
    },
    "vendas": {
      "total_vendas": 5,
      "valor_total_vendas": 8600.00,
      "total_comissoes_geradas": 430.00,
      "total_clientes_unicos": 3,
      "ticket_medio": 1720.00,
      "vendas_confirmadas": 5,
      "vendas_pendentes": 0,
      "taxa_confirmacao": "100.00%"
    },
    "parcelas": {
      "total_parcelas": 15,
      "valor_total_parcelas": 8600.00,
      "pagas": 8,
      "pendentes": 7,
      "valor_pago": 4500.00,
      "valor_pendente": 4100.00,
      "taxa_recebimento": "53.49%"
    },
    "recebimentos": {
      "total_recebimentos": 1,
      "valor_total_recebido": 430.00,
      "recebimentos_pagos": 1,
      "recebimentos_pendentes": 0
    }
  }
}
```

---

## Passo a Passo: Receber Comissões

### 1️⃣ Visualizar Comissões a Receber

**Endpoint**: `GET /api/relatorios-agenciador/agenciador/1/pendencias`

```bash
curl -X GET "http://localhost:3001/api/relatorios-agenciador/agenciador/1/pendencias" \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "comissoes_nao_pagas": {
      "total": 2,
      "valor_total": 430.00,
      "detalhes": [
        {
          "id": 1,
          "venda_id": 1,
          "valor_venda": 5000.00,
          "valor_comissao": 250.00,
          "periodo_mes": 3,
          "periodo_ano": 2024,
          "status": "pendente"
        }
      ]
    }
  }
}
```

### 2️⃣ Criar Recebimento

**Endpoint**: `POST /api/comissoes-agenciador/recebimentos`

```bash
curl -X POST http://localhost:3001/api/comissoes-agenciador/recebimentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "agenciador_id": 1,
    "periodo_mes": 3,
    "periodo_ano": 2024,
    "valor_total_comissoes": 430.00,
    "valor_recebido": 430.00,
    "forma_pagamento": "transferencia",
    "data_recebimento": "2024-04-05",
    "numero_comprovante": "TRF-12345678",
    "observacao": "Transferência bancária realizada"
  }'
```

**Resposta de Sucesso** (201):
```json
{
  "success": true,
  "message": "Recebimento criado com sucesso",
  "data": {
    "id": 1,
    "agenciador_id": 1,
    "periodo_mes": 3,
    "periodo_ano": 2024,
    "valor_total_comissoes": 430.00,
    "valor_recebido": 430.00,
    "status": "pago",
    "data_recebimento": "2024-04-05"
  }
}
```

### 3️⃣ Atualizar Status de Comissão

**Endpoint**: `PUT /api/comissoes-agenciador/:id`

```bash
curl -X PUT http://localhost:3001/api/comissoes-agenciador/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "status": "paga",
    "data_pagamento": "2024-04-05"
  }'
```

### 4️⃣ Visualizar Histórico de Recebimentos

**Endpoint**: `GET /api/comissoes-agenciador/recebimentos?agenciador_id=1`

```bash
curl -X GET "http://localhost:3001/api/comissoes-agenciador/recebimentos?agenciador_id=1" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## Endpoints da API

### Vendas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vendas-agenciador` | Listar vendas |
| GET | `/api/vendas-agenciador/:id` | Obter venda |
| POST | `/api/vendas-agenciador` | Criar venda |
| PUT | `/api/vendas-agenciador/:id` | Atualizar venda |
| DELETE | `/api/vendas-agenciador/:id` | Deletar venda |
| GET | `/api/vendas-agenciador/agenciador/:id/resumo` | Resumo de vendas |

### Parcelas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/parcelas-agenciador` | Listar parcelas |
| GET | `/api/parcelas-agenciador/:id` | Obter parcela |
| POST | `/api/parcelas-agenciador` | Criar parcela |
| PUT | `/api/parcelas-agenciador/:id` | Atualizar parcela |
| DELETE | `/api/parcelas-agenciador/:id` | Deletar parcela |
| GET | `/api/parcelas-agenciador/venda/:id/resumo` | Resumo de parcelas |

### Comissões

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/comissoes-agenciador` | Listar comissões |
| GET | `/api/comissoes-agenciador/:id` | Obter comissão |
| POST | `/api/comissoes-agenciador` | Criar comissão |
| PUT | `/api/comissoes-agenciador/:id` | Atualizar comissão |
| DELETE | `/api/comissoes-agenciador/:id` | Deletar comissão |
| GET | `/api/comissoes-agenciador/agenciador/:id/periodo` | Comissões por período |
| GET | `/api/comissoes-agenciador/recebimentos` | Listar recebimentos |
| POST | `/api/comissoes-agenciador/recebimentos` | Criar recebimento |

### Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clientes-agenciador` | Listar clientes |
| GET | `/api/clientes-agenciador/:id` | Obter cliente |
| POST | `/api/clientes-agenciador` | Criar cliente |
| PUT | `/api/clientes-agenciador/:id` | Atualizar cliente |
| DELETE | `/api/clientes-agenciador/:id` | Deletar cliente |
| GET | `/api/clientes-agenciador/agenciador/:id/top` | Top 10 clientes |

### Relatórios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/relatorios-agenciador/agenciador/:id/mensal` | Relatório mensal |
| GET | `/api/relatorios-agenciador/agenciador/:id/anual` | Relatório anual |
| GET | `/api/relatorios-agenciador/agenciador/:id/desempenho` | Desempenho |
| GET | `/api/relatorios-agenciador/agenciador/:id/pendencias` | Pendências |

---

## Exemplos de Requisições

### Exemplo 1: Fluxo Completo de Uma Venda

```bash
# 1. Criar venda
curl -X POST http://localhost:3001/api/vendas-agenciador \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "agenciador_id": 1,
    "numero_processo": "PROC-001",
    "cliente_nome": "Cliente XYZ",
    "valor_total": 5000,
    "comissao_percentual": 5,
    "data_venda": "2024-03-01"
  }'

# 2. Criar primeira parcela
curl -X POST http://localhost:3001/api/parcelas-agenciador \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "venda_id": 1,
    "numero_parcela": 1,
    "valor": 1000,
    "data_vencimento": "2024-04-01",
    "forma_pagamento": "boleto"
  }'

# 3. Atualizar parcela como paga
curl -X PUT http://localhost:3001/api/parcelas-agenciador/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "status": "paga",
    "data_pagamento": "2024-04-01"
  }'

# 4. Visualizar comissão gerada
curl -X GET "http://localhost:3001/api/comissoes-agenciador?agenciador_id=1" \
  -H "Authorization: Bearer TOKEN"

# 5. Criar recebimento de comissão
curl -X POST http://localhost:3001/api/comissoes-agenciador/recebimentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "agenciador_id": 1,
    "periodo_mes": 3,
    "periodo_ano": 2024,
    "valor_total_comissoes": 250,
    "valor_recebido": 250,
    "forma_pagamento": "transferencia",
    "data_recebimento": "2024-04-05"
  }'
```

### Exemplo 2: Relatório Mensal

```bash
curl -X GET "http://localhost:3001/api/relatorios-agenciador/agenciador/1/mensal?mes=3&ano=2024" \
  -H "Authorization: Bearer TOKEN"
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "periodo": {
      "mes": 3,
      "ano": 2024
    },
    "vendas": {
      "total_vendas": 5,
      "valor_total_vendas": 8600.00,
      "total_comissoes": 430.00,
      "vendas_confirmadas": 5,
      "vendas_pendentes": 0,
      "ticket_medio": 1720.00
    },
    "parcelas": {
      "total_parcelas": 15,
      "pagas": 8,
      "pendentes": 7,
      "valor_pago": 4500.00,
      "valor_pendente": 4100.00
    },
    "top_clientes": [
      {
        "cliente_nome": "Cliente A",
        "numero_vendas": 2,
        "valor_total": 3500.00,
        "ticket_medio": 1750.00
      }
    ]
  }
}
```

---

## Troubleshooting

### ❌ Erro: "Agenciador não encontrado"

**Causa**: Usuário não foi ativado como agenciador

**Solução**:
1. Criar conta de usuário
2. Criar conta (empresa/pessoa)
3. Ativar como agenciador via API

### ❌ Erro: "Venda não encontrada"

**Causa**: ID da venda inválido ou venda deletada

**Solução**:
1. Verificar ID da venda
2. Listar vendas para confirmar existência
3. Usar soft delete (não apaga dados)

### ❌ Erro: "Parcela já existe"

**Causa**: Tentando criar parcela duplicada

**Solução**:
1. Verificar número da parcela
2. Usar número diferente
3. Atualizar parcela existente em vez de criar

### ❌ Erro: "Valor total de parcelas diferente do valor da venda"

**Causa**: Soma de parcelas não bate com valor total

**Solução**:
1. Verificar valores das parcelas
2. Ajustar última parcela
3. Confirmar soma total

### ❌ Erro: "Comissão não calculada"

**Causa**: Venda sem comissão_percentual

**Solução**:
1. Definir comissão_percentual na venda
2. Sistema calcula automaticamente
3. Verificar se comissão está entre 0-100%

### ✅ Dicas de Sucesso

1. **Sempre validar dados** antes de enviar
2. **Usar filtros** para encontrar dados
3. **Acompanhar status** de parcelas regularmente
4. **Gerar relatórios** mensalmente
5. **Registrar recebimentos** conforme recebe
6. **Manter clientes atualizados** na plataforma

---

## Suporte

Para dúvidas ou problemas:

1. Consulte esta documentação
2. Verifique os logs do servidor
3. Teste endpoints com Postman/Insomnia
4. Contate o suporte técnico

**Versão**: 1.0.0  
**Data**: Março 2024  
**Autor**: Manus AI
