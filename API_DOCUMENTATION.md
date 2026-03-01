# 📚 Documentação da API - Agenciadores

## Informações Gerais

**Base URL**: `http://localhost:3001/api`  
**Versão**: 1.0.0  
**Autenticação**: Bearer Token (JWT)  
**Content-Type**: `application/json`

---

## Autenticação

Todos os endpoints requerem um token JWT válido no header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

**Obter Token**:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agenciador@example.com",
    "senha": "senha123"
  }'
```

---

## 1️⃣ VENDAS

### Listar Vendas

```http
GET /vendas-agenciador?agenciador_id=1&status=pendente&page=1&limit=20
```

**Parâmetros Query**:
- `agenciador_id` (int): ID do agenciador
- `status` (string): `pendente`, `confirmada`, `cancelada`
- `data_inicio` (date): YYYY-MM-DD
- `data_fim` (date): YYYY-MM-DD
- `page` (int): Número da página (padrão: 1)
- `limit` (int): Itens por página (máx: 100, padrão: 20)

**Resposta** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agenciador_id": 1,
      "numero_processo": "PROC-001",
      "cliente_nome": "Cliente XYZ",
      "quantidade_chapas": 5,
      "valor_total": 5000.00,
      "comissao_percentual": 5.00,
      "comissao_valor": 250.00,
      "comissao_paga": false,
      "data_venda": "2024-03-01",
      "status": "pendente",
      "ativo": true,
      "data_cadastro": "2024-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### Obter Venda

```http
GET /vendas-agenciador/:id
```

**Parâmetros Path**:
- `id` (int): ID da venda

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "agenciador_id": 1,
    "numero_processo": "PROC-001",
    "cliente_nome": "Cliente XYZ",
    "valor_total": 5000.00,
    "comissao_valor": 250.00,
    "status": "pendente",
    "parcelas": [
      {
        "id": 1,
        "numero_parcela": 1,
        "valor": 1000.00,
        "data_vencimento": "2024-04-01",
        "status": "pendente"
      }
    ]
  }
}
```

---

### Criar Venda

```http
POST /vendas-agenciador
```

**Body**:
```json
{
  "agenciador_id": 1,
  "numero_processo": "PROC-001",
  "cliente_nome": "Cliente XYZ",
  "cliente_id": null,
  "quantidade_chapas": 5,
  "valor_total": 5000.00,
  "comissao_percentual": 5.00,
  "descricao": "Venda de granito cinza"
}
```

**Validação**:
- `numero_processo`: Obrigatório, 3-50 caracteres, único
- `cliente_nome`: Obrigatório, 3-255 caracteres
- `valor_total`: Obrigatório, > 0
- `comissao_percentual`: 0-100

**Resposta** (201):
```json
{
  "success": true,
  "message": "Venda criada com sucesso",
  "data": {
    "id": 1,
    "agenciador_id": 1,
    "numero_processo": "PROC-001",
    "cliente_nome": "Cliente XYZ",
    "valor_total": 5000.00,
    "comissao_valor": 250.00,
    "status": "pendente"
  }
}
```

**Erros**:
- 400: Validação falhou
- 404: Agenciador não encontrado
- 409: Número de processo já existe

---

### Atualizar Venda

```http
PUT /vendas-agenciador/:id
```

**Body**: Mesmo da criação

**Resposta** (200):
```json
{
  "success": true,
  "message": "Venda atualizada com sucesso",
  "data": { ... }
}
```

---

### Deletar Venda

```http
DELETE /vendas-agenciador/:id
```

**Resposta** (200):
```json
{
  "success": true,
  "message": "Venda deletada com sucesso"
}
```

**Nota**: Soft delete (não apaga dados)

---

### Resumo de Vendas

```http
GET /vendas-agenciador/agenciador/:agenciador_id/resumo
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "total_vendas": 5,
    "valor_total_vendas": 25000.00,
    "total_comissoes": 1250.00,
    "vendas_pendentes": 2,
    "vendas_confirmadas": 3,
    "vendas_canceladas": 0,
    "ticket_medio": 5000.00
  }
}
```

---

## 2️⃣ PARCELAS

### Listar Parcelas

```http
GET /parcelas-agenciador?venda_id=1&status=pendente&page=1&limit=20
```

