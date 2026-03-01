const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { asyncHandler, errors } = require('../utils/errorHandler');
const { validate, authValidators } = require('../utils/validators');

const router = express.Router();

// ============================================
// REGISTRO DE CONTA (Empresa Anunciante)
// ============================================
router.post('/registro-conta', 
  authValidators.registroConta, 
  validate,
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
      const {
        email,
        senha,
        razao_social,
        nome_fantasia,
        cnpj,
        telefone_comercial,
        whatsapp,
        email_comercial,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        plano_id
      } = req.body;

      // Verificar se email já existe (em contas, usuarios ou admins)
      const [existingConta] = await connection.execute(
        'SELECT id FROM contas WHERE email = ?',
        [email]
      );
      const [existingUsuario] = await connection.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );
      const [existingAdmin] = await connection.execute(
        'SELECT id FROM usuarios_administradores WHERE email = ?',
        [email]
      );

      if (existingConta.length > 0 || existingUsuario.length > 0 || existingAdmin.length > 0) {
        throw errors.DUPLICATE_EMAIL();
      }

      // Verificar se CNPJ já existe
      const [existingCNPJ] = await connection.execute(
        'SELECT id FROM contas WHERE cnpj = ?',
        [cnpj]
      );

      if (existingCNPJ.length > 0) {
        throw errors.DUPLICATE_CNPJ();
      }

      // Verificar plano selecionado
      let planoSelecionado = null;
      let anunciosDisponiveis = 0;
      
      if (plano_id) {
        const [planos] = await connection.execute(
          'SELECT * FROM planos WHERE id = ? AND ativo = TRUE',
          [plano_id]
        );
        
        if (planos.length === 0) {
          throw errors.VALIDATION_ERROR('Plano selecionado não encontrado ou inativo');
        }
        
        planoSelecionado = planos[0];
        anunciosDisponiveis = planoSelecionado.quantidade_anuncios;
      } else {
        // Se não selecionou plano, atribuir plano Prata (padrão)
        const [planosPrata] = await connection.execute(
          "SELECT * FROM planos WHERE nome = 'Prata' AND ativo = TRUE LIMIT 1"
        );
        
        if (planosPrata.length > 0) {
          planoSelecionado = planosPrata[0];
          anunciosDisponiveis = planoSelecionado.quantidade_anuncios;
          plano_id = planoSelecionado.id;
        }
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Inserir conta (campos opcionais podem ser NULL)
      const [result] = await connection.execute(
        `INSERT INTO contas (
          email, senha, razao_social, nome_fantasia, cnpj,
          telefone_comercial, whatsapp, email_comercial,
          cep, logradouro, numero, complemento, bairro, cidade, estado,
          plano_id, anuncios_disponiveis, data_inicio_plano
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [
          email, 
          hashedPassword, 
          razao_social, 
          nome_fantasia, 
          cnpj,
          telefone_comercial || null, 
          whatsapp || null, 
          email_comercial || email,
          cep || null, 
          logradouro || null, 
          numero || null, 
          complemento || null, 
          bairro || null, 
          cidade || null, 
          estado || null,
          plano_id || null,
          anunciosDisponiveis
        ]
      );

      // Gerar token
      const token = jwt.sign(
        { 
          id: result.insertId, 
          email, 
          tipo: 'conta',
          tipo_entidade: 'conta'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Preparar dados do usuário para o frontend
      const usuarioData = {
        id: result.insertId,
        email,
        nome_fantasia,
        nome: nome_fantasia,
        cnpj,
        aprovada: false,
        tipo_entidade: 'conta'
      };

      res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso. Aguardando aprovação.',
        token,
        usuario: usuarioData,
        tipo_entidade: 'conta'
      });

    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Erro no registro de conta:', error);
      throw errors.DATABASE_ERROR('criar conta');
    } finally {
      connection.release();
    }
  })
);

// ============================================
// REGISTRO DE USUÁRIO (Consumidor)
// ============================================
router.post('/registro-usuario',
  authValidators.registroUsuario,
  validate,
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
      const {
        nome,
        email,
        senha,
        telefone,
        tipo_documento,
        cpf,
        cnpj,
        tipo_consumidor,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado
      } = req.body;

      // Verificar se email já existe
      const [existingConta] = await connection.execute(
        'SELECT id FROM contas WHERE email = ?',
        [email]
      );
      const [existingUsuario] = await connection.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );
      const [existingAdmin] = await connection.execute(
        'SELECT id FROM usuarios_administradores WHERE email = ?',
        [email]
      );

      if (existingConta.length > 0 || existingUsuario.length > 0 || existingAdmin.length > 0) {
        throw errors.DUPLICATE_EMAIL();
      }

      // Verificar se CPF/CNPJ já existe
      if (cpf) {
        const [existingCPF] = await connection.execute(
          'SELECT id FROM usuarios WHERE cpf = ?',
          [cpf]
        );
        if (existingCPF.length > 0) {
          throw errors.DUPLICATE_CPF();
        }
      }

      if (cnpj) {
        const [existingCNPJ] = await connection.execute(
          'SELECT id FROM usuarios WHERE cnpj = ?',
          [cnpj]
        );
        if (existingCNPJ.length > 0) {
          throw errors.DUPLICATE_CNPJ();
        }
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Inserir usuário
      const [result] = await connection.execute(
        `INSERT INTO usuarios (
          nome, email, senha, telefone,
          tipo_documento, cpf, cnpj,
          tipo_consumidor,
          cep, logradouro, numero, complemento, bairro, cidade, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nome, email, hashedPassword, telefone,
          tipo_documento, cpf || null, cnpj || null,
          tipo_consumidor,
          cep || null, logradouro || null, numero || null, 
          complemento || null, bairro || null, cidade || null, estado || null
        ]
      );

      // Gerar token
      const token = jwt.sign(
        { 
          id: result.insertId, 
          email, 
          tipo: 'usuario',
          tipo_entidade: 'usuario'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Preparar dados do usuário para o frontend
      const usuarioData = {
        id: result.insertId,
        nome,
        email,
        tipo_consumidor,
        tipo_entidade: 'usuario'
      };

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        token,
        usuario: usuarioData,
        tipo_entidade: 'usuario'
      });

    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Erro no registro de usuário:', error);
      throw errors.DATABASE_ERROR('registrar usuário');
    } finally {
      connection.release();
    }
  })
);

