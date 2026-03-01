const express = require('express');
const { pool } = require('../config/database');
const { auth, checkTipo, checkContaAprovada } = require('../middleware/auth');

const router = express.Router();

// Dashboard da conta (permite acesso mesmo sem aprovação, mas mostra status)
router.get('/conta', auth, checkTipo('conta'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const conta_id = req.user.id;

    // Buscar conta
    const [contas] = await connection.execute(
      `SELECT c.*, p.nome as plano_nome, p.quantidade_anuncios as plano_anuncios
       FROM contas c
       LEFT JOIN planos p ON c.plano_id = p.id
       WHERE c.id = ?`,
      [conta_id]
    );

    if (contas.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    const conta = contas[0];

    // Total de materiais
    const [totalMateriais] = await connection.execute(
      'SELECT COUNT(*) as total FROM materiais WHERE conta_id = ?',
      [conta.id]
    );

    // Materiais ativos
    const [materiaisAtivos] = await connection.execute(
      'SELECT COUNT(*) as total FROM materiais WHERE conta_id = ? AND ativo = TRUE',
      [conta.id]
    );

    // Total de visualizações
    const [totalVisualizacoes] = await connection.execute(
      'SELECT SUM(visualizacoes) as total FROM materiais WHERE conta_id = ?',
      [conta.id]
    );

    // Total de contatos
    const [totalContatos] = await connection.execute(
      'SELECT COUNT(*) as total FROM contatos WHERE conta_id = ?',
      [conta.id]
    );

    // Contatos não respondidos
    const [contatosPendentes] = await connection.execute(
      'SELECT COUNT(*) as total FROM contatos WHERE conta_id = ? AND respondido = FALSE',
      [conta.id]
    );

    // Materiais mais visualizados
    const [materiaisMaisVistos] = await connection.execute(
      `SELECT m.id, m.nome, m.visualizacoes, tm.nome as tipo_material,
              (SELECT caminho FROM fotos_materiais WHERE material_id = m.id AND principal = TRUE LIMIT 1) as foto_principal
       FROM materiais m
       INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
       WHERE m.conta_id = ?
       ORDER BY m.visualizacoes DESC
       LIMIT 5`,
      [conta.id]
    );

    // Contatos recentes
    const [contatosRecentes] = await connection.execute(
      `SELECT c.*, m.nome as material_nome
       FROM contatos c
       INNER JOIN materiais m ON c.material_id = m.id
       WHERE c.conta_id = ?
       ORDER BY c.data_contato DESC
       LIMIT 10`,
      [conta.id]
    );

    res.json({
      conta,
      aprovada: conta.aprovada, // Informar status de aprovação
      estatisticas: {
        total_materiais: totalMateriais[0]?.total || 0,
        materiais_ativos: materiaisAtivos[0]?.total || 0,
        total_visualizacoes: totalVisualizacoes[0]?.total || 0,
        total_contatos: totalContatos[0]?.total || 0,
        contatos_pendentes: contatosPendentes[0]?.total || 0,
        anuncios_disponiveis: conta.anuncios_disponiveis || 0,
        anuncios_utilizados: conta.anuncios_utilizados || 0
      },
      materiais_mais_vistos: materiaisMaisVistos || [],
      contatos_recentes: contatosRecentes || []
    });

  } catch (error) {
    console.error('Erro ao buscar dashboard da conta:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar dashboard',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

// Dashboard administrativo
router.get('/admin', auth, checkTipo('administrador'), async (req, res) => {
  console.log('Dashboard admin - Rota acessada');
  console.log('Dashboard admin - req.user:', req.user);
  
  const connection = await pool.getConnection();
  
  try {
    console.log('Dashboard admin - Iniciando busca de estatísticas');
    
    // Total de usuários (consumidores)
    const [totalUsuarios] = await connection.execute(
      'SELECT COUNT(*) as total FROM usuarios'
    );
    console.log('Total usuários:', totalUsuarios[0]?.total);

    // Usuários por tipo de consumidor (pode não ter tipo_consumidor ainda)
    let usuariosPorTipo = [];
    try {
      const [result] = await connection.execute(
        'SELECT tipo_consumidor, COUNT(*) as total FROM usuarios GROUP BY tipo_consumidor'
      );
      usuariosPorTipo = result;
    } catch (err) {
      console.log('Aviso: tipo_consumidor pode não existir na tabela usuarios:', err.message);
    }

    // Total de contas (empresas)
    const [totalContas] = await connection.execute(
      'SELECT COUNT(*) as total FROM contas'
    );
    console.log('Total contas:', totalContas[0]?.total);

    // Contas pendentes de aprovação
    const [contasPendentes] = await connection.execute(
      'SELECT COUNT(*) as total FROM contas WHERE aprovada = FALSE OR aprovada = 0'
    );
    console.log('Contas pendentes:', contasPendentes[0]?.total);

    // Total de materiais
    const [totalMateriais] = await connection.execute(
      'SELECT COUNT(*) as total FROM materiais'
    );
    console.log('Total materiais:', totalMateriais[0]?.total);

    // Materiais pendentes de aprovação
    const [materiaisPendentes] = await connection.execute(
      'SELECT COUNT(*) as total FROM materiais WHERE aprovado = FALSE OR aprovado = 0'
    );
    console.log('Materiais pendentes:', materiaisPendentes[0]?.total);

    // Total de contatos
    const [totalContatos] = await connection.execute(
      'SELECT COUNT(*) as total FROM contatos'
    );
    console.log('Total contatos:', totalContatos[0]?.total);

    // Materiais por tipo
    let materiaisPorTipo = [];
    try {
      const [result] = await connection.execute(
        `SELECT tm.nome, COUNT(m.id) as total
         FROM tipos_material tm
         LEFT JOIN materiais m ON tm.id = m.tipo_material_id
         GROUP BY tm.id, tm.nome`
      );
      materiaisPorTipo = result;
    } catch (err) {
      console.log('Aviso: Erro ao buscar materiais por tipo:', err.message);
    }

    // Contas recém cadastradas
    const [contasRecentes] = await connection.execute(
      `SELECT c.id, c.nome_fantasia, c.cidade, c.estado, c.aprovada, c.data_cadastro,
              c.email, c.cnpj
       FROM contas c
       ORDER BY c.data_cadastro DESC
       LIMIT 10`
    );

    const response = {
      estatisticas: {
        total_usuarios: totalUsuarios[0]?.total || 0,
        total_contas: totalContas[0]?.total || 0,
        contas_pendentes: contasPendentes[0]?.total || 0,
        total_materiais: totalMateriais[0]?.total || 0,
        materiais_pendentes: materiaisPendentes[0]?.total || 0,
        total_contatos: totalContatos[0]?.total || 0
      },
      usuarios_por_tipo: usuariosPorTipo,
      materiais_por_tipo: materiaisPorTipo,
      contas_recentes: contasRecentes
    };

    console.log('Dashboard admin - Resposta preparada:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('Erro ao buscar dashboard administrativo:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar dashboard',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    connection.release();
  }
});

module.exports = router;



