# 📊 Dados Necessários no Banco de Dados

## 🎯 Resumo Rápido

Para testar o sistema de agenciadores, você **NÃO precisa** de muitos dados pré-existentes. O sistema cria automaticamente os dados ao registrar um agenciador.

---

## 📋 Dados Obrigatórios (Mínimo para Funcionar)

### 1. **Tabela `planos`** (Opcional, mas recomendado)
Se você tiver empresas (contas) que usam planos, precisa de pelo menos 1 plano:

```sql
INSERT INTO planos (nome, descricao, quantidade_anuncios, valor_mensal, ativo)
VALUES ('Plano Básico', 'Plano básico para testes', 10, 99.90, TRUE);
```

**Campos necessários:**
- `nome` - Nome do plano
- `quantidade_anuncios` - Quantidade de anúncios permitidos
- `valor_mensal` - Valor mensal do plano
- `ativo` - Se está ativo (TRUE/FALSE)

---

### 2. **Tabela `tipos_material`** (Opcional, mas recomendado)
Se você tiver materiais cadastrados:

```sql
INSERT INTO tipos_material (nome, descricao, ativo)
VALUES 
  ('Granito', 'Pedras de granito natural', TRUE),
  ('Mármore', 'Pedras de mármore natural', TRUE),
  ('Quartzito', 'Pedras de quartzito', TRUE);
```

**Campos necessários:**
- `nome` - Nome do tipo de material
- `ativo` - Se está ativo (TRUE/FALSE)

---

## ✅ Dados que o Sistema Cria Automaticamente

### 1. **Ao Registrar um Agenciador**
Quando você acessa `/registro-agenciador` e preenche o formulário:

```
POST /api/auth/registro-agenciador
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "11999999999",
  "senha": "Senha123",
  "comissao_percentual": 5.00
}
```

**O sistema cria automaticamente:**
- ✅ Registro em `usuarios` (tipo_usuario = 'agenciador')
- ✅ Registro em `agenciadores` (com comissão padrão)
- ✅ Token JWT para autenticação

### 2. **Ao Adicionar uma Empresa**
Quando você acessa `/agenciador-empresas` e adiciona uma empresa:

```
POST /api/agenciador-empresas
{
  "empresa_nome": "Mármores Brasil Ltda",
  "cnpj": "12345678000195",
  "localizacao": "São Paulo, SP",
  "comissao_percentual": 8.50
}
```

**O sistema cria automaticamente:**
- ✅ Registro em `agenciador_empresas`
- ✅ Relacionamento com o agenciador logado

---

## 🗂️ Estrutura de Tabelas Necessárias

### Tabelas Críticas para Agenciadores

```
usuarios
├── id (PK)
├── email (UNIQUE)
├── senha
├── nome
├── telefone
├── tipo_usuario = 'agenciador'
└── ativo = TRUE

agenciadores
├── id (PK)
├── usuario_id (FK → usuarios)
├── comissao_percentual
├── total_vendas_intermediadas
├── total_comissao
└── ativo = TRUE

agenciador_empresas
├── id (PK)
├── agenciador_id (FK → agenciadores)
├── empresa_nome
├── cnpj (UNIQUE per agenciador)
├── localizacao
├── comissao_percentual
└── ativo = TRUE
```

### Tabelas Opcionais (para funcionalidades completas)

```
planos
├── id (PK)
├── nome
├── quantidade_anuncios
├── valor_mensal
└── ativo

tipos_material
├── id (PK)
├── nome (UNIQUE)
└── ativo

contas (Empresas anunciantes)
├── id (PK)
├── email
├── cnpj
├── plano_id (FK → planos)
└── ativo

materiais (Produtos das empresas)
├── id (PK)
├── conta_id (FK → contas)
├── tipo_material_id (FK → tipos_material)
├── nome
├── valor_m2
└── ativo
```

---

## 🚀 Fluxo de Teste Recomendado

### **Passo 1: Criar Dados Básicos** (Execute uma vez)

```sql
-- Criar plano
INSERT INTO planos (nome, descricao, quantidade_anuncios, valor_mensal, ativo)
VALUES ('Plano Teste', 'Plano para testes', 50, 199.90, TRUE);

-- Criar tipos de material
INSERT INTO tipos_material (nome, descricao, ativo)
VALUES 
  ('Granito', 'Granito natural', TRUE),
  ('Mármore', 'Mármore natural', TRUE),
  ('Quartzito', 'Quartzito natural', TRUE);
```

### **Passo 2: Registrar Agenciador** (Via Frontend)

1. Acesse: `http://localhost:5173/registro-agenciador`
2. Preencha:
   - Nome: `João Silva`
   - Email: `joao@example.com`
   - Telefone: `11999999999`
   - Senha: `Senha@123`