**Parâmetros Query**:
- `venda_id` (int): ID da venda
- `status` (string): `pendente`, `paga`, `atrasada`, `cancelada`
- `data_inicio` (date): YYYY-MM-DD
- `data_fim` (date): YYYY-MM-DD
- `page` (int): Número da página
- `limit` (int): Itens por página

**Resposta** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "venda_id": 1,
      "numero_parcela": 1,
      "valor": 1000.00,
      "data_vencimento": "2024-04-01",
      "forma_pagamento": "boleto",
      "numero_boleto": "123456789",
      "status": "pendente",
      "data_pagamento": null,
      "ativo": true
    }
  ],
  "pagination": { ... }
}
```

---

### Criar Parcela

```http
POST /parcelas-agenciador
```

**Body**:
```json
{
  "venda_id": 1,
  "numero_parcela": 1,
  "valor": 1000.00,
  "data_vencimento": "2024-04-01",
  "forma_pagamento": "boleto",
  "numero_boleto": "123456789",
  "observacao": "Primeira parcela"
}
```

**Validação**:
- `venda_id`: Obrigatório, deve existir
- `numero_parcela`: Obrigatório, > 0
- `valor`: Obrigatório, > 0
- `data_vencimento`: Obrigatório, formato ISO8601
- `forma_pagamento`: `boleto`, `cheque`, `dinheiro`, `transferencia`, `outro`

**Resposta** (201):
```json
{
  "success": true,
  "message": "Parcela criada com sucesso",
  "data": {
    "id": 1,
    "venda_id": 1,
    "numero_parcela": 1,
    "valor": 1000.00,
    "status": "pendente"
  }
}
```

---

### Atualizar Parcela

```http
PUT /parcelas-agenciador/:id
```

**Body**:
```json
{
  "status": "paga",
  "data_pagamento": "2024-04-01",
  "numero_boleto": "123456789"
}
```

**Resposta** (200):
```json
{
  "success": true,
  "message": "Parcela atualizada com sucesso",
  "data": { ... }
}
```

---

### Resumo de Parcelas

```http
GET /parcelas-agenciador/venda/:venda_id/resumo
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "total_parcelas": 5,
    "valor_total": 5000.00,
    "pagas": 2,
    "pendentes": 3,
    "atrasadas": 0,
    "valor_pago": 2000.00,
    "valor_pendente": 3000.00
  }
}
```

---

## 3️⃣ COMISSÕES

### Listar Comissões

```http
GET /comissoes-agenciador?agenciador_id=1&status=pendente&periodo_mes=3&periodo_ano=2024
```

**Parâmetros Query**:
- `agenciador_id` (int): ID do agenciador
- `status` (string): `pendente`, `paga`, `cancelada`
- `periodo_mes` (int): 1-12
- `periodo_ano` (int): Ano
- `page` (int): Número da página
- `limit` (int): Itens por página

**Resposta** (200):
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
      "data_pagamento": null
    }
  ],
  "pagination": { ... }
}
```

---

### Criar Comissão

```http
POST /comissoes-agenciador
```

**Body**:
```json
{
  "agenciador_id": 1,
  "venda_id": 1,
  "valor_venda": 5000.00,
  "percentual_comissao": 5.00,
  "valor_comissao": 250.00,
  "periodo_mes": 3,
  "periodo_ano": 2024,
  "observacao": "Comissão de março"
}
```

**Resposta** (201):
```json
{
  "success": true,
  "message": "Comissão criada com sucesso",
  "data": {
    "id": 1,
    "agenciador_id": 1,
    "valor_comissao": 250.00,
    "status": "pendente"
  }
}
```

---

### Comissões por Período

```http
GET /comissoes-agenciador/agenciador/:agenciador_id/periodo?periodo_mes=3&periodo_ano=2024
```

**Resposta** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "valor_comissao": 250.00,
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

---

## 4️⃣ RECEBIMENTOS

### Listar Recebimentos

```http
GET /comissoes-agenciador/recebimentos?agenciador_id=1&status=pago
```

**Parâmetros Query**:
- `agenciador_id` (int): ID do agenciador
- `status` (string): `pendente`, `pago`, `cancelado`
- `periodo_mes` (int): 1-12
- `periodo_ano` (int): Ano
- `page` (int): Número da página
- `limit` (int): Itens por página

