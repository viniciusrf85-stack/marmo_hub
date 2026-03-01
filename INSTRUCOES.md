# OLX Pedra - Instruções de Instalação e Uso

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **MySQL** (versão 8.0 ou superior) - [Download](https://dev.mysql.com/downloads/mysql/)
- **Git** (opcional) - [Download](https://git-scm.com/)

## 🚀 Instalação Passo a Passo

### 1. Preparar o Banco de Dados

Abra o MySQL e execute os seguintes comandos:

```sql
-- Criar o banco de dados
CREATE DATABASE olx_pedra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE olx_pedra;

-- Importar o schema (você pode usar o comando source no MySQL)
-- Ou execute o conteúdo do arquivo database/schema.sql
```

**Alternativa via linha de comando:**
```bash
mysql -u root -p < database/schema.sql
```

### 2. Instalar Dependências

Execute o script de instalação:

```bash
instalar.bat
```

Este script irá:
- Instalar dependências do backend (Node.js/Express)
- Instalar dependências do frontend (React/Vite)
- Criar arquivo `.env` de configuração
- Criar estrutura de diretórios necessária

### 3. Configurar Ambiente

Edite o arquivo `backend/.env` com suas configurações:

```env
DB_USER=root           # Seu usuário do MySQL
DB_PASSWORD=sua_senha  # Sua senha do MySQL
DB_NAME=olx_pedra      # Nome do banco (não alterar)
```

### 4. Iniciar o Sistema

Execute o script de inicialização:

```bash
iniciar.bat
```

O sistema será iniciado em:
- **Backend (API)**: http://localhost:3001
- **Frontend (Interface)**: http://localhost:5173

## 👤 Usuário Padrão

### Administrador
- **Email**: admin@olxpedra.com
- **Senha**: admin123

⚠️ **IMPORTANTE**: Altere a senha do administrador após o primeiro acesso!

## 📚 Estrutura do Projeto

```
olx_pedra/
├── backend/              # API Node.js + Express
│   ├── config/          # Configurações (banco, etc)
│   ├── middleware/      # Middlewares (auth, upload)
│   ├── routes/          # Rotas da API
│   ├── uploads/         # Arquivos enviados
│   └── server.js        # Servidor principal
├── frontend/            # Interface React + Vite
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── contexts/    # Contextos (Auth, etc)
│   │   ├── pages/       # Páginas da aplicação
│   │   └── styles/      # Estilos CSS
│   └── index.html       # HTML principal
├── database/            # Scripts SQL
│   └── schema.sql       # Schema do banco
├── instalar.bat         # Script de instalação
└── iniciar.bat          # Script de inicialização
```

## 🎯 Funcionalidades Principais

### Para Empresas
- ✅ Cadastro de empresa com dados completos
- ✅ Gerenciamento de anúncios de pedras
- ✅ Upload de até 4 fotos por material (1 principal + 3 adicionais)
- ✅ Sistema de planos (3 a 21 anúncios)
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de contatos recebidos

### Para Clientes
- ✅ Navegação no marketplace
- ✅ Busca avançada com filtros
- ✅ Visualização detalhada de materiais
- ✅ Sistema de favoritos
- ✅ Contato direto com empresas

### Para Administradores
- ✅ Gerenciamento de usuários e empresas
- ✅ Aprovação de anúncios
- ✅ Gerenciamento de planos
- ✅ Dashboard administrativo completo

## 🔧 Comandos Úteis

### Backend
```bash
cd backend
npm start          # Iniciar servidor
npm run dev        # Iniciar em modo desenvolvimento (com nodemon)
```

### Frontend
```bash
cd frontend
npm run dev        # Iniciar servidor de desenvolvimento
npm run build      # Criar build de produção
npm run preview    # Visualizar build de produção
```

## 📊 Planos Disponíveis

| Plano | Anúncios | Valor/mês |
|-------|----------|-----------|
| Básico | 1-3 | R$ 99,90 |
| Bronze | 4-6 | R$ 179,90 |
| Prata | 7-9 | R$ 249,90 |
| Ouro | 10-12 | R$ 319,90 |
| Platina | 13-15 | R$ 389,90 |
| Diamante | 16-18 | R$ 449,90 |
| Premium | 19-21 | R$ 499,90 |

## 🔐 Tipos de Usuários

1. **Administrador** - Acesso total ao sistema
2. **Empresa** - Gerencia anúncios e perfil da empresa
3. **Cliente** - Busca e favorita materiais
4. **Agenciador** - Intermedia negociações (em desenvolvimento)

## 🐛 Resolução de Problemas

### Erro de conexão com banco de dados
- Verifique se o MySQL está rodando
- Confirme usuário e senha no arquivo `.env`
- Verifique se o banco `olx_pedra` existe

### Porta já em uso
- Backend: Altere `PORT` no arquivo `.env`
- Frontend: Altere `server.port` no `vite.config.js`

### Erro ao fazer upload de fotos
- Verifique se a pasta `backend/uploads` existe
- Confirme permissões de escrita na pasta

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a documentação completa no `README.md`
- Verifique os logs do backend e frontend
- Entre em contato com o suporte técnico

## 📝 Licença

Sistema desenvolvido para o mercado de pedras ornamentais do Espírito Santo.

---

**Desenvolvido com ❤️ para o mercado de pedras ornamentais**



