/**
 * Script para aplicar índices ao banco de dados
 * Uso: node apply-indexes.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

const indexes = [
  // Contas
  'CREATE INDEX IF NOT EXISTS idx_contas_email ON contas(email)',
  'CREATE INDEX IF NOT EXISTS idx_contas_cnpj ON contas(cnpj)',
  'CREATE INDEX IF NOT EXISTS idx_contas_aprovada ON contas(aprovada)',
  'CREATE INDEX IF NOT EXISTS idx_contas_ativa ON contas(ativa)',
  'CREATE INDEX IF NOT EXISTS idx_contas_plano_id ON contas(plano_id)',
  'CREATE INDEX IF NOT EXISTS idx_contas_data_cadastro ON contas(data_cadastro)',
  'CREATE INDEX IF NOT EXISTS idx_contas_aprovada_ativa ON contas(aprovada, ativa)',
  
  // Usuarios
  'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)',
  'CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf)',
  'CREATE INDEX IF NOT EXISTS idx_usuarios_cnpj ON usuarios(cnpj)',
  'CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo)',
  'CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_consumidor ON usuarios(tipo_consumidor)',
  'CREATE INDEX IF NOT EXISTS idx_usuarios_data_cadastro ON usuarios(data_cadastro)',
  
  // Usuarios Administradores
  'CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email ON usuarios_administradores(email)',
  'CREATE INDEX IF NOT EXISTS idx_usuarios_admin_ativo ON usuarios_administradores(ativo)',
  
  // Materiais
  'CREATE INDEX IF NOT EXISTS idx_materiais_conta_id ON materiais(conta_id)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_tipo_material_id ON materiais(tipo_material_id)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_ativo ON materiais(ativo)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_aprovado ON materiais(aprovado)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_data_cadastro ON materiais(data_cadastro)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_ativo_aprovado ON materiais(ativo, aprovado)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_conta_ativo ON materiais(conta_id, ativo)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_valor_m2 ON materiais(valor_m2)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_promocao ON materiais(promocao)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_destaque ON materiais(destaque)',
  'CREATE INDEX IF NOT EXISTS idx_materiais_nome ON materiais(nome)',
  
  // Fotos Materiais
  'CREATE INDEX IF NOT EXISTS idx_fotos_material_id ON fotos_materiais(material_id)',
  'CREATE INDEX IF NOT EXISTS idx_fotos_principal ON fotos_materiais(principal)',
  
  // Contatos
  'CREATE INDEX IF NOT EXISTS idx_contatos_material_id ON contatos(material_id)',
  'CREATE INDEX IF NOT EXISTS idx_contatos_conta_id ON contatos(conta_id)',
  'CREATE INDEX IF NOT EXISTS idx_contatos_usuario_id ON contatos(usuario_id)',
  'CREATE INDEX IF NOT EXISTS idx_contatos_data_contato ON contatos(data_contato)',
  'CREATE INDEX IF NOT EXISTS idx_contatos_respondido ON contatos(respondido)',
  
  // Favoritos
  'CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_id ON favoritos(usuario_id)',
  'CREATE INDEX IF NOT EXISTS idx_favoritos_material_id ON favoritos(material_id)',
  'CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_material ON favoritos(usuario_id, material_id)',
  
  // Historico Planos
  'CREATE INDEX IF NOT EXISTS idx_historico_planos_conta_id ON historico_planos(conta_id)',
  'CREATE INDEX IF NOT EXISTS idx_historico_planos_plano_id ON historico_planos(plano_id)',
  'CREATE INDEX IF NOT EXISTS idx_historico_planos_data_mudanca ON historico_planos(data_mudanca)',
  
  // Planos
  'CREATE INDEX IF NOT EXISTS idx_planos_ativo ON planos(ativo)',
  
  // Tipos Material
  'CREATE INDEX IF NOT EXISTS idx_tipos_material_ativo ON tipos_material(ativo)'
];

async function applyIndexes() {
  let connection;
  
  try {
    console.log('Conectando ao banco de dados...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'olx_pedra'
    });
    
    console.log('Conectado com sucesso!');
    console.log(`Aplicando ${indexes.length} índices...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const index of indexes) {
      try {
        await connection.execute(index);
        console.log(`✓ ${index.substring(0, 60)}...`);
        successCount++;
      } catch (error) {
        console.log(`✗ Erro: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Índices aplicados com sucesso: ${successCount}`);
    console.log(`Erros: ${errorCount}`);
    console.log(`${'='.repeat(60)}`);
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
    process.exit(1);
  }
}

applyIndexes();
