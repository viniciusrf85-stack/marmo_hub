# 🔒 Guia de Segurança - marmo_hub

## Implementações de Segurança Realizadas

### 1. **Remoção de Credenciais Hardcoded**
- ✅ Removida senha padrão do arquivo de configuração
- ✅ Todas as credenciais agora devem ser configuradas via variáveis de ambiente
- ✅ Arquivo `.env.example` criado como referência

### 2. **Validação de Entrada**
- ✅ Implementado `express-validator` em todas as rotas
- ✅ Validação de email, telefone, CPF, CNPJ
- ✅ Validação de força de senha (mínimo 8 caracteres, maiúsculas, minúsculas, números)
- ✅ Validação de comprimento de strings
- ✅ Sanitização automática de entrada (remove caracteres perigosos)

### 3. **Rate Limiting**
- ✅ Rate limiting geral: 100 requisições por 15 minutos
- ✅ Rate limiting de login: 5 tentativas por 15 minutos (previne brute force)
- ✅ Rate limiting de registro: 3 registros por hora (previne spam)
- ✅ Rate limiting de upload: 10 uploads por hora
- ✅ Rate limiting de contatos: 20 contatos por hora

### 4. **Headers de Segurança (Helmet)**
- ✅ Content Security Policy (CSP)
- ✅ X-Content-Type-Options (previne MIME sniffing)
- ✅ X-Frame-Options (previne clickjacking)
- ✅ X-XSS-Protection (proteção contra XSS)
- ✅ Referrer-Policy (previne vazamento de referrer)
- ✅ Strict-Transport-Security (força HTTPS em produção)

### 5. **Tratamento de Erros Padronizado**
- ✅ Classe `ApiError` customizada
- ✅ Middleware `errorHandler` global
- ✅ Mensagens de erro consistentes
- ✅ Sem exposição de detalhes internos em produção
- ✅ Logs estruturados de erros

### 6. **CORS Seguro**
- ✅ Configuração de origem restrita
- ✅ Apenas métodos necessários permitidos
- ✅ Headers específicos permitidos
- ✅ Credenciais habilitadas apenas quando necessário

### 7. **Validação de Content-Type**
- ✅ Apenas `application/json` aceito em POST/PUT/PATCH
- ✅ Rejeita requisições com Content-Type inválido

### 8. **Cache Seguro**
- ✅ Desabilita cache de dados sensíveis (autenticação, admin)
- ✅ Headers apropriados para controle de cache

---

## Boas Práticas de Segurança

### Configuração de Ambiente

1. **Criar arquivo `.env` seguro:**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env com credenciais reais
```

2. **Gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Nunca commitar `.env`:**
```bash
# Já está no .gitignore
echo ".env" >> .gitignore
```

### Senhas Fortes

- Mínimo 8 caracteres
- Deve conter maiúsculas, minúsculas e números
- Exemplo: `Senha123` ✅ ou `MyP@ssw0rd` ✅

### Tokens JWT

- Expiram em 7 dias por padrão
- Armazenados no `localStorage` do frontend
- Enviados no header `Authorization: Bearer <token>`

### Uploads de Arquivo

- Validação de tipo MIME
- Limite de tamanho (5MB padrão)
- Armazenados fora da raiz do servidor
- Nomes sanitizados para evitar path traversal

---

## Checklist de Segurança para Produção

- [ ] Configurar variáveis de ambiente seguras
- [ ] Gerar JWT_SECRET aleatório
- [ ] Configurar HTTPS com certificado SSL/TLS
- [ ] Configurar CORS com domínio específico
- [ ] Habilitar Strict-Transport-Security
- [ ] Configurar backups automáticos do banco
- [ ] Implementar logging e monitoramento
- [ ] Configurar firewall e WAF
- [ ] Fazer testes de segurança (penetration testing)
- [ ] Implementar autenticação 2FA (futuro)
- [ ] Configurar rate limiting mais restritivo se necessário
- [ ] Manter dependências atualizadas

---

## Vulnerabilidades Conhecidas e Mitigações

### SQL Injection
- ✅ **Mitigação**: Uso de prepared statements em todas as queries
- ✅ **Validação**: Validação de entrada com express-validator

### XSS (Cross-Site Scripting)
- ✅ **Mitigação**: Sanitização de entrada
- ✅ **Headers**: Content-Security-Policy habilitado
- ✅ **Frontend**: React escapa automaticamente

### CSRF (Cross-Site Request Forgery)
- ✅ **Mitigação**: SameSite cookies (configurar em produção)
- ✅ **CORS**: Restrito a origem específica

### Brute Force
- ✅ **Mitigação**: Rate limiting de login
- ✅ **Implementação**: 5 tentativas por 15 minutos

### Exposição de Dados Sensíveis
- ✅ **Mitigação**: Sem logs de senha
- ✅ **Sanitização**: Sem exposição de detalhes internos em produção
- ✅ **HTTPS**: Força HTTPS em produção

---

## Monitoramento de Segurança

### Logs Importantes
- Tentativas de login falhadas
- Acessos negados
- Erros de validação
- Uploads de arquivo
- Alterações de dados críticos

### Alertas Recomendados
- Múltiplas tentativas de login falhadas
- Taxa alta de erros 400/401/403
- Uploads anormais
- Picos de requisições

---

## Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

## Contato de Segurança

Se encontrar uma vulnerabilidade, por favor reporte de forma responsável.

**Última atualização**: 01/03/2026