**Resposta** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agenciador_id": 1,
      "periodo_mes": 3,
      "periodo_ano": 2024,
      "valor_total_comissoes": 430.00,
      "valor_recebido": 430.00,
      "forma_pagamento": "transferencia",
      "data_recebimento": "2024-04-05",
      "numero_comprovante": "TRF-12345678",
      "status": "pago"
    }
  ],
  "pagination": { ... }
}
```

---

### Criar Recebimento

```http
POST /comissoes-agenciador/recebimentos
```

**Body**:
```json
{
  "agenciador_id": 1,
  "periodo_mes": 3,
  "periodo_ano": 2024,
  "valor_total_comissoes": 430.00,
  "valor_recebido": 430.00,
  "forma_pagamento": "transferencia",
  "data_recebimento": "2024-04-05",
  "numero_comprovante": "TRF-12345678",
  "observacao": "Transferência bancária"
}
```

**Validação**:
- `agenciador_id`: Obrigatório
- `periodo_mes`: Obrigatório, 1-12
- `periodo_ano`: Obrigatório
- `valor_total_comissoes`: Obrigatório, > 0
- `forma_pagamento`: `transferencia`, `cheque`, `dinheiro`, `outro`

**Resposta** (201):
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
    "status": "pago"
  }
}
```

---

## 5️⃣ CLIENTES

### Listar Clientes

```http
GET /clientes-agenciador?agenciador_id=1&prioridade=alta&page=1&limit=20
```

**Parâmetros Query**:
- `agenciador_id` (int): ID do agenciador
- `prioridade` (string): `alta`, `media`, `baixa`
- `page` (int): Número da página
- `limit` (int): Itens por página

**Resposta** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agenciador_id": 1,
      "cliente_id": null,
      "nome_cliente": "Cliente XYZ",
      "email": "cliente@example.com",
      "telefone": "11999999999",
      "cnpj_cpf": "12345678901234",
      "endereco": "Rua das Flores, 123",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234567",
      "prioridade": "alta",
      "total_vendas": 5000.00,
      "total_recebido": 4500.00,
      "ativo": true
    }
  ],
  "pagination": { ... }
}
```

---

### Criar Cliente

```http
POST /clientes-agenciador
```

**Body**:
```json
{
  "agenciador_id": 1,
  "nome_cliente": "Cliente XYZ",
  "email": "cliente@example.com",
  "telefone": "11999999999",
  "cnpj_cpf": "12345678901234",
  "endereco": "Rua das Flores, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234567",
  "prioridade": "alta"
}
```

**Validação**:
- `agenciador_id`: Obrigatório
- `nome_cliente`: Obrigatório, 3-255 caracteres
- `email`: Email válido
- `prioridade`: `alta`, `media`, `baixa`

**Resposta** (201):
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": {
    "id": 1,
    "agenciador_id": 1,
    "nome_cliente": "Cliente XYZ",
    "prioridade": "alta"
  }
}
```

---

### Top Clientes

```http
GET /clientes-agenciador/agenciador/:agenciador_id/top
```

