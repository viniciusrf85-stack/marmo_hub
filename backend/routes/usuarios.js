const express = require('express');
const { pool } = require('../config/database');
const { auth, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Listar todos os usuários (apenas admin)
router.get('/', auth, checkRole('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { tipo_usuario, ativo } = req.query;
    
    let query = 'SELECT id, nome, email, telefone, cpf, tipo_usuario, ativo, foto_perfil, data_cadastro FROM usuarios WHERE 1=1';
    const params = [];

    if (tipo_usuario) {
      query += ' AND tipo_usuario = ?';
      params.push(tipo_usuario);
    }

    if (ativo !== undefined) {
      query += ' AND ativo = ?';
      params.push(ativo === 'true' || ativo === '1');
    }

    query += ' ORDER BY data_cadastro DESC';

    const [usuarios] = await connection.execute(query, params);
    res.json(usuarios);

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  } finally {
    connection.release();
  }
});

// Buscar perfil do usuário logado
router.get('/perfil', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.execute(
      'SELECT id, nome, email, telefone, cpf, tipo_usuario, ativo, foto_perfil, data_cadastro FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(users[0]);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  } finally {
    connection.release();
  }
});

// Atualizar perfil do usuário logado
router.put('/perfil', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nome, telefone } = req.body;
    const updates = [];
    const params = [];

    if (nome) {
      updates.push('nome = ?');
      params.push(nome);
    }

    if (telefone) {
      updates.push('telefone = ?');
      params.push(telefone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    params.push(req.user.id);

    await connection.execute(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Perfil atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  } finally {
    connection.release();
  }
});

// Upload de foto de perfil
router.post('/perfil/foto', auth, upload.single('foto'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fotoPath = `/uploads/usuarios/${req.file.filename}`;

    await connection.execute(
      'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
      [fotoPath, req.user.id]
    );

    res.json({ 
      message: 'Foto atualizada com sucesso',
      foto_perfil: fotoPath
    });

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da foto' });
  } finally {
    connection.release();
  }
});

// Buscar usuário por ID (apenas admin)
router.get('/:id', auth, checkRole('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.execute(
      'SELECT id, nome, email, telefone, cpf, tipo_usuario, ativo, foto_perfil, data_cadastro FROM usuarios WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(users[0]);

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  } finally {
    connection.release();
  }
});

// Ativar/Desativar usuário (apenas admin)
router.patch('/:id/status', auth, checkRole('administrador'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { ativo } = req.body;

    await connection.execute(
      'UPDATE usuarios SET ativo = ? WHERE id = ?',
      [ativo, req.params.id]
    );

    res.json({ 
      message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso` 
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do usuário' });
  } finally {
    connection.release();
  }
});

module.exports = router;



