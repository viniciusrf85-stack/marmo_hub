// Script para gerar hash bcrypt de senhas
const bcrypt = require('bcrypt');

async function gerarHash() {
  const senha = 'admin123';
  const hash = await bcrypt.hash(senha, 10);
  
  console.log('========================================');
  console.log('Hash bcrypt para senha:', senha);
  console.log('========================================');
  console.log(hash);
  console.log('========================================');
  console.log('\nUse este hash no banco de dados:');
  console.log(`INSERT INTO usuarios_administradores (nome, email, senha, ativo) VALUES`);
  console.log(`('Administrador', 'admin@marmohub.com.br', '${hash}', TRUE);`);
  console.log('========================================');
  
  // Verificar se o hash funciona
  const isValid = await bcrypt.compare(senha, hash);
  console.log('\nVerificação:', isValid ? '✓ Hash válido' : '✗ Hash inválido');
}

gerarHash().catch(console.error);
