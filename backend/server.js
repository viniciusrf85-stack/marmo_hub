const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const contasRoutes = require('./routes/contas'); // Nova rota (substitui empresas)
// const empresasRoutes = require('./routes/empresas'); // DEPRECADO - usar /api/contas
const planosRoutes = require('./routes/planos');
const materiaisRoutes = require('./routes/materiais');
const tiposMateriaisRoutes = require('./routes/tipos-materiais');
const contatosRoutes = require('./routes/contatos');
const favoritosRoutes = require('./routes/favoritos');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'OLX Pedra API - Sistema de Marketplace de Pedras Ornamentais',
    version: '1.0.0',
    status: 'online'
  });
});

// Rota de health check
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/contas', contasRoutes); // Nova rota
// app.use('/api/empresas', empresasRoutes); // DEPRECADO - usar /api/contas
app.use('/api/planos', planosRoutes);
app.use('/api/materiais', materiaisRoutes);
app.use('/api/tipos-materiais', tiposMateriaisRoutes);
app.use('/api/contatos', contatosRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠ Servidor iniciará sem conexão com o banco de dados');
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('  OLX PEDRA - Backend API');
      console.log('═══════════════════════════════════════════════');
      console.log(`  ✓ Servidor rodando na porta: ${PORT}`);
      console.log(`  ✓ URL: http://localhost:${PORT}`);
      console.log(`  ✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  ✓ Database: ${dbConnected ? 'Conectado' : 'Desconectado'}`);
      console.log('═══════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;