3. Clique em "Confirmar"
4. Sistema cria automaticamente usuário + agenciador

### **Passo 3: Adicionar Empresas** (Via Frontend)

1. Faça login com o agenciador
2. Acesse: `/agenciador-dashboard`
3. Clique em: `⚙️ Minhas Empresas`
4. Clique em: `+ Adicionar Empresa`
5. Preencha:
   - Nome: `Mármores Brasil`
   - CNPJ: `12345678000195`
   - Localização: `São Paulo, SP`
   - Comissão: `8.50`
6. Clique em "Adicionar"

### **Passo 4: Testar CRUD de Empresas**

- ✅ Listar empresas
- ✅ Editar empresa (clique em ✎)
- ✅ Deletar empresa (clique em ✕)
- ✅ Adicionar múltiplas empresas

---

## 📝 Script SQL Completo (Dados Iniciais)

```sql
-- ============================================
-- DADOS INICIAIS PARA TESTE
-- ============================================

-- Criar planos
INSERT INTO planos (nome, descricao, quantidade_anuncios, valor_mensal, ativo, ordem)
VALUES 
  ('Plano Básico', 'Perfeito para começar', 10, 99.90, TRUE, 1),
  ('Plano Profissional', 'Para empresas em crescimento', 50, 299.90, TRUE, 2),
  ('Plano Premium', 'Máxima visibilidade', 200, 599.90, TRUE, 3);

-- Criar tipos de material
INSERT INTO tipos_material (nome, descricao, ativo)
VALUES 
  ('Granito', 'Pedras de granito natural de alta qualidade', TRUE),
  ('Mármore', 'Pedras de mármore natural e importado', TRUE),
  ('Quartzito', 'Pedras de quartzito resistente', TRUE),
  ('Calcário', 'Pedras de calcário natural', TRUE),
  ('Ardósia', 'Pedras de ardósia para revestimento', TRUE);

-- Criar um usuário administrador (se necessário)
-- INSERT INTO usuarios_administradores (email, senha, nome, telefone, ativo)
-- VALUES ('admin@example.com', '$2b$10$...', 'Admin', '11999999999', TRUE);
```

---

## 🔍 Verificar Dados no Banco

```sql
-- Ver planos
SELECT * FROM planos;

-- Ver tipos de material
SELECT * FROM tipos_material;

-- Ver agenciadores registrados
SELECT u.id, u.nome, u.email, a.id as agenciador_id, a.comissao_percentual
FROM usuarios u
JOIN agenciadores a ON u.id = a.usuario_id
WHERE u.tipo_usuario = 'agenciador';

-- Ver empresas de um agenciador
SELECT * FROM agenciador_empresas WHERE agenciador_id = 1;

-- Ver todas as tabelas
SHOW TABLES;

-- Ver estrutura de uma tabela
DESCRIBE agenciador_empresas;
```

---

## ⚠️ Importante

1. **Tabela `agenciador_empresas` DEVE existir**
   - Se não existir, execute:
   ```sql
   CREATE TABLE IF NOT EXISTS agenciador_empresas (
       id INT AUTO_INCREMENT PRIMARY KEY,
       agenciador_id INT NOT NULL,
       empresa_nome VARCHAR(255) NOT NULL,
       cnpj VARCHAR(18) NOT NULL,
       localizacao VARCHAR(255) NOT NULL,
       comissao_percentual DECIMAL(5, 2) NOT NULL,
       ativo BOOLEAN DEFAULT TRUE,
       data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (agenciador_id) REFERENCES agenciadores(id) ON DELETE CASCADE,
       UNIQUE KEY unique_agenciador_cnpj (agenciador_id, cnpj),
       INDEX idx_agenciador_id (agenciador_id),
       INDEX idx_ativo (ativo)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
   ```

2. **Tabelas principais DEVEM existir:**
   - `usuarios`
   - `agenciadores`
   - `planos`
   - `tipos_material`
   - `agenciador_empresas`

3. **Banco de dados DEVE estar rodando** na porta `3306`

---

## 📞 Resumo Final

| Dado | Obrigatório? | Como Criar |
|------|-------------|-----------|
| Planos | ❌ Não | SQL INSERT ou Admin |
| Tipos de Material | ❌ Não | SQL INSERT ou Admin |
| Agenciador | ✅ Sim | Frontend: `/registro-agenciador` |
| Empresas do Agenciador | ✅ Sim | Frontend: `/agenciador-empresas` |
| Usuário Admin | ❌ Não | SQL INSERT direto |

**Tudo pronto! Você pode começar a testar agora! 🎉**
