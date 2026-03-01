const express = require('express');
const { pool } = require('../config/database');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Listar todos os tipos de materiais (público)
router.get('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [tipos] = await connection.execute(
      'SELECT * FROM tipos_material WHERE ativo = TRUE ORDER BY nome'
    );

    res.json(tipos);

  } catch (error) {
    console.error('Erro ao listar tipos de materiais:', error);
    res.status(500).json({ error: 'Erro ao listar tipos de materiais' });
  } finally {
    connection.release();
  }
});

// Buscar tipo por ID (público)
router.get('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [tipos] = await connection.execute(
      'SELECT * FROM tipos_material WHERE id = ?',
      [req.params.id]
    );

    if (tipos.length === 0) {
      return res.status(404).json({ error: 'Tipo de material não encontrado' });
    }

    res.json(tipos[0]);

  } catch (error) {
    console.error('Erro ao buscar tipo de material:', error);
    res.status(500).json({ error: 'Erro ao buscar tipo de material' });
  } finally {
    connection.release();
  }
});

// Criar novo tipo (apenas admin)
router.post('/', auth, checkRole('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const [result] = await connection.execute(
      'INSERT INTO tipos_material (nome, descricao) VALUES (?, ?)',
      [nome, descricao]
    );

    res.status(201).json({
      message: 'Tipo de material criado com sucesso',
      id: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar tipo de material:', error);
    res.status(500).json({ error: 'Erro ao criar tipo de material' });
  } finally {
    connection.release();
  }
});

// Atualizar tipo (apenas admin)
router.put('/:id', auth, checkRole('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nome, descricao, ativo } = req.body;
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

    if (ativo !== undefined) {
      updates.push('ativo = ?');
      params.push(ativo);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    params.push(req.params.id);

    await connection.execute(
      `UPDATE tipos_material SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Tipo de material atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar tipo de material:', error);
    res.status(500).json({ error: 'Erro ao atualizar tipo de material' });
  } finally {
    connection.release();
  }
});

module.exports = router;



