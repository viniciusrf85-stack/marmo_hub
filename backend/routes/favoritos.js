const express = require('express');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Listar favoritos do usuário
router.get('/', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [favoritos] = await connection.execute(
      `SELECT f.*, m.nome as material_nome, m.valor_m2, m.valor_chapa,
              tm.nome as tipo_material, c.nome_fantasia as empresa_nome,
              (SELECT caminho FROM fotos_materiais WHERE material_id = m.id AND principal = TRUE LIMIT 1) as foto_principal
       FROM favoritos f
       INNER JOIN materiais m ON f.material_id = m.id
       INNER JOIN tipos_material tm ON m.tipo_material_id = tm.id
       INNER JOIN contas c ON m.conta_id = c.id
       WHERE f.usuario_id = ?
       ORDER BY f.data_favorito DESC`,
      [req.user.id]
    );

    res.json(favoritos);

  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    res.status(500).json({ error: 'Erro ao listar favoritos' });
  } finally {
    connection.release();
  }
});

// Adicionar favorito
router.post('/', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { material_id } = req.body;

    if (!material_id) {
      return res.status(400).json({ error: 'ID do material é obrigatório' });
    }

    // Verificar se já existe
    const [existing] = await connection.execute(
      'SELECT id FROM favoritos WHERE usuario_id = ? AND material_id = ?',
      [req.user.id, material_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Material já está nos favoritos' });
    }

    const [result] = await connection.execute(
      'INSERT INTO favoritos (usuario_id, material_id) VALUES (?, ?)',
      [req.user.id, material_id]
    );

    res.status(201).json({
      message: 'Material adicionado aos favoritos',
      id: result.insertId
    });

  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  } finally {
    connection.release();
  }
});

// Remover favorito
router.delete('/:material_id', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.execute(
      'DELETE FROM favoritos WHERE usuario_id = ? AND material_id = ?',
      [req.user.id, req.params.material_id]
    );

    res.json({ message: 'Material removido dos favoritos' });

  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro ao remover favorito' });
  } finally {
    connection.release();
  }
});

// Verificar se material está nos favoritos
router.get('/verificar/:material_id', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [favoritos] = await connection.execute(
      'SELECT id FROM favoritos WHERE usuario_id = ? AND material_id = ?',
      [req.user.id, req.params.material_id]
    );

    res.json({ favoritado: favoritos.length > 0 });

  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    res.status(500).json({ error: 'Erro ao verificar favorito' });
  } finally {
    connection.release();
  }
});

module.exports = router;



