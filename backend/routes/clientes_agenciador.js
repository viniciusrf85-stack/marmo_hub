const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validationResult, body, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

// ============================================
// MIDDLEWARE DE VALIDAÇÃO
// ============================================

const validateCliente = [
  body('agenciador_id')
    .isInt({ min: 1 })
    .withMessage('agenciador_id deve ser um número inteiro válido'),
  body('nome_cliente')
    .trim()
    .notEmpty()
    .withMessage('nome_cliente é obrigatório')
    .isLength({ min: 3, max: 255 })
    .withMessage('nome_cliente deve ter entre 3 e 255 caracteres'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('email deve ser válido'),
  body('telefone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('telefone deve ter entre 10 e 20 caracteres'),
  body('cnpj_cpf')
    .optional()
    .trim()
    .isLength({ min: 11, max: 18 })
    .withMessage('cnpj_cpf deve ter entre 11 e 18 caracteres'),
  body('prioridade')
    .optional()
    .isIn(['alta', 'media', 'baixa'])
    .withMessage('prioridade deve ser alta, media ou baixa'),
  body('cidade')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('cidade não pode ter mais de 100 caracteres'),
  body('estado')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('estado deve ter 2 caracteres (UF)'),
  body('cep')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('cep não pode ter mais de 10 caracteres')
];

// ============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Erro de validação em clientes_agenciador', {
      errors: errors.array(),
      ip: req.ip,
      user_id: req.user?.id
    });
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// ROTAS - CLIENTES
// ============================================

/**
 * GET /api/clientes-agenciador
 * Listar todos os clientes (com filtros e paginação)
 */
