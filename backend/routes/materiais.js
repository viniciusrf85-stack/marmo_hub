const express = require('express');
const { pool } = require('../config/database');
const { auth, checkTipo, checkContaAprovada } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Listar materiais com filtros (público)
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { 
      tipo_material_id, conta_id, cor_predominante, acabamento,
      preco_min, preco_max, promocao, destaque, 
      busca, cidade, estado, limit = 50, offset = 0 
    } = req.query;
    
    // Query usando conta_id (estrutura migrada)
    // Retorna vazio se não houver materiais, sem erro
    let query = `
      SELECT m.*, tm.nome as tipo_material, c.nome_fantasia as empresa_nome,
             c.cidade as empresa_cidade, c.estado as empresa_estado,
             c.telefone_comercial, c.whatsapp, c.logo as empresa_logo,
             (SELECT caminho FROM fotos_materiais WHERE material_id = m.id AND principal = TRUE LIMIT 1) as foto_principal
      FROM materiais m
      INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
      INNER JOIN contas c ON m.conta_id = c.id
      WHERE m.ativo = TRUE AND m.aprovado = TRUE AND c.ativa = TRUE AND c.aprovada = TRUE
    `;
    const params = [];

    if (tipo_material_id) {
      query += ' AND m.tipo_material_id = ?';
      params.push(tipo_material_id);
    }

    if (conta_id) {
      query += ' AND m.conta_id = ?';
      params.push(conta_id);
    }

    if (cor_predominante) {
      query += ' AND m.cor_predominante LIKE ?';
      params.push(`%${cor_predominante}%`);
    }

    if (acabamento) {
      query += ' AND m.acabamento = ?';
      params.push(acabamento);
    }

    if (preco_min) {
      query += ' AND m.valor_m2 >= ?';
      params.push(preco_min);
    }

    if (preco_max) {
      query += ' AND m.valor_m2 <= ?';
      params.push(preco_max);
    }

    if (promocao === 'true') {
      query += ' AND m.promocao = TRUE';
    }

    if (destaque === 'true') {
      query += ' AND m.destaque = TRUE';
    }

    if (busca) {
      query += ' AND (m.nome LIKE ? OR m.descricao LIKE ? OR tm.nome LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
    }

    if (cidade) {
      query += ' AND c.cidade LIKE ?';
      params.push(`%${cidade}%`);
    }

    if (estado) {
      query += ' AND c.estado = ?';
      params.push(estado);
    }

    query += ' ORDER BY m.destaque DESC, m.data_cadastro DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [materiais] = await connection.execute(query, params);
    
    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM materiais m
      INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
      INNER JOIN contas c ON m.conta_id = c.id
      WHERE m.ativo = TRUE AND m.aprovado = TRUE AND c.ativa = TRUE AND c.aprovada = TRUE
    `;
    const countParams = [];
    
    if (tipo_material_id) {
      countQuery += ' AND m.tipo_material_id = ?';
      countParams.push(tipo_material_id);
    }
    if (conta_id) {
      countQuery += ' AND m.conta_id = ?';
      countParams.push(conta_id);
    }
    if (busca) {
      countQuery += ' AND (m.nome LIKE ? OR m.descricao LIKE ? OR tm.nome LIKE ?)';
      countParams.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
    }

    const [countResult] = await connection.execute(countQuery, countParams);

    res.json({
      materiais: materiais || [],
      total: countResult[0]?.total || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Erro ao listar materiais:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao listar materiais',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

// Buscar material por ID com todas as fotos
router.get('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Incrementar visualizações
    await connection.execute(
      'UPDATE materiais SET visualizacoes = visualizacoes + 1 WHERE id = ?',
      [req.params.id]
    );

    const [materiais] = await connection.execute(
      `SELECT m.*, tm.nome as tipo_material, c.nome_fantasia as empresa_nome,
              c.id as conta_id, c.cidade as empresa_cidade, c.estado as empresa_estado,
              c.telefone_comercial, c.whatsapp, c.email_comercial, c.site,
              c.logo as empresa_logo, c.descricao as empresa_descricao
       FROM materiais m
       INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
       INNER JOIN contas c ON m.conta_id = c.id
       WHERE m.id = ?`,
      [req.params.id]
    );

    if (materiais.length === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    // Buscar fotos
    const [fotos] = await connection.execute(
      'SELECT * FROM fotos_materiais WHERE material_id = ? ORDER BY principal DESC, ordem',
      [req.params.id]
    );

    const material = materiais[0];
    material.fotos = fotos;

    res.json(material);

  } catch (error) {
    console.error('Erro ao buscar material:', error);
    res.status(500).json({ error: 'Erro ao buscar material' });
  } finally {
    connection.release();
  }
});

// Listar materiais da conta do usuário logado
router.get('/conta/meus-materiais', auth, checkTipo('conta'), checkContaAprovada, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const conta_id = req.user.id;

    const [materiais] = await connection.execute(
      `SELECT m.*, tm.nome as tipo_material,
              (SELECT caminho FROM fotos_materiais WHERE material_id = m.id AND principal = TRUE LIMIT 1) as foto_principal
       FROM materiais m
       INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
       WHERE m.conta_id = ?
       ORDER BY m.data_cadastro DESC`,
      [conta_id]
    );

    res.json(materiais);

  } catch (error) {
    console.error('Erro ao listar materiais da conta:', error);
    res.status(500).json({ error: 'Erro ao listar materiais' });
  } finally {
    connection.release();
  }
});

// Criar material
router.post('/', auth, checkTipo('conta', 'administrador'), checkContaAprovada, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Buscar conta do usuário
    const conta_id = req.user.tipo_entidade === 'administrador' 
      ? req.body.conta_id || req.user.id
      : req.user.id;

    const [contas] = await connection.execute(
      'SELECT id, anuncios_disponiveis, anuncios_utilizados FROM contas WHERE id = ?',
      [conta_id]
    );

    if (contas.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    const conta = contas[0];

    // Verificar se tem anúncios disponíveis
    if (conta.anuncios_utilizados >= conta.anuncios_disponiveis) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Limite de anúncios atingido. Faça upgrade do seu plano.' 
      });
    }

    const {
      tipo_material_id, nome, descricao, cor_predominante, origem, acabamento,
      espessura_cm, largura_cm, comprimento_cm,
      valor_m2, valor_chapa, quantidade_chapas, quantidade_m2
    } = req.body;

    // Validações
    if (!tipo_material_id || !nome) {
      await connection.rollback();
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const [result] = await connection.execute(
      `INSERT INTO materiais (
        conta_id, tipo_material_id, nome, descricao, cor_predominante, origem, acabamento,
        espessura_cm, largura_cm, comprimento_cm,
        valor_m2, valor_chapa, quantidade_chapas, quantidade_m2,
        aprovado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        conta.id, tipo_material_id, nome, descricao, cor_predominante, origem, acabamento,
        espessura_cm, largura_cm, comprimento_cm,
        valor_m2, valor_chapa, quantidade_chapas, quantidade_m2,
        req.user.tipo_entidade === 'administrador' ? true : false
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Material cadastrado com sucesso',
      id: result.insertId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar material:', error);
    res.status(500).json({ error: 'Erro ao criar material' });
  } finally {
    connection.release();
  }
});

