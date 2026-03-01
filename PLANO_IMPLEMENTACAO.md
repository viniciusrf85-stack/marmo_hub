# 🚀 Plano de Implementação - Nova Estrutura

## 📋 Checklist de Implementação

### Fase 1: Banco de Dados ✅
- [x] Schema melhorado criado
- [x] Script de migração preparado
- [ ] Migração executada (você vai fazer)
- [ ] Validação dos dados

### Fase 2: Backend 🔄
- [ ] Atualizar rotas de autenticação
  - [ ] `/api/auth/registro-conta` (empresas)
  - [ ] `/api/auth/registro-usuario` (consumidores)
  - [ ] `/api/auth/login` (unificado)
- [ ] Atualizar rotas de empresas → contas
- [ ] Atualizar rotas de usuários
- [ ] Atualizar middleware de autenticação
- [ ] Atualizar queries SQL

### Fase 3: Frontend 🎨
- [ ] Criar página de registro de conta (empresa)
- [ ] Atualizar página de registro de usuário (consumidor)
- [ ] Atualizar formulários de login
- [ ] Atualizar componentes que usam empresas
- [ ] Atualizar dashboards

### Fase 4: Testes 🧪
- [ ] Testar cadastro de conta (empresa)
- [ ] Testar cadastro de usuário (consumidor)
- [ ] Testar login de ambos
- [ ] Testar funcionalidades de empresas
- [ ] Testar funcionalidades de usuários

## 📁 Arquivos que Precisam ser Atualizados

### Backend
```
backend/
├── routes/
│   ├── auth.js              ⚠️ Atualizar (separar registro)
│   ├── empresas.js          ⚠️ Renomear para contas.js
│   └── usuarios.js          ⚠️ Atualizar (nova estrutura)
├── middleware/
│   └── auth.js              ⚠️ Atualizar (suportar contas e usuarios)
└── config/
    └── database.js          ✅ OK
```

### Frontend
```
frontend/src/
├── pages/
│   ├── Registro.jsx         ⚠️ Separar em dois formulários
│   ├── Login.jsx            ⚠️ Atualizar
│   └── empresa/             ⚠️ Atualizar referências
├── contexts/
│   └── AuthContext.jsx       ⚠️ Atualizar
└── components/
    └── Navbar.jsx            ⚠️ Atualizar se necessário
```

## 🔧 Mudanças Principais

### 1. Autenticação
**Antes:**
- `/api/auth/registro` → Criava usuário genérico

**Depois:**
- `/api/auth/registro-conta` → Cria conta (empresa)
- `/api/auth/registro-usuario` → Cria usuário (consumidor)
- `/api/auth/login` → Funciona para ambos

### 2. Estrutura de Dados
**Antes:**
```javascript
{
  tipo_usuario: 'empresa' | 'cliente',
  // campos misturados
}
```

**Depois:**
```javascript
// Conta (empresa)
{
  email, senha, cnpj, razao_social, plano_id, ...
}

// Usuário (consumidor)
{
  email, senha, nome, tipo_documento, tipo_consumidor, ...
}
```

### 3. Queries
**Antes:**
```sql
SELECT * FROM usuarios WHERE tipo_usuario = 'empresa'
```

**Depois:**
```sql
SELECT * FROM contas WHERE aprovada = TRUE
SELECT * FROM usuarios WHERE tipo_consumidor = 'marmorista'
```

## 📝 Próximos Passos

1. ✅ Você vai rodar a migração do banco
2. 🔄 Depois vamos atualizar o backend
3. 🎨 Depois vamos atualizar o frontend
4. 🧪 Por fim vamos testar tudo

---

**Quando você terminar a migração, me avise e começamos a atualizar a aplicação!** 🚀
