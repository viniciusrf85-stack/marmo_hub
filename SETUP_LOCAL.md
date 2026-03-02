# 🚀 Guia de Setup Local - MarmoHub Agenciadores

## 📋 Pré-requisitos

- ✅ Node.js v16+
- ✅ MySQL 8.0+ rodando na porta 3306
- ✅ Banco de dados `olx_pedra` existente
- ✅ Git instalado

---

## 🔧 Configuração do Backend

### **Passo 1: Configurar Variáveis de Ambiente**

Abra `backend/.env` e configure:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Dominus#202!
DB_NAME=olx_pedra
JWT_SECRET=sua_chave_secreta_desenvolvimento_minimo_32_caracteres_aqui_ok
```

✅ **Arquivo `.env` já foi criado para você!**

### **Passo 2: Preparar o Banco de Dados**

Execute o script SQL no seu MySQL:

```bash
# No seu computador (MySQL Workbench ou terminal):
mysql -u root -p olx_pedra < database/PREPARAR_OLX_PEDRA.sql
```

**Ou manualmente no MySQL Workbench:**
1. Abra `database/PREPARAR_OLX_PEDRA.sql`
2. Execute o script
3. Verifique se a tabela `agenciador_empresas` foi criada

### **Passo 3: Instalar Dependências**

```bash
cd backend
npm install
```

### **Passo 4: Iniciar o Servidor Backend**

```bash
npm start
```

**Você deve ver:**
```
=================================================
  OLX PEDRA - Backend API
=================================================
  OK Servidor rodando na porta: 3001
  OK URL: http://localhost:3001
  OK Database: Conectado
  ...
```

---

## 🎨 Configuração do Frontend

### **Passo 1: Instalar Dependências**

```bash
cd frontend
npm install
```

### **Passo 2: Iniciar o Servidor Frontend**

```bash
npm run dev
```

**Você deve ver:**
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 🧪 Testando o Sistema

### **Teste 1: Registrar um Agenciador**

1. Acesse: `http://localhost:5173/registro-agenciador`
2. Preencha o formulário:
   - **Nome:** João Silva
   - **Email:** joao@example.com
   - **Telefone:** 11999999999
   - **Senha:** Senha@123
3. Clique em "Confirmar"
4. ✅ Deve ser redirecionado para o dashboard

### **Teste 2: Adicionar Empresas Comissionárias**

1. No dashboard, clique em: **⚙️ Minhas Empresas**
2. Clique em: **+ Adicionar Empresa**
3. Preencha:
   - **Nome:** Mármores Brasil Ltda
   - **CNPJ:** 12345678000195
   - **Localização:** São Paulo, SP
   - **Comissão:** 8.50
4. Clique em "Adicionar"
5. ✅ Empresa deve aparecer na lista

### **Teste 3: Gerenciar Empresas**

- **Editar:** Clique no ícone ✎
- **Deletar:** Clique no ícone ✕
- **Listar:** Veja todas as empresas em cards

### **Teste 4: Adicionar Múltiplas Empresas**

Repita o Teste 2 com dados diferentes:

```
Empresa 2:
- Nome: Granitos Premium
- CNPJ: 98765432000100
- Localização: Rio de Janeiro, RJ
- Comissão: 10.00

Empresa 3:
- Nome: Quartzitos Especiais
- CNPJ: 55555555000150
- Localização: Belo Horizonte, MG
- Comissão: 7.50
```

---

## 🔍 Verificações de Dados

### **Ver Agenciadores Criados**

```sql
SELECT u.id, u.nome, u.email, a.id as agenciador_id, a.comissao_percentual
FROM usuarios u
JOIN agenciadores a ON u.id = a.usuario_id
WHERE u.tipo_usuario = 'agenciador';
```

### **Ver Empresas de um Agenciador**

```sql
SELECT * FROM agenciador_empresas WHERE agenciador_id = 1;
```

### **Ver Todas as Tabelas**

```sql
SHOW TABLES;
```

### **Ver Estrutura da Tabela**

```sql
DESCRIBE agenciador_empresas;
```

---

## ⚠️ Troubleshooting

### **Erro: "Can't connect to MySQL server"**

```bash
# Verifique se MySQL está rodando
# Windows: Services → MySQL80
# Mac: System Preferences → MySQL
# Linux: sudo service mysql status
```

### **Erro: "Access denied for user 'root'"**

```bash
# Verifique a senha no .env
# Teste a conexão:
mysql -u root -p -h localhost
# Digite: Dominus#202!
```

### **Erro: "Unknown database 'olx_pedra'"**

```bash
# Crie o banco de dados:
mysql -u root -p -e "CREATE DATABASE olx_pedra;"
```

### **Erro: "Table 'agenciador_empresas' doesn't exist"**

```bash
# Execute o script SQL:
mysql -u root -p olx_pedra < database/PREPARAR_OLX_PEDRA.sql
```

### **Erro: "Route.get() requires a callback function"**

```bash
# Já foi corrigido! Faça pull das mudanças:
git pull origin main
```

### **Frontend não conecta no Backend**

```bash
# Verifique se o backend está rodando:
curl http://localhost:3001/health

# Verifique o .env do frontend:
# VITE_API_URL=http://localhost:3001
```

---

## 📊 Estrutura de Pastas

```
marmo_hub/
├── backend/
│   ├── .env (✅ Configurado)
│   ├── server.js
│   ├── routes/
│   │   ├── auth_agenciador.js
│   │   ├── agenciador_empresas.js (NOVO)
│   │   └── ...
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── RegistroAgenciador.jsx (Refatorado)
│   │   │   ├── GerenciarEmpresasAgenciador.jsx (NOVO)
│   │   │   └── ...
│   │   └── App.jsx (Atualizado)
│   └── package.json
├── database/
│   ├── PREPARAR_OLX_PEDRA.sql (NOVO)
│   └── ...
└── README.md
```

---

## ✅ Checklist Final

- [ ] `.env` configurado com credenciais corretas
- [ ] MySQL rodando e banco `olx_pedra` criado
- [ ] Script `PREPARAR_OLX_PEDRA.sql` executado
- [ ] Tabela `agenciador_empresas` criada
- [ ] `npm install` executado no backend
- [ ] `npm install` executado no frontend
- [ ] Backend rodando em `http://localhost:3001`
- [ ] Frontend rodando em `http://localhost:5173`
- [ ] Agenciador registrado com sucesso
- [ ] Empresas adicionadas com sucesso
- [ ] CRUD de empresas funcionando

---

## 🎉 Pronto!

Se tudo passou no checklist, o sistema está funcionando! 

**Próximos passos:**
1. Explore o dashboard do agenciador
2. Teste adicionar/editar/deletar empresas
3. Verifique os dados no banco de dados
4. Faça testes de validação (CNPJ duplicado, campos vazios, etc.)

**Dúvidas ou problemas?** Verifique o arquivo `DADOS_NECESSARIOS_BANCO.md` para mais detalhes.

---

## 📞 Resumo de Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| MySQL | 3306 | localhost:3306 |
| Backend | 3001 | http://localhost:3001 |
| Frontend | 5173 | http://localhost:5173 |

---

**Última atualização:** 02/03/2026
**Versão:** 1.0.0
**Status:** ✅ Pronto para Produção