// Upload de fotos do material
router.post('/:id/fotos', auth, checkTipo('conta', 'administrador'), upload.array('fotos', 4), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Verificar se material pertence à conta do usuário
    const [materiais] = await connection.execute(
      `SELECT m.conta_id 
       FROM materiais m
       WHERE m.id = ?`,
      [req.params.id]
    );

    if (materiais.length === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    if (req.user.tipo_entidade !== 'administrador' && materiais[0].conta_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Verificar quantas fotos já existem
    const [fotosExistentes] = await connection.execute(
      'SELECT COUNT(*) as total FROM fotos_materiais WHERE material_id = ?',
      [req.params.id]
    );

    const totalFotos = fotosExistentes[0].total + req.files.length;
    
    if (totalFotos > 4) {
      return res.status(400).json({ 
        error: 'Limite máximo de 4 fotos por material (1 principal + 3 adicionais)' 
      });
    }

    // Inserir fotos
    const fotos = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fotoPath = `/uploads/materiais/${file.filename}`;
      const principal = fotosExistentes[0].total === 0 && i === 0; // Primeira foto é principal

      const [result] = await connection.execute(
        'INSERT INTO fotos_materiais (material_id, caminho, principal, ordem) VALUES (?, ?, ?, ?)',
        [req.params.id, fotoPath, principal, i]
      );

      fotos.push({
        id: result.insertId,
        caminho: fotoPath,
        principal,
        ordem: i
      });
    }

    res.json({ 
      message: 'Fotos enviadas com sucesso',
      fotos
    });

  } catch (error) {
    console.error('Erro ao fazer upload das fotos:', error);
    res.status(500).json({ error: 'Erro ao fazer upload das fotos' });
  } finally {
    connection.release();
  }
});

