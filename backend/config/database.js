const mysql = require('mysql2/promise');
require('dotenv').config();

// Função para limpar valores do .env (remove aspas e espaços)
const cleanEnvValue = (value) => {
  if (!value) return '';
  let cleaned = String(value);
  // Remove aspas simples e duplas do início e fim (mas preserva conteúdo)
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();
  return cleaned;
};

// Configuração do pool de conexões
const pool = mysql.createPool({
  host: cleanEnvValue(process.env.DB_HOST) || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: cleanEnvValue(process.env.DB_USER) || 'root',
  password: cleanEnvValue(process.env.DB_PASSWORD) || 'Dominus#202!',
  database: cleanEnvValue(process.env.DB_NAME) || 'olx_pedra',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Não quebrar se não conseguir conectar imediatamente
  acquireTimeout: 60000,
  timeout: 60000
});

// Handler de erros do pool
pool.on('error', (err) => {
  console.error('Erro no pool de conexões MySQL:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Conexão MySQL foi perdida. Tentando reconectar...');
  }
});

// Testar conexão
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Conexão com MySQL estabelecida com sucesso');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Erro ao conectar ao MySQL:', error.message);
    
    // Mensagens de ajuda mais detalhadas
    if (error.message.includes('Access denied')) {
      console.error('');
      console.error('  ⚠ DICA: Erro de autenticação!');
      console.error('     Verifique no arquivo backend/.env:');
      console.error('     - DB_USER (usuário do MySQL)');
      console.error('     - DB_PASSWORD (senha do MySQL)');
      console.error('');
      console.error('     Execute: configurar-banco.bat para reconfigurar');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('  ⚠ DICA: MySQL não está rodando!');
      console.error('     Inicie o serviço MySQL antes de continuar.');
    } else if (error.message.includes('Unknown database')) {
      console.error('');
      console.error('  ⚠ DICA: Banco de dados não existe!');
      console.error('     Execute: configurar-banco.bat para criar o banco');
    }
    
    return false;
  }
};

module.exports = { pool, testConnection };



