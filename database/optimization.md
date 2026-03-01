# 🚀 Otimização de Banco de Dados

## Análise de Performance

### Queries Críticas para Otimização

#### 1. Listagem de Materiais (GET /api/materiais)
**Problema**: JOIN com múltiplas tabelas sem índices
**Solução**: 
- Adicionar índices em `conta_id`, `tipo_material_id`, `ativo`, `aprovado`
- Usar EXPLAIN para analisar plano de execução
- Limitar resultado com LIMIT/OFFSET

**Query Otimizada**:
```sql
SELECT m.*, tm.nome as tipo_material, c.nome_fantasia as empresa_nome
FROM materiais m
INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
INNER JOIN contas c ON m.conta_id = c.id
WHERE m.ativo = TRUE 
  AND m.aprovado = TRUE 
  AND c.ativa = TRUE 
  AND c.aprovada = TRUE
ORDER BY m.destaque DESC, m.data_cadastro DESC
LIMIT 50 OFFSET 0;
```

#### 2. Busca de Usuário por Email (POST /api/auth/login)
**Problema**: Múltiplas queries sequenciais
**Solução**:
- Adicionar índice em `email` (já feito)
- Usar UNION para buscar em uma única query

**Query Otimizada**:
```sql
(SELECT id, email, senha, 'conta' as tipo FROM contas WHERE email = ? AND ativa = TRUE)
UNION ALL
(SELECT id, email, senha, 'usuario' as tipo FROM usuarios WHERE email = ? AND ativo = TRUE)
UNION ALL
(SELECT id, email, senha, 'administrador' as tipo FROM usuarios_administradores WHERE email = ? AND ativo = TRUE)
LIMIT 1;
```

#### 3. Contatos por Conta (GET /api/contatos/conta)
**Problema**: Sem índices em `conta_id`
**Solução**:
- Adicionar índice em `conta_id`
- Usar paginação

**Query Otimizada**:
```sql
SELECT c.*, u.nome as usuario_nome, m.nome as material_nome
FROM contatos c
LEFT JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN materiais m ON c.material_id = m.id
WHERE c.conta_id = ?
ORDER BY c.data_contato DESC
LIMIT 20 OFFSET 0;
```

### Índices Implementados

Todos os índices foram criados no arquivo `database/indexes.sql`:

| Tabela | Coluna | Tipo | Razão |
|--------|--------|------|-------|
| contas | email | UNIQUE | Busca por email (login) |
| contas | cnpj | UNIQUE | Validação de duplicação |
| contas | aprovada | INDEX | Filtro de aprovação |
| contas | ativa | INDEX | Filtro de status |
| usuarios | email | UNIQUE | Busca por email (login) |
| usuarios | cpf | UNIQUE | Validação de duplicação |
| materiais | conta_id | INDEX | Busca por empresa |
| materiais | tipo_material_id | INDEX | Filtro por tipo |
| materiais | ativo, aprovado | COMPOSITE | Filtro de status |
| contatos | conta_id | INDEX | Busca por empresa |
| contatos | usuario_id | INDEX | Busca por usuário |
| favoritos | usuario_id, material_id | COMPOSITE | Busca rápida |

---

## Cache

### Estratégia de Cache Implementada

**Tipos de Cache**:
- **Planos**: 1 hora (dados raramente mudam)
- **Tipos de Materiais**: 1 hora (dados estáticos)
- **Materiais**: 5 minutos (dados mudam frequentemente)
- **Contas**: 10 minutos (dados mudam moderadamente)
- **Usuários**: 10 minutos (dados mudam moderadamente)

**Invalidação de Cache**:
- Automática ao criar/atualizar/deletar
- Manual via endpoint de admin
- Baseada em padrão (ex: limpar todos os materiais)

**Exemplo de Uso**:
```javascript
// Usar cache middleware
router.get('/planos', cacheMiddleware(CACHE_TTL.planos), async (req, res) => {
  // ...
});

// Invalidar cache ao atualizar
router.put('/planos/:id', invalidateCacheOnWrite('^GET:/api/planos'), async (req, res) => {
  // ...
});
```

---

## Paginação Otimizada

### Implementação

```javascript
// Sempre usar limit e offset
const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Máximo 100
const offset = parseInt(req.query.offset) || 0;

// Query com paginação
query += ' LIMIT ? OFFSET ?';
params.push(limit, offset);

// Retornar total para frontend
const [countResult] = await connection.execute(countQuery, countParams);
const total = countResult[0].total;

res.json({
  success: true,
  data: items,
  pagination: {
    limit,
    offset,
    total,
    pages: Math.ceil(total / limit)
  }
});
```

---

## Compressão de Resposta

### Implementação com gzip

```javascript
const compression = require('compression');

// Adicionar ao server.js
app.use(compression({
  level: 6, // Nível de compressão (0-9)
  threshold: 1024 // Apenas comprimir se > 1KB
}));
```

**Benefícios**:
- Reduz tamanho da resposta em ~70%
- Melhora tempo de transferência
- Suportado por todos os navegadores modernos

---

## Monitoramento de Performance

### Métricas Importantes

1. **Tempo de Query**
```javascript
const start = Date.now();
const [result] = await connection.execute(query, params);
const duration = Date.now() - start;

if (duration > 1000) {
  log.performance('Query lenta detectada', duration, { query });
}
```

2. **Tamanho de Resposta**
```javascript
const size = JSON.stringify(data).length;
if (size > 1000000) { // > 1MB
  log.performance('Resposta grande', size, { endpoint: req.path });
}
```

3. **Taxa de Cache Hit**
```javascript
const stats = getCacheStats();
const hitRate = stats.hits / (stats.hits + stats.misses);
console.log(`Cache hit rate: ${(hitRate * 100).toFixed(2)}%`);
```

---

## Recomendações Adicionais

### Curto Prazo
- ✅ Adicionar índices (já feito)
- ✅ Implementar cache (já feito)
- ✅ Otimizar queries críticas
- Implementar paginação em todas as listagens
- Adicionar compressão gzip

### Médio Prazo
- Usar Redis para cache distribuído
- Implementar connection pooling otimizado
- Adicionar replicação do banco de dados
- Implementar sharding para dados grandes

### Longo Prazo
- Considerar NoSQL para dados não-estruturados
- Implementar data warehouse para relatórios
- Usar CDN para arquivos estáticos
- Implementar microserviços

---

## Teste de Performance

### Ferramentas Recomendadas
- **Apache JMeter**: Teste de carga
- **Postman**: Teste de API
- **MySQL Workbench**: Análise de queries
- **New Relic**: Monitoramento em produção

### Exemplo de Teste
```bash
# Teste de carga com Apache JMeter
jmeter -n -t test_plan.jmx -l results.jtl -j jmeter.log

# Teste de API com Postman
newman run collection.json -e environment.json
```

---

## Checklist de Otimização

- [x] Adicionar índices ao banco de dados
- [x] Implementar cache em memória
- [x] Otimizar queries críticas
- [ ] Implementar paginação em todas as listagens
- [ ] Adicionar compressão gzip
- [ ] Implementar Redis para cache distribuído
- [ ] Configurar connection pooling otimizado
- [ ] Adicionar monitoramento de performance
- [ ] Fazer teste de carga
- [ ] Implementar CDN para arquivos estáticos

---

**Última atualização**: 01/03/2026