**Resposta** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome_cliente": "Cliente A",
      "prioridade": "alta",
      "total_vendas": 5,
      "total_recebido": 4500.00,
      "numero_vendas": 5,
      "valor_total_vendas": 5000.00,
      "ticket_medio": 1000.00
    }
  ]
}
```

---

## 6️⃣ RELATÓRIOS

### Relatório Mensal

```http
GET /relatorios-agenciador/agenciador/:agenciador_id/mensal?mes=3&ano=2024
```

**Parâmetros Query**:
- `mes` (int): 1-12
- `ano` (int): Ano

**Resposta** (200):
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
      "vendas_pendentes": 0,
      "vendas_confirmadas": 5,
      "vendas_canceladas": 0,
      "ticket_medio": 1720.00,
      "maior_venda": 2000.00,
      "menor_venda": 1000.00
    },
    "parcelas": {
      "total_parcelas": 15,
      "valor_total_parcelas": 8600.00,
      "pagas": 8,
      "pendentes": 7,
      "atrasadas": 0,
      "valor_pago": 4500.00,
      "valor_pendente": 4100.00
    },
    "comissoes": {
      "total_comissoes": 5,
      "valor_total_comissoes": 430.00,
      "pendentes": 2,
      "pagas": 3,
      "valor_pendente": 180.00,
      "valor_pago": 250.00
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

### Relatório Anual

```http
GET /relatorios-agenciador/agenciador/:agenciador_id/anual?ano=2024
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "periodo": {
      "ano": 2024
    },
    "totais_anuais": {
      "total_vendas": 50,
      "valor_total_vendas": 86000.00,
      "total_comissoes_geradas": 4300.00,
      "total_clientes_unicos": 15,
      "ticket_medio": 1720.00,
      "maior_venda": 5000.00
    },
    "vendas_por_mes": [
      {
        "mes": 1,
        "total_vendas": 5,
        "valor_total": 8600.00,
        "total_comissoes": 430.00,
        "ticket_medio": 1720.00
      }
    ],
    "comissoes_por_status": [
      {
        "status": "paga",
        "total": 30,
        "valor_total": 2500.00
      }
    ]
  }
}
```

---

### Relatório de Desempenho

```http
GET /relatorios-agenciador/agenciador/:agenciador_id/desempenho
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "agenciador": {
      "id": 1,
      "usuario_id": 1,
      "comissao_percentual": 5.00,
      "total_vendas_intermediadas": 50,
      "total_comissao": 4300.00
    },
    "vendas": {
      "total_vendas": 50,
      "valor_total_vendas": 86000.00,
      "total_comissoes_geradas": 4300.00,
      "total_clientes_unicos": 15,
      "ticket_medio": 1720.00,
      "vendas_confirmadas": 48,
      "vendas_pendentes": 2,
      "vendas_canceladas": 0,
      "taxa_confirmacao": "96.00%"
    },
    "parcelas": {
      "total_parcelas": 150,
      "valor_total_parcelas": 86000.00,
      "pagas": 120,
      "pendentes": 30,
      "atrasadas": 0,
      "valor_pago": 68000.00,
      "valor_pendente": 18000.00,
      "valor_atrasado": 0.00,
      "taxa_recebimento": "79.07%"
    },
    "recebimentos": {
      "total_recebimentos": 10,
      "valor_total_recebido": 3500.00,
      "recebimentos_pagos": 8,
      "recebimentos_pendentes": 2
    }
  }
}
```

---

### Relatório de Pendências

```http
GET /relatorios-agenciador/agenciador/:agenciador_id/pendencias
```

**Resposta** (200):
```json
{
  "success": true,
  "data": {
    "parcelas_atrasadas": {
      "total": 2,
      "valor_total": 2000.00,
      "detalhes": [
        {
          "id": 1,
          "numero_parcela": 3,
          "numero_processo": "PROC-001",
          "cliente_nome": "Cliente XYZ",
          "valor": 1000.00,
          "data_vencimento": "2024-02-01",
          "dias_atraso": 28,
          "forma_pagamento": "boleto"
        }
      ]
    },
    "comissoes_nao_pagas": {
      "total": 5,
      "valor_total": 250.00,
      "detalhes": [
        {
          "id": 1,
          "venda_id": 1,
          "valor_venda": 5000.00,
          "valor_comissao": 250.00,
          "periodo_mes": 2,
          "periodo_ano": 2024,
          "status": "pendente"
        }
      ]
    },
    "recebimentos_nao_realizados": {
      "total": 2,
      "valor_total": 500.00,
      "detalhes": [
        {
          "id": 1,
          "periodo_mes": 2,
          "periodo_ano": 2024,
          "valor_total_comissoes": 250.00,
          "status": "pendente",
          "data_prevista": "2024-03-30"
        }
      ]
    },
    "resumo": {
      "valor_total_pendente": 2750.00
    }
  }
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Validação falhou |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Recurso já existe |
| 500 | Internal Server Error - Erro no servidor |

---

## Rate Limiting

- **Geral**: 100 requisições / 15 minutos
- **Login**: 5 tentativas / 15 minutos
- **Registro**: 3 registros / hora
- **Upload**: 10 uploads / hora
- **Contatos**: 20 contatos / hora

---

## Paginação

Todas as listas suportam paginação:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Filtros

Suportados em listas:

- **Status**: `pendente`, `confirmada`, `cancelada`, `paga`, `atrasada`
- **Data**: `data_inicio`, `data_fim` (formato: YYYY-MM-DD)
- **Período**: `periodo_mes` (1-12), `periodo_ano`
- **Prioridade**: `alta`, `media`, `baixa`

---

## Soft Delete

Todos os recursos usam soft delete:

- Dados não são realmente apagados
- Campo `ativo` é definido como `FALSE`
- Histórico é preservado
- Recuperação é possível

---

**Versão**: 1.0.0  
**Última Atualização**: Março 2024