router.get('/', auth, async (req, res) => {
  try {
    const { agenciador_id, prioridade, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM clientes_agenciador WHERE ativo = TRUE';
    const params = [];

    if (agenciador_id) {
      query += ' AND agenciador_id = ?';
      params.push(parseInt(agenciador_id));
    }

    if (prioridade && ['alta', 'media', 'baixa'].includes(prioridade)) {
      query += ' AND prioridade = ?';
      params.push(prioridade);
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as t`;
    const [countResult] = await db.promise().query(countQuery, params);
    const total = countResult[0].total;

    // Buscar com paginação
    query += ' ORDER BY prioridade DESC, total_vendas DESC LIMIT ? OFFSET ?';
    const [clientes] = await db.promise().query(query, [...params, limitNum, offset]);

    logger.info('Clientes listados com sucesso', {
      user_id: req.user?.id,
      total,
      page: pageNum
    });

    res.json({
      success: true,
      data: clientes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar clientes', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao listar clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/clientes-agenciador/:id
 * Obter detalhes de um cliente
 */
router.get('/:id', auth, param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { id } = req.params;

    const [clientes] = await db.promise().query(
      'SELECT * FROM clientes_agenciador WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Buscar vendas do cliente
    const [vendas] = await db.promise().query(
      `SELECT id, numero_processo, valor_total, data_venda, status 
       FROM vendas_agenciador 
       WHERE agenciador_id = ? AND cliente_nome = ? AND ativo = TRUE
       ORDER BY data_venda DESC`,
      [clientes[0].agenciador_id, clientes[0].nome_cliente]
    );

    logger.info('Cliente consultado', { cliente_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      data: {
        ...clientes[0],
        vendas
      }
    });
  } catch (error) {
    logger.error('Erro ao obter cliente', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao obter cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/clientes-agenciador
 * Criar novo cliente
 */
router.post('/', auth, validateCliente, handleValidationErrors, async (req, res) => {
  try {
    const {
      agenciador_id,
      cliente_id,
      nome_cliente,
      email,
      telefone,
      cnpj_cpf,
      endereco,
      cidade,
      estado,
      cep,
      prioridade
    } = req.body;

    // Verificar se agenciador existe
    const [agenciadores] = await db.promise().query(
      'SELECT id FROM agenciadores WHERE id = ? AND ativo = TRUE',
      [agenciador_id]
    );

    if (agenciadores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agenciador não encontrado'
      });
    }

    // Inserir cliente
    const [result] = await db.promise().query(
      `INSERT INTO clientes_agenciador 
       (agenciador_id, cliente_id, nome_cliente, email, telefone, cnpj_cpf, 
        endereco, cidade, estado, cep, prioridade)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agenciador_id,
        cliente_id || null,
        nome_cliente,
        email || null,
        telefone || null,
        cnpj_cpf || null,
        endereco || null,
        cidade || null,
        estado || null,
        cep || null,
        prioridade || 'media'
      ]
    );

    logger.info('Cliente criado com sucesso', {
      cliente_id: result.insertId,
      agenciador_id,
      user_id: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: {
        id: result.insertId,
        agenciador_id,
        nome_cliente,
        prioridade: prioridade || 'media'
      }
    });
  } catch (error) {
    logger.error('Erro ao criar cliente', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/clientes-agenciador/:id
 * Atualizar cliente
 */
router.put('/:id', auth, param('id').isInt({ min: 1 }), validateCliente, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      agenciador_id,
      cliente_id,
      nome_cliente,
      email,
      telefone,
      cnpj_cpf,
      endereco,
      cidade,
      estado,
      cep,
      prioridade
    } = req.body;

    // Verificar se cliente existe
    const [clientes] = await db.promise().query(
      'SELECT * FROM clientes_agenciador WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Atualizar cliente
    await db.promise().query(
      `UPDATE clientes_agenciador 
       SET agenciador_id = ?, cliente_id = ?, nome_cliente = ?, email = ?,
           telefone = ?, cnpj_cpf = ?, endereco = ?, cidade = ?, estado = ?,
           cep = ?, prioridade = ?, data_atualizacao = NOW()
       WHERE id = ?`,
      [
        agenciador_id,
        cliente_id || null,
        nome_cliente,
        email || null,
        telefone || null,
        cnpj_cpf || null,
        endereco || null,
        cidade || null,
        estado || null,
        cep || null,
        prioridade || 'media',
        id
      ]
    );

    logger.info('Cliente atualizado', { cliente_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: {
        id,
        agenciador_id,
        nome_cliente,
        prioridade: prioridade || 'media'
      }
    });
  } catch (error) {
    logger.error('Erro ao atualizar cliente', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/clientes-agenciador/:id
 * Deletar cliente (soft delete)
 */
router.delete('/:id', auth, param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { id } = req.params;

    const [clientes] = await db.promise().query(
      'SELECT id FROM clientes_agenciador WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    await db.promise().query(
      'UPDATE clientes_agenciador SET ativo = FALSE, data_atualizacao = NOW() WHERE id = ?',
      [id]
    );

    logger.info('Cliente deletado', { cliente_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar cliente', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/clientes-agenciador/agenciador/:agenciador_id/top
 * Obter top 10 clientes por valor de vendas
 */
router.get('/agenciador/:agenciador_id/top', auth, param('agenciador_id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { agenciador_id } = req.params;

    const [topClientes] = await db.promise().query(
      `SELECT 
        c.id,
        c.nome_cliente,
        c.prioridade,
        c.total_vendas,
        c.total_recebido,
        COUNT(DISTINCT v.id) as numero_vendas,
        SUM(v.valor_total) as valor_total_vendas,
        AVG(v.valor_total) as ticket_medio
       FROM clientes_agenciador c
       LEFT JOIN vendas_agenciador v ON c.agenciador_id = v.agenciador_id 
         AND c.nome_cliente = v.cliente_nome AND v.ativo = TRUE
       WHERE c.agenciador_id = ? AND c.ativo = TRUE
       GROUP BY c.id, c.nome_cliente, c.prioridade, c.total_vendas, c.total_recebido
       ORDER BY valor_total_vendas DESC
       LIMIT 10`,
      [agenciador_id]
    );

    logger.info('Top clientes consultado', { agenciador_id, user_id: req.user?.id });

    res.json({
      success: true,
      data: topClientes
    });
  } catch (error) {
    logger.error('Erro ao obter top clientes', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao obter top clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
