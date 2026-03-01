const express = require('express');
const { pool } = require('../config/database');
const { auth, checkTipo, checkContaAprovada } = require('../middleware/auth');

const router = express.Router();

// Criar contato
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { material_id, nome, email, telefone, mensagem } = req.body;

    // Validações
    if (!material_id || !nome || !email || !mensagem) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Buscar conta do material
    const [materiais] = await connection.execute(
      'SELECT conta_id FROM materiais WHERE id = ?',
      [material_id]
    );

    if (materiais.length === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    const cliente_id = req.user && req.user.tipo_entidade === 'usuario' ? req.user.id : null;

    const [result] = await connection.execute(
      `INSERT INTO contatos (material_id, conta_id, cliente_id, nome, email, telefone, mensagem) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [material_id, materiais[0].conta_id, cliente_id, nome, email, telefone, mensagem]
    );

    res.status(201).json({
      message: 'Contato enviado com sucesso',
      id: result.insertId
    });

  } catch (error) {
    console.error('Erro ao enviar contato:', error);
    res.status(500).json({ error: 'Erro ao enviar contato' });
  } finally {
    connection.release();
  }
});

// Listar contatos da conta
router.get('/conta', auth, checkTipo('conta'), checkContaAprovada, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const conta_id = req.user.id;

    const [contatos] = await connection.execute(
      `SELECT c.*, m.nome as material_nome
       FROM contatos c
       INNER JOIN materiais m ON c.material_id = m.id
       WHERE c.conta_id = ?
       ORDER BY c.data_contato DESC`,
      [conta_id]
    );

    res.json(contatos);

  } catch (error) {
    console.error('Erro ao listar contatos:', error);
    res.status(500).json({ error: 'Erro ao listar contatos' });
  } finally {
    connection.release();
  }
});

// Marcar contato como respondido
router.patch('/:id/respondido', auth, checkTipo('conta'), checkContaAprovada, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const conta_id = req.user.id;

    await connection.execute(
      'UPDATE contatos SET respondido = TRUE WHERE id = ? AND conta_id = ?',
      [req.params.id, conta_id]
    );

    res.json({ message: 'Contato marcado como respondido' });

  } catch (error) {
    console.error('Erro ao atualizar contato:', error);
    res.status(500).json({ error: 'Erro ao atualizar contato' });
  } finally {
    connection.release();
  }
});

module.exports = router;



