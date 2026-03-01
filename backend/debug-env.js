// Script para debugar o que está sendo lido do .env
require('dotenv').config();

console.log('═══════════════════════════════════════════════');
console.log('  Debug - Variáveis do .env');
console.log('═══════════════════════════════════════════════');
console.log('');

console.log('DB_HOST:', JSON.stringify(process.env.DB_HOST));
console.log('DB_PORT:', JSON.stringify(process.env.DB_PORT));
console.log('DB_USER:', JSON.stringify(process.env.DB_USER));
console.log('DB_PASSWORD (raw):', JSON.stringify(process.env.DB_PASSWORD));
console.log('DB_PASSWORD (length):', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'undefined');
console.log('DB_NAME:', JSON.stringify(process.env.DB_NAME));
console.log('');

console.log('Caracteres da senha (hex):');
if (process.env.DB_PASSWORD) {
  for (let i = 0; i < process.env.DB_PASSWORD.length; i++) {
    const char = process.env.DB_PASSWORD[i];
    const code = char.charCodeAt(0);
    console.log(`  [${i}]: '${char}' (code: ${code}, hex: 0x${code.toString(16)})`);
  }
}

console.log('');
console.log('Após limpar (remover aspas):');
const cleanEnvValue = (value) => {
  if (!value) return '';
  return String(value).replace(/^["']|["']$/g, '').trim();
};

const cleanedPassword = cleanEnvValue(process.env.DB_PASSWORD);
console.log('DB_PASSWORD (cleaned):', JSON.stringify(cleanedPassword));
console.log('DB_PASSWORD (cleaned length):', cleanedPassword.length);

console.log('');