// ============================================
// LOGIN (Unificado - Conta, Usuário ou Admin)
// ============================================
router.post('/login',
  authValidators.login,
  validate,
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
      const { email, senha } = req.body;

      let user = null;
      let tipo_entidade = null;

      // Tentar encontrar em contas (empresas)
      const [contas] = await connection.execute(
        'SELECT * FROM contas WHERE email = ? AND ativa = TRUE',
        [email]
      );

      if (contas.length > 0) {
        user = contas[0];
        tipo_entidade = 'conta';
      } else {
        // Tentar encontrar em usuários (consumidores)
        const [usuarios] = await connection.execute(
          'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE',
          [email]
        );

        if (usuarios.length > 0) {
          user = usuarios[0];
          tipo_entidade = 'usuario';
        } else {
          // Tentar encontrar em administradores
          const [admins] = await connection.execute(
            'SELECT * FROM usuarios_administradores WHERE email = ? AND ativo = TRUE',
            [email]
          );

          if (admins.length > 0) {
            user = admins[0];
            tipo_entidade = 'administrador';
          }
        }
      }

      if (!user) {
        throw errors.INVALID_CREDENTIALS();
      }

      // Verificar se a senha existe
      if (!user.senha) {
        throw errors.INVALID_CREDENTIALS();
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(senha, user.senha);
      
      if (!validPassword) {
        throw errors.INVALID_CREDENTIALS();
      }

      // Preparar dados do usuário conforme tipo (normalizado para frontend)
      let userData = {};
      if (tipo_entidade === 'conta') {
        userData = {
          id: user.id,
          email: user.email,
          nome_fantasia: user.nome_fantasia,
          nome: user.nome_fantasia,
          cnpj: user.cnpj,
          aprovada: user.aprovada,
          plano_id: user.plano_id,
          tipo_entidade: 'conta'
        };
      } else if (tipo_entidade === 'usuario') {
        userData = {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo_consumidor: user.tipo_consumidor,
          foto_perfil: user.foto_perfil,
          tipo_entidade: 'usuario'
        };
      } else if (tipo_entidade === 'administrador') {
        userData = {
          id: user.id,
          nome: user.nome,
          email: user.email,
          foto_perfil: user.foto_perfil,
          tipo_entidade: 'administrador'
        };
      }

      // Gerar token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          tipo_entidade
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        usuario: userData,
        tipo_entidade
      });

    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Erro no login:', error);
      throw errors.INVALID_CREDENTIALS();
    } finally {
      connection.release();
    }
  })
);

