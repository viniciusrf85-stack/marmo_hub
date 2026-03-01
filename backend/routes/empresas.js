const express = require('express');
const { pool } = require('../config/database');
const { auth, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Listar todas as empresas
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { ativa, aprovada, cidade, estado } = req.query;
    
    let query = `
      SELECT e.*, p.nome as plano_nome, p.quantidade_anuncios as plano_anuncios,
             u.nome as responsavel_nome, u.email as responsavel_email
      FROM empresas e
      LEFT JOIN planos p ON e.plano_id = p.id
      LEFT JOIN usuarios u ON e.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (ativa !== undefined) {
      query += ' AND e.ativa = ?';
      params.push(ativa === 'true' || ativa === '1');
    }

    if (aprovada !== undefined) {
      query += ' AND e.aprovada = ?';
      params.push(aprovada === 'true' || aprovada === '1');
    }

    if (cidade) {
      query += ' AND e.cidade LIKE ?';
      params.push(`%${cidade}%`);
    }

    if (estado) {
      query += ' AND e.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY e.data_cadastro DESC';

    const [empresas] = await connection.execute(query, params);
    res.json(empresas);

  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao listar empresas' });
  } finally {
    connection.release();
  }
});

// Buscar empresa do usuário logado
router.get('/minha-empresa', auth, checkRole('empresa'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [empresas] = await connection.execute(
      `SELECT e.*, p.nome as plano_nome, p.quantidade_anuncios as plano_anuncios
       FROM empresas e
       LEFT JOIN planos p ON e.plano_id = p.id
       WHERE e.usuario_id = ?`,
      [req.user.id]
    );

    if (empresas.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(empresas[0]);

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  } finally {
    connection.release();
  }
});

// Criar empresa
router.post('/', auth, checkRole('empresa', 'administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      razao_social, nome_fantasia, cnpj, inscricao_estadual,
      email_comercial, telefone_comercial, whatsapp, site,
      cep, logradouro, numero, complemento, bairro, cidade, estado,
      plano_id, descricao
    } = req.body;

    // Validações básicas
    if (!razao_social || !nome_fantasia || !cnpj) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Verificar se CNPJ já existe
    const [existing] = await connection.execute(
      'SELECT id FROM empresas WHERE cnpj = ?',
      [cnpj]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }

    // Verificar se usuário já tem empresa
    const usuario_id = req.user.tipo_usuario === 'administrador' 
      ? req.body.usuario_id 
      : req.user.id;

    const [existingEmpresa] = await connection.execute(
      'SELECT id FROM empresas WHERE usuario_id = ?',
      [usuario_id]
    );

    if (existingEmpresa.length > 0) {
      return res.status(400).json({ error: 'Usuário já possui uma empresa cadastrada' });
    }

    // Buscar quantidade de anúncios do plano
    let anuncios_disponiveis = 0;
    if (plano_id) {
      const [planos] = await connection.execute(
        'SELECT quantidade_anuncios FROM planos WHERE id = ?',
        [plano_id]
      );
      if (planos.length > 0) {
        anuncios_disponiveis = planos[0].quantidade_anuncios;
      }
    }

    const [result] = await connection.execute(
      `INSERT INTO empresas (
        usuario_id, plano_id, razao_social, nome_fantasia, cnpj, inscricao_estadual,
        email_comercial, telefone_comercial, whatsapp, site,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        descricao, anuncios_disponiveis, aprovada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id, plano_id, razao_social, nome_fantasia, cnpj, inscricao_estadual,
        email_comercial, telefone_comercial, whatsapp, site,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        descricao, anuncios_disponiveis,
        req.user.tipo_usuario === 'administrador' ? true : false
      ]
    );

    res.status(201).json({
      message: 'Empresa cadastrada com sucesso',
      id: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa' });
  } finally {
    connection.release();
  }
});

// Atualizar empresa
router.put('/:id', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Verificar permissão
    const [empresas] = await connection.execute(
      'SELECT usuario_id FROM empresas WHERE id = ?',
      [req.params.id]
    );

    if (empresas.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    if (req.user.tipo_usuario !== 'administrador' && empresas[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para editar esta empresa' });
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
      `UPDATE empresas SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Empresa atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  } finally {
    connection.release();
  }
});

// Upload de logo
router.post('/:id/logo', auth, upload.single('logo'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Verificar permissão
    const [empresas] = await connection.execute(
      'SELECT usuario_id FROM empresas WHERE id = ?',
      [req.params.id]
    );

    if (empresas.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    if (req.user.tipo_usuario !== 'administrador' && empresas[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const logoPath = `/uploads/empresas/${req.file.filename}`;

    await connection.execute(
      'UPDATE empresas SET logo = ? WHERE id = ?',
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

// Aprovar empresa (apenas admin)
router.patch('/:id/aprovar', auth, checkRole('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.execute(
      'UPDATE empresas SET aprovada = TRUE WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Empresa aprovada com sucesso' });

  } catch (error) {
    console.error('Erro ao aprovar empresa:', error);
    res.status(500).json({ error: 'Erro ao aprovar empresa' });
  } finally {
    connection.release();
  }
});

// Buscar empresa por ID
router.get('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [empresas] = await connection.execute(
      `SELECT e.*, p.nome as plano_nome, p.quantidade_anuncios as plano_anuncios
       FROM empresas e
       LEFT JOIN planos p ON e.plano_id = p.id
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (empresas.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(empresas[0]);

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  } finally {
    connection.release();
  }
});

module.exports = router;



