const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { errorHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');

// Validadores
const validarRegistroAgenciador = [
  body('nome').trim().isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('telefone').matches(/^\d{10,11}$/).withMessage('Telefone deve ter 10 ou 11 dígitos'),
  body('senha').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Senha deve conter maiúsculas, minúsculas e números'),
  body('nome_empresa').trim().isLength({ min: 3, max: 255 }).withMessage('Nome da empresa deve ter entre 3 e 255 caracteres'),
  body('cnpj_cpf').matches(/^\d{11,14}$/).withMessage('CNPJ/CPF inválido'),
  body('tipo_pessoa').isIn(['pf', 'pj']).withMessage('Tipo de pessoa deve ser PF ou PJ'),
  body('endereco').trim().isLength({ min: 5, max: 255 }).withMessage('Endereço inválido'),
  body('cidade').trim().isLength({ min: 3, max: 100 }).withMessage('Cidade inválida'),
  body('estado').trim().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('cep').matches(/^\d{8}$/).withMessage('CEP deve ter 8 dígitos'),
  body('comissao_percentual').isFloat({ min: 0, max: 100 }).withMessage('Comissão deve estar entre 0 e 100')
];

/**
 * POST /api/auth/registro-agenciador
 * Registrar novo agenciador (usuário + conta + agenciador)
 */
router.post('/registro-agenciador', validarRegistroAgenciador, async (req, res) => {
  try {
    // Validar erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validação falhou no registro de agenciador', { errors: errors.array() });
      return res.status(400).json({
        success: false,
        message: 'Validação falhou',
        errors: errors.array()
      });
    }

    const {
      nome,
      email,
      telefone,
      senha,
      nome_empresa,
      cnpj_cpf,
      tipo_pessoa,
      endereco,
      cidade,
      estado,
      cep,
      comissao_percentual = 5.00
    } = req.body;

    // Verificar se email já existe
    const [usuarioExistente] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      logger.warn('Tentativa de registro com email duplicado', { email });
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Verificar se CNPJ/CPF já existe
    const [contaExistente] = await db.query(
      'SELECT id FROM contas WHERE cnpj_cpf = ?',
      [cnpj_cpf]
    );

    if (contaExistente.length > 0) {
      logger.warn('Tentativa de registro com CNPJ/CPF duplicado', { cnpj_cpf });
      return res.status(409).json({
        success: false,
        message: 'CNPJ/CPF já cadastrado'
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Iniciar transação
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Criar usuário
      const [resultadoUsuario] = await connection.query(
        `INSERT INTO usuarios (nome, email, telefone, senha, tipo_usuario, ativo, data_cadastro)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [nome, email, telefone, senhaHash, 'agenciador', true]
      );

      const usuario_id = resultadoUsuario.insertId;

      // 2. Criar conta
      const [resultadoConta] = await connection.query(
        `INSERT INTO contas (usuario_id, nome_empresa, cnpj_cpf, tipo_pessoa, telefone, email, endereco, cidade, estado, cep, ativo, data_cadastro)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [usuario_id, nome_empresa, cnpj_cpf, tipo_pessoa, telefone, email, endereco, cidade, estado, cep, true]
      );

      const conta_id = resultadoConta.insertId;

      // 3. Criar agenciador
      const [resultadoAgenciador] = await connection.query(
        `INSERT INTO agenciadores (usuario_id, comissao_percentual, total_vendas_intermediadas, total_comissao, ativo, data_cadastro)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [usuario_id, comissao_percentual, 0, 0.00, true]
      );

      const agenciador_id = resultadoAgenciador.insertId;

      // Confirmar transação
      await connection.commit();

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario_id, email, tipo_usuario: 'agenciador' },
        process.env.JWT_SECRET || 'seu_secret_key',
        { expiresIn: '24h' }
      );

      logger.info('Agenciador registrado com sucesso', {
        usuario_id,
        conta_id,
        agenciador_id,
        email
      });

      return res.status(201).json({
        success: true,
        message: 'Agenciador registrado com sucesso',
        data: {
          usuario_id,
          conta_id,
          agenciador_id,
          nome,
          email,
          nome_empresa,
          tipo_pessoa,
          comissao_percentual,
          tipo_usuario: 'agenciador',
          token
        }
      });

    } catch (erro) {
      await connection.rollback();
      throw erro;
    } finally {
      connection.release();
    }

  } catch (erro) {
    logger.error('Erro ao registrar agenciador', { erro: erro.message });
    return res.status(500).json(errorHandler.handle(erro));
  }
});

/**
 * POST /api/auth/login-agenciador
 * Login específico para agenciadores
 */
router.post('/login-agenciador', [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validação falhou',
        errors: errors.array()
      });
    }

    const { email, senha } = req.body;

    // Buscar usuário agenciador
    const [usuarios] = await db.query(
      `SELECT u.id, u.nome, u.email, u.senha, u.tipo_usuario, a.id as agenciador_id, a.comissao_percentual
       FROM usuarios u
       LEFT JOIN agenciadores a ON u.id = a.usuario_id
       WHERE u.email = ? AND u.tipo_usuario = 'agenciador' AND u.ativo = true`,
      [email]
    );

    if (usuarios.length === 0) {
      logger.warn('Tentativa de login com email não encontrado', { email });
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    const usuario = usuarios[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      logger.warn('Tentativa de login com senha incorreta', { email });
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo_usuario: 'agenciador' },
      process.env.JWT_SECRET || 'seu_secret_key',
      { expiresIn: '24h' }
    );

    logger.info('Agenciador fez login com sucesso', { email });

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        agenciador_id: usuario.agenciador_id,
        comissao_percentual: usuario.comissao_percentual,
        token
      }
    });

  } catch (erro) {
    logger.error('Erro ao fazer login de agenciador', { erro: erro.message });
    return res.status(500).json(errorHandler.handle(erro));
  }
});

/**
 * GET /api/auth/agenciador/perfil
 * Obter perfil do agenciador logado
 */
router.get('/agenciador/perfil', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_key');

    // Buscar dados do agenciador
    const [agenciadores] = await db.query(
      `SELECT a.id, a.usuario_id, a.comissao_percentual, a.total_vendas_intermediadas, a.total_comissao,
              u.nome, u.email, u.telefone,
              c.nome_empresa, c.cnpj_cpf, c.tipo_pessoa, c.endereco, c.cidade, c.estado, c.cep
       FROM agenciadores a
       JOIN usuarios u ON a.usuario_id = u.id
       LEFT JOIN contas c ON u.id = c.usuario_id
       WHERE a.usuario_id = ?`,
      [decoded.id]
    );

    if (agenciadores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agenciador não encontrado'
      });
    }

    const agenciador = agenciadores[0];

    return res.status(200).json({
      success: true,
      data: {
        agenciador_id: agenciador.id,
        usuario_id: agenciador.usuario_id,
        nome: agenciador.nome,
        email: agenciador.email,
        telefone: agenciador.telefone,
        nome_empresa: agenciador.nome_empresa,
        cnpj_cpf: agenciador.cnpj_cpf,
        tipo_pessoa: agenciador.tipo_pessoa,
        endereco: agenciador.endereco,
        cidade: agenciador.cidade,
        estado: agenciador.estado,
        cep: agenciador.cep,
        comissao_percentual: agenciador.comissao_percentual,
        total_vendas_intermediadas: agenciador.total_vendas_intermediadas,
        total_comissao: agenciador.total_comissao
      }
    });

  } catch (erro) {
    logger.error('Erro ao obter perfil do agenciador', { erro: erro.message });
    return res.status(500).json(errorHandler.handle(erro));
  }
});

module.exports = router;
