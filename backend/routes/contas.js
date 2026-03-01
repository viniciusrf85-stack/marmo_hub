const express = require('express');
const { pool } = require('../config/database');
const { auth, checkTipo, checkContaAprovada } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Listar todas as contas (empresas)
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { ativa, aprovada, cidade, estado } = req.query;
    
    console.log('Listar contas - Query params:', { ativa, aprovada, cidade, estado });
    
    let query = `
      SELECT c.*, p.nome as plano_nome, p.quantidade_anuncios as plano_anuncios
      FROM contas c
      LEFT JOIN planos p ON c.plano_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (ativa !== undefined) {
      query += ' AND c.ativa = ?';
      params.push(ativa === 'true' || ativa === '1');
    }

    if (aprovada !== undefined) {
      query += ' AND c.aprovada = ?';
      // Converter string 'true'/'false', '1'/'0', ou boolean para boolean
      const aprovadaBool = aprovada === 'true' || aprovada === '1' || aprovada === true || aprovada === 1;
      params.push(aprovadaBool ? 1 : 0);
      console.log('Filtro aprovada:', { aprovada, aprovadaBool, valorFinal: aprovadaBool ? 1 : 0 });
    }

    if (cidade) {
      query += ' AND c.cidade LIKE ?';
      params.push(`%${cidade}%`);
    }

    if (estado) {
      query += ' AND c.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY c.data_cadastro DESC';

    console.log('Query SQL:', query);
    console.log('Params:', params);
    
    const [contas] = await connection.execute(query, params);
    console.log('Contas encontradas:', contas.length);
    
    res.json(contas);

  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({ error: 'Erro ao listar contas' });
  } finally {
    connection.release();
  }
});

// Buscar conta do usuário logado
router.get('/minha-conta', auth, checkTipo('conta'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [contas] = await connection.execute(
      `SELECT c.*, p.nome as plano_nome, p.quantidade_anuncios as plano_anuncios
       FROM contas c
       LEFT JOIN planos p ON c.plano_id = p.id
       WHERE c.id = ?`,
      [req.user.id]
    );

    if (contas.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    res.json(contas[0]);

  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ error: 'Erro ao buscar conta' });
  } finally {
    connection.release();
  }
});

// Atualizar conta
router.put('/:id', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Verificar permissão
    const [contas] = await connection.execute(
      'SELECT id FROM contas WHERE id = ?',
      [req.params.id]
    );

    if (contas.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    // Apenas a própria conta ou administrador pode editar
    if (req.user.tipo_entidade !== 'administrador' && contas[0].id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para editar esta conta' });
    }

    const {
      razao_social, nome_fantasia, inscricao_estadual,
      email_comercial, telefone_comercial, whatsapp, site,
      cep, logradouro, numero, complemento, bairro, cidade, estado,
      descricao
    } = req.body;

    const updates = [];
    const params = [];

    if (razao_social) { updates.push('razao_social = ?'); params.push(razao_social); }
    if (nome_fantasia) { updates.push('nome_fantasia = ?'); params.push(nome_fantasia); }
    if (inscricao_estadual) { updates.push('inscricao_estadual = ?'); params.push(inscricao_estadual); }
    if (email_comercial) { updates.push('email_comercial = ?'); params.push(email_comercial); }
    if (telefone_comercial) { updates.push('telefone_comercial = ?'); params.push(telefone_comercial); }
    if (whatsapp) { updates.push('whatsapp = ?'); params.push(whatsapp); }
    if (site) { updates.push('site = ?'); params.push(site); }
    if (cep) { updates.push('cep = ?'); params.push(cep); }
    if (logradouro) { updates.push('logradouro = ?'); params.push(logradouro); }
    if (numero) { updates.push('numero = ?'); params.push(numero); }
    if (complemento !== undefined) { updates.push('complemento = ?'); params.push(complemento); }
    if (bairro) { updates.push('bairro = ?'); params.push(bairro); }
    if (cidade) { updates.push('cidade = ?'); params.push(cidade); }
    if (estado) { updates.push('estado = ?'); params.push(estado); }
    if (descricao !== undefined) { updates.push('descricao = ?'); params.push(descricao); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    params.push(req.params.id);

    await connection.execute(
      `UPDATE contas SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Conta atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  } finally {
    connection.release();
  }
});

// Upload de logo
router.post('/:id/logo', auth, upload.single('logo'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Verificar permissão
    const [contas] = await connection.execute(
      'SELECT id FROM contas WHERE id = ?',
      [req.params.id]
    );

    if (contas.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    if (req.user.tipo_entidade !== 'administrador' && contas[0].id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const logoPath = `/uploads/contas/${req.file.filename}`;

    await connection.execute(
      'UPDATE contas SET logo = ? WHERE id = ?',
      [logoPath, req.params.id]
    );

    res.json({ 
      message: 'Logo atualizado com sucesso',
      logo: logoPath
    });

  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do logo' });
  } finally {
    connection.release();
  }
});

// Aprovar conta (apenas admin)
router.patch('/:id/aprovar', auth, checkTipo('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.execute(
      'UPDATE contas SET aprovada = TRUE WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Conta aprovada com sucesso' });

  } catch (error) {
    console.error('Erro ao aprovar conta:', error);
    res.status(500).json({ error: 'Erro ao aprovar conta' });
  } finally {
    connection.release();
  }
});

// Ativar/Desativar conta (apenas admin)
router.patch('/:id/status', auth, checkTipo('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { ativa } = req.body;

    if (ativa === undefined) {
      return res.status(400).json({ error: 'Campo ativa é obrigatório' });
    }

    await connection.execute(
      'UPDATE contas SET ativa = ? WHERE id = ?',
      [ativa, req.params.id]
    );

    res.json({ 
      message: `Conta ${ativa ? 'ativada' : 'desativada'} com sucesso` 
    });

  } catch (error) {
    console.error('Erro ao atualizar status da conta:', error);
    res.status(500).json({ error: 'Erro ao atualizar status da conta' });
  } finally {
    connection.release();
  }
});

// Buscar conta por ID
router.get('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [contas] = await connection.execute(
      `SELECT c.*, p.nome as plano_nome, p.quantidade_anuncios as plano_anuncios
       FROM contas c
       LEFT JOIN planos p ON c.plano_id = p.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (contas.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    res.json(contas[0]);

  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ error: 'Erro ao buscar conta' });
  } finally {
    connection.release();
  }
});

module.exports = router;
