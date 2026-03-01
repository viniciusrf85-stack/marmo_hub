# 🏔️ MarmoHub - Marketplace de Pedras Ornamentais

Sistema completo de marketplace para compra e venda de granito e mármore, com autenticação robusta, validação de dados, cache inteligente e otimizações de performance.

## 📋 Características

### Segurança
- ✅ Autenticação JWT com tokens seguros
- ✅ Validação de entrada em todas as rotas
- ✅ Rate limiting para proteção contra brute force
- ✅ Headers de segurança com Helmet
- ✅ Sanitização de dados
- ✅ CORS seguro e restritivo
- ✅ Logging de eventos de segurança
- ✅ Sem credenciais hardcoded

### Performance
- ✅ Cache inteligente com TTL configurável
- ✅ 40+ índices de banco de dados
- ✅ Compressão gzip de respostas
- ✅ Paginação otimizada
- ✅ Prepared statements para todas as queries
- ✅ Logging estruturado com Winston

### Funcionalidades
- ✅ Registro de contas (empresas) e usuários (consumidores)
- ✅ Autenticação unificada
- ✅ Gerenciamento de materiais (granito/mármore)
- ✅ Sistema de favoritos
- ✅ Contatos entre usuários e empresas
- ✅ Dashboard com estatísticas
- ✅ Sistema de planos
- ✅ Histórico de atividades

## 🚀 Quick Start

### Pré-requisitos
- Node.js 16+
- MySQL 5.7+
- Git

### Instalação

```bash
# Clonar repositório
git clone https://github.com/viniciusrf85-stack/marmo_hub.git
cd marmo_hub

# Backend
cd backend
npm install
cp .env.example .env
# Editar .env com suas credenciais

# Frontend
cd ../frontend
npm install
```

### Executar Localmente

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acesse:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Health: http://localhost:3001/health

## 📁 Estrutura do Projeto

```
marmo_hub/
├── backend/
│   ├── config/          # Configuração do banco de dados
│   ├── middleware/      # Middlewares (auth, cache, security)
│   ├── routes/          # Rotas da API
│   ├── utils/           # Utilitários (validação, erro, logger)
│   ├── tests/           # Testes automatizados
│   ├── logs/            # Arquivos de log
│   ├── uploads/         # Arquivos enviados
│   ├── server.js        # Servidor principal
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── contexts/    # Context API (autenticação)
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── styles/      # Estilos CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── database/
│   ├── schema.sql       # Schema do banco de dados
│   ├── indexes.sql      # Índices para otimização
│   └── apply-indexes.js # Script de aplicação
│
├── SEGURANCA.md         # Guia de segurança
├── DESENVOLVIMENTO.md   # Guia de desenvolvimento
├── PERFORMANCE.md       # Guia de performance
├── DEPLOY.md            # Guia de deploy
├── CONTRIBUTING.md      # Guia de contribuição
└── README.md            # Este arquivo
```

## 🔐 Segurança

O projeto implementa múltiplas camadas de segurança:

- **Autenticação**: JWT com expiração configurável
- **Validação**: Express-validator em todas as rotas
- **Rate Limiting**: Proteção contra brute force
- **Headers**: Helmet para headers HTTP de segurança
- **Sanitização**: Remoção de caracteres perigosos
- **Logging**: Auditoria de ações sensíveis

Consulte [SEGURANCA.md](./SEGURANCA.md) para detalhes completos.

## ⚡ Performance

Otimizações implementadas:

- **Cache**: Dados frequentemente acessados são cacheados
- **Índices**: 40+ índices nas colunas mais consultadas
- **Compressão**: Respostas comprimidas com gzip (~70% menor)
- **Paginação**: Todas as listagens usam limit/offset

Consulte [PERFORMANCE.md](./PERFORMANCE.md) para detalhes.

## 🧪 Testes

```bash
cd backend

# Executar todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

## 📚 Documentação

- **[SEGURANCA.md](./SEGURANCA.md)** - Implementações de segurança
- **[DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md)** - Padrões de código e desenvolvimento
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Otimizações e monitoramento
- **[DEPLOY.md](./DEPLOY.md)** - Guia de deploy em produção
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Como contribuir
- **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de mudanças

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

Consulte [DEPLOY.md](./DEPLOY.md) para instruções detalhadas de deploy.

## 🔧 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=olx_pedra

JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/registro-conta` - Registrar empresa
- `POST /api/auth/registro-usuario` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/verificar` - Verificar token
- `POST /api/auth/alterar-senha` - Alterar senha

### Materiais
- `GET /api/materiais` - Listar materiais
- `POST /api/materiais` - Criar material
- `GET /api/materiais/:id` - Obter material
- `PUT /api/materiais/:id` - Atualizar material
- `DELETE /api/materiais/:id` - Deletar material

### Contas (Empresas)
- `GET /api/contas` - Listar contas
- `GET /api/contas/:id` - Obter conta
- `PUT /api/contas/:id` - Atualizar conta

### Usuários
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/:id` - Obter usuário
- `PUT /api/usuarios/:id` - Atualizar usuário

### Contatos
- `GET /api/contatos` - Listar contatos
- `POST /api/contatos` - Criar contato
- `PUT /api/contatos/:id` - Responder contato

### Favoritos
- `GET /api/favoritos` - Listar favoritos
- `POST /api/favoritos` - Adicionar favorito
- `DELETE /api/favoritos/:id` - Remover favorito

### Dashboard
- `GET /api/dashboard/estatisticas` - Estatísticas gerais
- `GET /api/dashboard/vendas` - Dados de vendas

## 🐛 Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar credenciais em .env
cat backend/.env | grep DB_
```

### Erro de Porta em Uso
```bash
# Encontrar processo
lsof -i :3001

# Matar processo
kill -9 <PID>
```

### Erro de Módulo Não Encontrado
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Autenticação 2FA
- [ ] Sistema de pagamento integrado
- [ ] Chat em tempo real
- [ ] Notificações por email
- [ ] Dark mode no frontend
- [ ] Relatórios avançados
- [ ] Integração com redes sociais

### Melhorias Técnicas
- [ ] Implementar Redis para cache distribuído
- [ ] Adicionar CDN para arquivos estáticos
- [ ] Implementar GraphQL
- [ ] Adicionar microserviços
- [ ] Implementar data warehouse

## 🤝 Contribuindo

Contribuições são bem-vindas! Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para diretrizes.

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](./LICENSE) para detalhes.

## 👥 Autores

- **Vinícius RF** - Desenvolvedor Principal

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através de:
- Email: suporte@olxpedra.com
- GitHub Issues: [Abrir Issue](https://github.com/viniciusrf85-stack/marmo_hub/issues)

## 🙏 Agradecimentos

Obrigado a todos os contribuidores e à comunidade por apoiar este projeto!

---

**Última atualização**: 01/03/2026

**Status**: ✅ Em Produção
