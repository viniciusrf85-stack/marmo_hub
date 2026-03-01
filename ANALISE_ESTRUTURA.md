# 📊 Análise: Separar Contas de Usuários

## 🎯 Situação Atual

Atualmente o sistema usa uma única tabela `usuarios` para:
- ✅ Administradores
- ✅ Empresas anunciantes (com CNPJ e planos)
- ✅ Clientes/Consumidores (PF ou PJ que procuram pedras)
- ✅ Agenciadores

## 🔍 Problemas Identificados

1. **Confusão conceitual**: Empresas anunciantes são tratadas como "usuários"
2. **Campos desnecessários**: Clientes não precisam de planos, empresas não precisam de CPF
3. **Queries complexas**: Mistura lógica de diferentes tipos de entidades
4. **Manutenção difícil**: Alterações afetam todos os tipos

## ✅ Proposta: Estrutura Separada

### 1. **Tabela `contas`** (Empresas Anunciantes)
- CNPJ obrigatório
- Vinculada a planos
- Precisa de aprovação
- Gerencia anúncios de materiais
- Campos: CNPJ, razão social, plano, etc.

### 2. **Tabela `usuarios`** (Consumidores)
- Pode ser PF (CPF) ou PJ (CNPJ)
- Não precisa de plano
- Busca e favorita materiais
- Campos: nome, CPF/CNPJ opcional, tipo_consumidor

### 3. **Tabela `usuarios_administradores`** (Opcional)
- Separar administradores para maior segurança
- Ou manter na tabela usuarios com tipo específico

## 📋 Comparação

| Aspecto | Tabela Única | Tabelas Separadas |
|---------|--------------|-------------------|
| **Clareza** | ⚠️ Confusa | ✅ Clara |
| **Performance** | ✅ Boa | ✅ Boa |
| **Manutenção** | ⚠️ Complexa | ✅ Simples |
| **Queries** | ⚠️ Complexas | ✅ Simples |
| **Validações** | ⚠️ Condicionais | ✅ Específicas |
| **Migração** | ✅ Já existe | ⚠️ Requer migração |

## 🎯 Recomendação Final

### ✅ **SEPARAR EM TABELAS DIFERENTES**

**Motivos:**
1. **Separação de responsabilidades**: Contas (anunciar) vs Usuários (comprar)
2. **Fluxos diferentes**: Cadastro de empresa é diferente de cadastro de consumidor
3. **Validações específicas**: CNPJ obrigatório para contas, opcional para usuários
4. **Queries mais simples**: Não precisa filtrar por tipo_usuario constantemente
5. **Escalabilidade**: Facilita adicionar novos campos específicos
6. **Segurança**: Melhor controle de acesso por tipo de entidade

## 📝 Estrutura Proposta

```
contas (Empresas Anunciantes)
├── id
├── email (login)
├── senha
├── cnpj (obrigatório)
├── razao_social
├── nome_fantasia
├── plano_id (vinculado)
├── aprovada
└── ...dados da empresa

usuarios (Consumidores)
├── id
├── email (login)
├── senha
├── nome
├── tipo_documento (cpf/cnpj)
├── cpf (opcional)
├── cnpj (opcional)
├── tipo_consumidor (marmorista, atacadista, etc)
└── ...dados do consumidor
```

## 🔄 Migração

1. Criar novas tabelas (`contas`, `usuarios` atualizada)
2. Migrar dados existentes
3. Atualizar foreign keys
4. Atualizar código backend/frontend
5. Testar funcionalidades

## ⚠️ Considerações

- **Tempo de desenvolvimento**: +2-3 dias
- **Risco de migração**: Médio (requer cuidado)
- **Benefício a longo prazo**: Alto
- **Compatibilidade**: Requer atualização de todo código

## 🚀 Próximos Passos

1. ✅ Aprovar estrutura proposta
2. 📝 Criar script de migração
3. 🔧 Atualizar rotas backend
4. 🎨 Atualizar formulários frontend
5. 🧪 Testar funcionalidades
6. 📚 Atualizar documentação

---

**Decisão**: Separar em tabelas diferentes é a melhor opção para o futuro do sistema.
