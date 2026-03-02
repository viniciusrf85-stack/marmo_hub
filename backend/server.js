const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { errorHandler, asyncHandler } = require('./utils/errorHandler');
const { securityHeaders, sanitizeInput, validateContentType, customSecurityHeaders } = require('./middleware/security');
const { generalLimiter, loginLimiter, registroLimiter } = require('./middleware/rateLimiter');
const { cacheMiddleware, CACHE_TTL } = require('./middleware/cache');
const compressionMiddleware = require('./middleware/compression');
const { requestLogger } = require('./utils/logger');
const { auditSecurityEvent } = require('./middleware/audit');

// Importar rotas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const contasRoutes = require('./routes/contas');
const planosRoutes = require('./routes/planos');
const materiaisRoutes = require('./routes/materiais');
const tiposMateriaisRoutes = require('./routes/tipos-materiais');
const contatosRoutes = require('./routes/contatos');
const favoritosRoutes = require('./routes/favoritos');
const dashboardRoutes = require('./routes/dashboard');

// Rotas de agenciadores
const vendas_agenciadorRoutes = require('./routes/vendas_agenciador');
const parcelas_agenciadorRoutes = require('./routes/parcelas_agenciador');
const comissoes_agenciadorRoutes = require('./routes/comissoes_agenciador');
const clientes_agenciadorRoutes = require('./routes/clientes_agenciador');
const relatorios_agenciadorRoutes = require('./routes/relatorios_agenciador');
const agenciador_empresasRoutes = require('./routes/agenciador_empresas');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES DE SEGURANCA E PERFORMANCE
// ============================================

// Helmet para headers de seguranca
app.use(securityHeaders);

// Headers de seguranca customizados
app.use(customSecurityHeaders);

// Compressao de resposta (gzip)
app.use(compressionMiddleware);

// CORS com configuracao segura
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Validacao de Content-Type
app.use(validateContentType);

// Parsers JSON e URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitizacao de entrada
app.use(sanitizeInput);

// Logging de requisicoes
app.use(requestLogger);

// Auditoria de eventos de seguranca
app.use(auditSecurityEvent);

// Rate limiting geral
app.use(generalLimiter);

// Servir arquivos estaticos (uploads) com cache
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: false
}));

// ============================================
// ROTAS DE HEALTH CHECK
// ============================================

app.get('/', (req, res) => {
  res.json({ 
    message: 'OLX Pedra API - Sistema de Marketplace de Pedras Ornamentais',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', asyncHandler(async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}));

// ============================================
// ROTAS DA API
// ============================================

// Rotas de autenticacao com rate limiting especifico
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/registro-conta', registroLimiter);
app.use('/api/auth/registro-usuario', registroLimiter);
app.use('/api/auth', authRoutes);

// Demais rotas com cache
app.use('/api/planos', cacheMiddleware(CACHE_TTL.planos), planosRoutes);
app.use('/api/tipos-materiais', cacheMiddleware(CACHE_TTL.tipos_materiais), tiposMateriaisRoutes);
app.use('/api/materiais', cacheMiddleware(CACHE_TTL.materiais), materiaisRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/contas', contasRoutes);
app.use('/api/contatos', contatosRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rotas de agenciadores (vendas, parcelas, comissoes, clientes, relatorios)
app.use('/api/vendas-agenciador', vendas_agenciadorRoutes);
app.use('/api/parcelas-agenciador', parcelas_agenciadorRoutes);
app.use('/api/comissoes-agenciador', comissoes_agenciadorRoutes);
app.use('/api/clientes-agenciador', clientes_agenciadorRoutes);
app.use('/api/relatorios-agenciador', relatorios_agenciadorRoutes);
app.use('/api/agenciador-empresas', agenciador_empresasRoutes);

// ============================================
// TRATAMENTO DE ERROS
// ============================================

app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: {
      message: 'Rota nao encontrada',
      code: 404,
      path: req.path,
      method: req.method
    },
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('Servidor iniciara sem conexao com o banco de dados');
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('=================================================');
      console.log('  OLX PEDRA - Backend API');
      console.log('=================================================');
      console.log(`  OK Servidor rodando na porta: ${PORT}`);
      console.log(`  OK URL: http://localhost:${PORT}`);
      console.log(`  OK Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  OK Database: ${dbConnected ? 'Conectado' : 'Desconectado'}`);
      console.log(`  OK Seguranca: Helmet + Rate Limiting + Validacao`);
      console.log(`  OK Cache: Habilitado para planos, tipos e materiais`);
      console.log(`  OK Compressao: Gzip habilitado`);
      console.log(`  OK Logging: Estruturado com Winston`);
      console.log('=================================================');
      console.log('');
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
