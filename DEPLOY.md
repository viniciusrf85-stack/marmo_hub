# 🚀 Guia de Deploy e Produção

## Preparação para Deploy

### 1. Verificação de Segurança

Antes de fazer deploy, verifique:

```bash
# Verificar se .env está no .gitignore
grep ".env" .gitignore

# Verificar se não há credenciais no código
grep -r "password\|secret\|token" backend/routes/ backend/config/ | grep -v ".js"

# Verificar se todas as dependências estão atualizadas
npm audit
```

### 2. Variáveis de Ambiente

Criar arquivo `.env` em produção com:

```env
# Servidor
NODE_ENV=production
PORT=3001

# Banco de Dados
DB_HOST=seu-host-mysql.com
DB_PORT=3306
DB_USER=usuario_producao
DB_PASSWORD=senha_super_segura_aqui
DB_NAME=olx_pedra_prod

# JWT
JWT_SECRET=gerar_com_crypto.randomBytes(32).toString('hex')
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=https://seu-dominio.com

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 3. Gerar JWT_SECRET Seguro

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Build do Frontend

```bash
cd frontend
npm run build
# Isso gera a pasta dist/ com arquivos otimizados
```

## Deploy no Servidor

### Opção 1: Deploy Manual

#### 1. Conectar ao Servidor
```bash
ssh usuario@seu-servidor.com
cd /var/www/marmo_hub
```

#### 2. Clonar/Atualizar Repositório
```bash
# Primeira vez
git clone https://github.com/viniciusrf85-stack/marmo_hub.git .

# Atualizações
git pull origin main
```

#### 3. Instalar Dependências
```bash
cd backend
npm install --production
npm run build  # Se houver build script

cd ../frontend
npm install
npm run build
```

#### 4. Configurar Variáveis de Ambiente
```bash
cd backend
nano .env  # Editar com credenciais de produção
```

#### 5. Iniciar Servidor
```bash
# Opção 1: Node simples
npm start

# Opção 2: PM2 (recomendado)
npm install -g pm2
pm2 start server.js --name "marmo_hub"
pm2 save
pm2 startup
```

### Opção 2: Deploy com Docker

#### 1. Criar Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# Frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Setup final
WORKDIR /app/backend
COPY backend/ .
COPY --from=builder /app/frontend/dist ../frontend/dist

EXPOSE 3001

CMD ["npm", "start"]
```

#### 2. Build e Deploy
```bash
docker build -t marmo_hub:latest .
docker run -d -p 3001:3001 --env-file .env marmo_hub:latest
```

### Opção 3: Deploy com PM2

#### 1. Instalar PM2
```bash
npm install -g pm2
```

#### 2. Criar ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'marmo_hub',
    script: './server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

#### 3. Iniciar com PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Configuração de Nginx (Reverse Proxy)

### 1. Instalar Nginx
```bash
sudo apt-get install nginx
```

### 2. Configurar Nginx

Editar `/etc/nginx/sites-available/marmo_hub`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # Certificado SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Otimizações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Compressão
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_min_length 1000;

    # Proxy para backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Servir frontend
    location / {
        root /var/www/marmo_hub/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Cache de arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Habilitar Site
```bash
sudo ln -s /etc/nginx/sites-available/marmo_hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/TLS com Let's Encrypt

### 1. Instalar Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx
```

### 2. Gerar Certificado
```bash
sudo certbot certonly --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### 3. Renovação Automática
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoramento em Produção

### 1. Verificar Logs
```bash
# Logs da aplicação
tail -f /var/www/marmo_hub/backend/logs/app.log

# Logs de erro
tail -f /var/www/marmo_hub/backend/logs/error.log

# Logs de segurança
tail -f /var/www/marmo_hub/backend/logs/security.log

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. Monitorar Processo
```bash
# Com PM2
pm2 monit

# Com top
top -p $(pgrep -f "node server.js")

# Com htop
htop
```

### 3. Verificar Saúde
```bash
curl https://seu-dominio.com/health
```

## Backup e Recuperação

### 1. Backup do Banco de Dados
```bash
# Backup completo
mysqldump -u usuario -p olx_pedra > backup_$(date +%Y%m%d).sql

# Backup comprimido
mysqldump -u usuario -p olx_pedra | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 2. Backup Automático
```bash
# Criar script de backup
cat > /home/usuario/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/marmo_hub"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco
mysqldump -u root -p$DB_PASSWORD olx_pedra | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/marmo_hub/backend/uploads

# Manter apenas últimos 7 dias
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

# Tornar executável
chmod +x /home/usuario/backup.sh

# Adicionar ao crontab (diário às 2 da manhã)
crontab -e
# Adicionar: 0 2 * * * /home/usuario/backup.sh
```

### 3. Restaurar Backup
```bash
# Restaurar banco de dados
gunzip < backup_20260301.sql.gz | mysql -u root -p olx_pedra

# Restaurar uploads
tar -xzf uploads_20260301.tar.gz -C /var/www/marmo_hub/backend/
```

## Checklist de Deploy

- [ ] Verificar segurança (sem credenciais no código)
- [ ] Configurar variáveis de ambiente
- [ ] Gerar JWT_SECRET seguro
- [ ] Fazer build do frontend
- [ ] Instalar dependências de produção
- [ ] Testar localmente
- [ ] Configurar banco de dados em produção
- [ ] Aplicar índices ao banco
- [ ] Configurar Nginx como reverse proxy
- [ ] Configurar SSL/TLS com Let's Encrypt
- [ ] Testar HTTPS
- [ ] Configurar PM2 ou Docker
- [ ] Configurar backup automático
- [ ] Configurar monitoramento
- [ ] Configurar alertas
- [ ] Documentar processo de deploy
- [ ] Fazer primeiro deploy

## Troubleshooting

### Erro: "Cannot find module"
```bash
cd backend
npm install --production
```

### Erro: "Port already in use"
```bash
# Encontrar processo na porta
lsof -i :3001

# Matar processo
kill -9 <PID>
```

### Erro: "Database connection refused"
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar credenciais em .env
cat backend/.env | grep DB_
```

### Erro: "CORS error"
```bash
# Verificar FRONTEND_URL em .env
# Deve ser igual ao domínio do frontend
```

## Recursos Adicionais

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Docker Documentation](https://docs.docker.com/)

---

**Última atualização**: 01/03/2026