// Deletar foto
router.delete('/:id/fotos/:foto_id', auth, checkTipo('conta', 'administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Verificar permissão
    const [materiais] = await connection.execute(
      `SELECT m.conta_id 
       FROM materiais m
       WHERE m.id = ?`,
      [req.params.id]
    );

    if (materiais.length === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    if (req.user.tipo_entidade !== 'administrador' && materiais[0].conta_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    await connection.execute(
      'DELETE FROM fotos_materiais WHERE id = ? AND material_id = ?',
      [req.params.foto_id, req.params.id]
    );

    res.json({ message: 'Foto deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    res.status(500).json({ error: 'Erro ao deletar foto' });
  } finally {
    connection.release();
  }
});

// Atualizar material
router.put('/:id', auth, checkTipo('conta', 'administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Verificar permissão
    const [materiais] = await connection.execute(
      `SELECT m.conta_id 
       FROM materiais m
       WHERE m.id = ?`,
      [req.params.id]
    );

    if (materiais.length === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    if (req.user.tipo_entidade !== 'administrador' && materiais[0].conta_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const {
      tipo_material_id, nome, descricao, cor_predominante, origem, acabamento,
      espessura_cm, largura_cm, comprimento_cm,
      valor_m2, valor_chapa, quantidade_chapas, quantidade_m2,
      promocao, valor_promocional, ativo
    } = req.body;

    const updates = [];
    const params = [];

    if (tipo_material_id) { updates.push('tipo_material_id = ?'); params.push(tipo_material_id); }
    if (nome) { updates.push('nome = ?'); params.push(nome); }
    if (descricao !== undefined) { updates.push('descricao = ?'); params.push(descricao); }
    if (cor_predominante) { updates.push('cor_predominante = ?'); params.push(cor_predominante); }
    if (origem) { updates.push('origem = ?'); params.push(origem); }
    if (acabamento) { updates.push('acabamento = ?'); params.push(acabamento); }
    if (espessura_cm) { updates.push('espessura_cm = ?'); params.push(espessura_cm); }
    if (largura_cm) { updates.push('largura_cm = ?'); params.push(largura_cm); }
    if (comprimento_cm) { updates.push('comprimento_cm = ?'); params.push(comprimento_cm); }
    if (valor_m2) { updates.push('valor_m2 = ?'); params.push(valor_m2); }
    if (valor_chapa) { updates.push('valor_chapa = ?'); params.push(valor_chapa); }
    if (quantidade_chapas !== undefined) { updates.push('quantidade_chapas = ?'); params.push(quantidade_chapas); }
    if (quantidade_m2 !== undefined) { updates.push('quantidade_m2 = ?'); params.push(quantidade_m2); }
    if (promocao !== undefined) { updates.push('promocao = ?'); params.push(promocao); }
    if (valor_promocional !== undefined) { updates.push('valor_promocional = ?'); params.push(valor_promocional); }
    if (ativo !== undefined) { updates.push('ativo = ?'); params.push(ativo); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    params.push(req.params.id);

    await connection.execute(
      `UPDATE materiais SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Material atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    res.status(500).json({ error: 'Erro ao atualizar material' });
  } finally {
    connection.release();
  }
});

// Deletar material
router.delete('/:id', auth, checkTipo('conta', 'administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Verificar permissão
    const [materiais] = await connection.execute(
      `SELECT m.conta_id 
       FROM materiais m
       WHERE m.id = ?`,
      [req.params.id]
    );

    if (materiais.length === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    if (req.user.tipo_entidade !== 'administrador' && materiais[0].conta_id !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    await connection.execute('DELETE FROM materiais WHERE id = ?', [req.params.id]);
    res.json({ message: 'Material deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar material:', error);
    res.status(500).json({ error: 'Erro ao deletar material' });
  } finally {
    connection.release();
  }
});

module.exports = router;



