// Script para testar conexão com o banco de dados
require('dotenv').config();
const mysql = require('mysql2/promise');

const cleanEnvValue = (value) => {
  if (!value) return '';
  return String(value).replace(/^["']|["']$/g, '').trim();
};

async function testConnection() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Teste de Conexão MySQL');
  console.log('═══════════════════════════════════════════════');
  console.log('');

  const config = {
    host: cleanEnvValue(process.env.DB_HOST) || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: cleanEnvValue(process.env.DB_USER) || 'root',
    password: cleanEnvValue(process.env.DB_PASSWORD) || '',
    database: cleanEnvValue(process.env.DB_NAME) || 'olx_pedra'
  };

  console.log('Configuração de conexão:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Password: ${'*'.repeat(config.password.length)} (${config.password.length} caracteres)`);
  console.log(`  Database: ${config.database}`);
  console.log('');

  try {
    console.log('Tentando conectar...');
    const connection = await mysql.createConnection(config);
    
    console.log('✓ Conexão estabelecida com sucesso!');
    console.log('');

    // Testar se o banco existe
    const [databases] = await connection.query(`SHOW DATABASES LIKE '${config.database}'`);
    if (databases.length > 0) {
      console.log(`✓ Banco de dados '${config.database}' existe`);
      
      // Conectar diretamente ao banco para verificar tabelas
      const dbConfig = { ...config };
      const dbConnection = await mysql.createConnection(dbConfig);
      
      const [tables] = await dbConnection.query('SHOW TABLES');
      await dbConnection.end();
      
      console.log(`✓ Banco possui ${tables.length} tabela(s)`);
      
      if (tables.length > 0) {
        console.log('');
        console.log('Tabelas encontradas:');
        for (const table of tables) {
          const tableName = Object.values(table)[0];
          console.log(`  - ${tableName}`);
        }
      }
    } else {
      console.log(`⚠ Banco de dados '${config.database}' não existe`);
      console.log('');
      console.log('Execute o seguinte comando para criar o banco:');
      console.log(`  mysql -u ${config.user} -p -e "CREATE DATABASE ${config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`);
      console.log('');
      console.log('Depois importe o schema:');
      console.log(`  mysql -u ${config.user} -p ${config.database} < database/schema.sql`);
    }

    await connection.end();
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  Teste concluído com sucesso!');
    console.log('═══════════════════════════════════════════════');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('✗ ERRO ao conectar:');
    console.error(`  ${error.message}`);
    console.error('');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('═══════════════════════════════════════════════');
      console.error('  Erro de Autenticação');
      console.error('═══════════════════════════════════════════════');
      console.error('');
      console.error('Possíveis causas:');
      console.error('  1. Senha incorreta');
      console.error('  2. Usuário não tem permissão');
      console.error('  3. Aspas no arquivo .env (remova as aspas da senha)');
      console.error('');
      console.error('Solução:');
      console.error('  - Abra backend/.env');
      console.error('  - Remova as aspas da linha DB_PASSWORD');
      console.error('  - Exemplo: DB_PASSWORD=Dominus#202!');
      console.error('  - (SEM aspas!)');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('MySQL não está rodando ou não está acessível na porta', config.port);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`Banco de dados '${config.database}' não existe`);
    }
    
    console.error('');
    process.exit(1);
  }
}

testConnection();

