const express = require('express');
const { pool } = require('../config/database');
const { auth, checkTipo, checkRole } = require('../middleware/auth');

const router = express.Router();

// Listar todos os planos (público)
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [planos] = await connection.execute(
      'SELECT id, nome, descricao, quantidade_anuncios, quantidade_fotos, permite_video, valor_mensal, ativo, ordem FROM planos WHERE ativo = TRUE ORDER BY ordem, quantidade_anuncios'
    );

    res.json(planos);

  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({ error: 'Erro ao listar planos' });
  } finally {
    connection.release();
  }
});

// Buscar plano por ID (público)
router.get('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [planos] = await connection.execute(
      'SELECT * FROM planos WHERE id = ?',
      [req.params.id]
    );

    if (planos.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    res.json(planos[0]);

  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    res.status(500).json({ error: 'Erro ao buscar plano' });
  } finally {
    connection.release();
  }
});

// Criar novo plano (apenas admin)
router.post('/', auth, checkTipo('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nome, descricao, quantidade_anuncios, quantidade_fotos, permite_video, valor_mensal, destaque, ordem } = req.body;

    if (!nome || !quantidade_anuncios || quantidade_fotos === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const [result] = await connection.execute(
      `INSERT INTO planos (nome, descricao, quantidade_anuncios, quantidade_fotos, permite_video, valor_mensal, destaque, ordem) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao, quantidade_anuncios, quantidade_fotos || 3, permite_video || false, valor_mensal || 0, destaque || false, ordem || 0]
    );

    res.status(201).json({
      message: 'Plano criado com sucesso',
      id: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ error: 'Erro ao criar plano' });
  } finally {
    connection.release();
  }
});

// Atualizar plano (apenas admin)
router.put('/:id', auth, checkTipo('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nome, descricao, quantidade_anuncios, quantidade_fotos, permite_video, valor_mensal, ativo, destaque, ordem } = req.body;
    const updates = [];
    const params = [];

    if (nome) {
      updates.push('nome = ?');
      params.push(nome);
    }

    if (descricao !== undefined) {
      updates.push('descricao = ?');
      params.push(descricao);
    }

    if (quantidade_anuncios) {
      updates.push('quantidade_anuncios = ?');
      params.push(quantidade_anuncios);
    }

    if (quantidade_fotos !== undefined) {
      updates.push('quantidade_fotos = ?');
      params.push(quantidade_fotos);
    }

    if (permite_video !== undefined) {
      updates.push('permite_video = ?');
      params.push(permite_video);
    }

    if (valor_mensal) {
      updates.push('valor_mensal = ?');
      params.push(valor_mensal);
    }

    if (ativo !== undefined) {
      updates.push('ativo = ?');
      params.push(ativo);
    }

    if (destaque !== undefined) {
      updates.push('destaque = ?');
      params.push(destaque);
    }

    if (ordem !== undefined) {
      updates.push('ordem = ?');
      params.push(ordem);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    params.push(req.params.id);

    await connection.execute(
      `UPDATE planos SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Plano atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ error: 'Erro ao atualizar plano' });
  } finally {
    connection.release();
  }
});

// Deletar plano (apenas admin)
router.delete('/:id', auth, checkTipo('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.execute('DELETE FROM planos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Plano deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar plano:', error);
    res.status(500).json({ error: 'Erro ao deletar plano' });
  } finally {
    connection.release();
  }
});

module.exports = router;



