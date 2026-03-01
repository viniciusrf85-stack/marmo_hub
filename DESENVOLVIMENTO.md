# 📚 Guia de Desenvolvimento - marmo_hub

## Configuração do Ambiente

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

# Frontend
cd ../frontend
npm install
```

### Variáveis de Ambiente

```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env com suas credenciais
```

## Estrutura do Projeto

```
marmo_hub/
├── backend/
│   ├── config/          # Configuração (banco de dados)
│   ├── middleware/      # Middlewares (auth, upload, security)
│   ├── routes/          # Rotas da API
│   ├── utils/           # Utilitários (validação, erro, logger)
│   ├── tests/           # Testes automatizados
│   ├── docs/            # Documentação (Swagger)
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
│   │   ├── App.jsx      # Componente raiz
│   │   └── main.jsx     # Ponto de entrada
│   └── package.json
│
├── database/            # Scripts SQL
├── SEGURANCA.md         # Guia de segurança
├── DESENVOLVIMENTO.md   # Este arquivo
└── README.md            # Documentação geral
```

## Padrões de Código

### Backend

#### Estrutura de Rota
```javascript
const express = require('express');
const { asyncHandler, errors } = require('../utils/errorHandler');
const { validate, authValidators } = require('../utils/validators');
const { auth, checkTipo } = require('../middleware/auth');

const router = express.Router();

// Rota com validação e tratamento de erro
router.post('/endpoint',
  authValidators.validacao,
  validate,
  auth,
  checkTipo('tipo'),
  asyncHandler(async (req, res) => {
    try {
      // Implementação
      res.json({ success: true, data: {} });
    } catch (error) {
      if (error.statusCode) throw error;
      throw errors.DATABASE_ERROR('operação');
    }
  })
);

module.exports = router;
```

#### Tratamento de Erros
```javascript
// Usar classes de erro predefinidas
throw errors.VALIDATION_ERROR('Mensagem', { campo: 'detalhes' });
throw errors.UNAUTHORIZED('Mensagem');
throw errors.NOT_FOUND('Recurso');
throw errors.DATABASE_ERROR('operação');
```

#### Logging
```javascript
const { log } = require('../utils/logger');

log.auth('Login bem-sucedido', { userId: 123, email: 'user@test.com' });
log.security('Tentativa de acesso negado', { userId: 123, path: '/admin' });
log.error('Erro na operação', error, { userId: 123 });
log.database('Query executada', { query: 'SELECT...', duration: '50ms' });
log.business('Ação realizada', { userId: 123, action: 'criar_material' });
```

### Frontend

#### Estrutura de Componente
```javascript
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Component() {
  const { usuario, logout } = useAuth();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Efeito
  }, []);

  const handleAction = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ação
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return <div>{/* Conteúdo */}</div>;
}
```

## Testes

### Executar Testes
```bash
cd backend

# Todos os testes
npm test

# Modo watch (reexecuta ao salvar)
npm run test:watch

# Com cobertura
npm run test:coverage
```

### Escrever Testes
```javascript
describe('Funcionalidade', () => {
  it('deve fazer algo', async () => {
    const result = await funcao();
    expect(result).toBe(esperado);
  });

  it('deve lançar erro', async () => {
    await expect(funcao()).rejects.toThrow();
  });
});
```

## Commits e Versionamento

### Padrão de Commit
```
tipo(escopo): descrição

feat(auth): adicionar autenticação 2FA
fix(materiais): corrigir validação de preço
docs(readme): atualizar instruções
refactor(auth): simplificar middleware
test(auth): adicionar testes de login
```

### Tipos de Commit
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `refactor`: Refatoração de código
- `test`: Testes
- `chore`: Tarefas de manutenção

## Deploy

### Preparação para Produção

1. **Variáveis de Ambiente**
```bash
NODE_ENV=production
JWT_SECRET=<chave-aleatoria-segura>
DB_PASSWORD=<senha-segura>
FRONTEND_URL=https://seu-dominio.com
```

2. **Build Frontend**
```bash
cd frontend
npm run build
```

3. **Iniciar Backend**
```bash
cd backend
npm start
```

### Checklist de Deploy
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] Testes passando
- [ ] Build do frontend gerado
- [ ] HTTPS configurado
- [ ] Backups configurados
- [ ] Monitoramento ativo
- [ ] Logs sendo coletados

## Debugging

### Backend
```bash
# Modo debug com nodemon
NODE_ENV=development npm run dev

# Logs em tempo real
tail -f logs/app.log
tail -f logs/error.log
tail -f logs/security.log
```

### Frontend
```bash
# Abrir DevTools (F12)
# Verificar Console e Network
# Usar React DevTools
```

## Performance

### Backend
- Usar índices no banco de dados
- Implementar cache com Redis
- Otimizar queries SQL
- Usar connection pooling
- Comprimir respostas (gzip)

### Frontend
- Code splitting com React.lazy
- Lazy loading de imagens
- Minificação de assets
- Cache de assets estáticos
- Otimização de bundles

## Segurança

Consulte [SEGURANCA.md](./SEGURANCA.md) para:
- Configuração de variáveis de ambiente
- Validação de entrada
- Rate limiting
- Headers de segurança
- Boas práticas

## Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar credenciais em .env
cat backend/.env
```

### Erro de Porta em Uso
```bash
# Encontrar processo na porta 3001
lsof -i :3001

# Matar processo
kill -9 <PID>
```

### Erro de Módulo Não Encontrado
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## Recursos Adicionais

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

**Última atualização**: 01/03/2026
