// Script para resetar a senha do administrador
require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const cleanEnvValue = (value) => {
  if (!value) return '';
  return String(value).replace(/^["']|["']$/g, '').trim();
};

async function resetSenhaAdmin() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Reset de Senha do Administrador');
  console.log('═══════════════════════════════════════════════');
  console.log('');

  const config = {
    host: cleanEnvValue(process.env.DB_HOST) || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: cleanEnvValue(process.env.DB_USER) || 'root',
    password: cleanEnvValue(process.env.DB_PASSWORD) || '',
    database: cleanEnvValue(process.env.DB_NAME) || 'olx_pedra'
  };

  // Nova senha padrão
  const novaSenha = 'admin123';
  
  console.log('Configuração:');
  console.log(`  Email: admin@olxpedra.com`);
  console.log(`  Nova senha: ${novaSenha}`);
  console.log('');

  try {
    console.log('Conectando ao banco de dados...');
    const connection = await mysql.createConnection(config);
    
    console.log('✓ Conectado!');
    console.log('');

    // Verificar se o admin existe
    const [users] = await connection.query(
      "SELECT id, nome, email FROM usuarios WHERE email = 'admin@olxpedra.com' AND tipo_usuario = 'administrador'"
    );

    if (users.length === 0) {
      console.log('⚠ Usuário admin não encontrado!');
      console.log('Criando usuário administrador...');
      
      // Criar hash da senha
      const hashedPassword = await bcrypt.hash(novaSenha, 10);
      
      // Inserir admin
      await connection.query(
        `INSERT INTO usuarios (nome, email, senha, tipo_usuario, ativo) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Administrador', 'admin@olxpedra.com', hashedPassword, 'administrador', true]
      );
      
      console.log('✓ Usuário administrador criado com sucesso!');
    } else {
      console.log(`✓ Usuário encontrado: ${users[0].nome} (ID: ${users[0].id})`);
      console.log('Gerando novo hash da senha...');
      
      // Criar hash da nova senha
      const hashedPassword = await bcrypt.hash(novaSenha, 10);
      
      // Atualizar senha
      await connection.query(
        'UPDATE usuarios SET senha = ? WHERE email = ? AND tipo_usuario = ?',
        [hashedPassword, 'admin@olxpedra.com', 'administrador']
      );
      
      console.log('✓ Senha resetada com sucesso!');
    }

    await connection.end();
    
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  Credenciais de Acesso:');
    console.log('═══════════════════════════════════════════════');
    console.log('  Email: admin@olxpedra.com');
    console.log(`  Senha: ${novaSenha}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('✗ ERRO:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Executar
resetSenhaAdmin();