// ============================================
// VERIFICAR TOKEN
// ============================================
router.get('/verificar', auth, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { tipo_entidade, id } = req.user;
    let usuario = null;

    if (tipo_entidade === 'conta') {
      const [contas] = await connection.execute(
        'SELECT id, email, nome_fantasia, cnpj, aprovada, plano_id FROM contas WHERE id = ?',
        [id]
      );
      if (contas.length > 0) {
        usuario = {
          ...contas[0],
          nome: contas[0].nome_fantasia,
          tipo_entidade: 'conta'
        };
      }
    } else if (tipo_entidade === 'usuario') {
      const [usuarios] = await connection.execute(
        'SELECT id, email, nome, tipo_consumidor, foto_perfil FROM usuarios WHERE id = ?',
        [id]
      );
      if (usuarios.length > 0) {
        usuario = {
          ...usuarios[0],
          tipo_entidade: 'usuario'
        };
      }
    } else if (tipo_entidade === 'administrador') {
      const [admins] = await connection.execute(
        'SELECT id, email, nome, foto_perfil FROM usuarios_administradores WHERE id = ?',
        [id]
      );
      if (admins.length > 0) {
        usuario = {
          ...admins[0],
          tipo_entidade: 'administrador'
        };
      }
    }

    if (!usuario) {
      throw errors.UNAUTHORIZED('Usuário não encontrado');
    }

    res.json({
      success: true,
      usuario
    });

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw errors.INTERNAL_ERROR('Erro ao verificar token');
  } finally {
    connection.release();
  }
}));

// ============================================
// ALTERAR SENHA
// ============================================
router.post('/alterar-senha', auth, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { senha_atual, senha_nova } = req.body;

    if (!senha_atual || !senha_nova) {
      throw errors.VALIDATION_ERROR('Senha atual e nova são obrigatórias');
    }

    if (senha_nova.length < 8) {
      throw errors.VALIDATION_ERROR('Nova senha deve ter no mínimo 8 caracteres');
    }

    const { tipo_entidade, id } = req.user;
    let user = null;
    let table = null;

    if (tipo_entidade === 'conta') {
      const [contas] = await connection.execute('SELECT senha FROM contas WHERE id = ?', [id]);
      if (contas.length > 0) {
        user = contas[0];
        table = 'contas';
      }
    } else if (tipo_entidade === 'usuario') {
      const [usuarios] = await connection.execute('SELECT senha FROM usuarios WHERE id = ?', [id]);
      if (usuarios.length > 0) {
        user = usuarios[0];
        table = 'usuarios';
      }
    } else if (tipo_entidade === 'administrador') {
      const [admins] = await connection.execute('SELECT senha FROM usuarios_administradores WHERE id = ?', [id]);
      if (admins.length > 0) {
        user = admins[0];
        table = 'usuarios_administradores';
      }
    }

    if (!user) {
      throw errors.NOT_FOUND('Usuário');
    }

    // Verificar senha atual
    const validPassword = await bcrypt.compare(senha_atual, user.senha);
    if (!validPassword) {
      throw errors.INVALID_CREDENTIALS();
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(senha_nova, 10);

    // Atualizar senha
    await connection.execute(
      `UPDATE ${table} SET senha = ? WHERE id = ?`,
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Erro ao alterar senha:', error);
    throw errors.DATABASE_ERROR('alterar senha');
  } finally {
    connection.release();
  }
}));

module.exports = router;
