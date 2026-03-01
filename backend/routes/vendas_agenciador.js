const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validationResult, body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// ============================================
// MIDDLEWARE DE VALIDAÇÃO
// ============================================

const validateVenda = [
  body('agenciador_id')
    .isInt({ min: 1 })
    .withMessage('agenciador_id deve ser um número inteiro válido'),
  body('numero_processo')
    .trim()
    .notEmpty()
    .withMessage('numero_processo é obrigatório')
    .isLength({ min: 3, max: 50 })
    .withMessage('numero_processo deve ter entre 3 e 50 caracteres'),
  body('cliente_nome')
    .trim()
    .notEmpty()
    .withMessage('cliente_nome é obrigatório')
    .isLength({ min: 3, max: 255 })
    .withMessage('cliente_nome deve ter entre 3 e 255 caracteres'),
  body('valor_total')
    .isFloat({ min: 0.01 })
    .withMessage('valor_total deve ser um número maior que 0'),
  body('data_venda')
    .isISO8601()
    .withMessage('data_venda deve estar em formato ISO8601 (YYYY-MM-DD)'),
  body('comissao_percentual')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('comissao_percentual deve estar entre 0 e 100'),
  body('quantidade_chapas')
    .optional()
    .isInt({ min: 1 })
    .withMessage('quantidade_chapas deve ser um número inteiro positivo'),
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('descricao não pode ter mais de 1000 caracteres')
];

// ============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Erro de validação em vendas_agenciador', {
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
// ROTAS - VENDAS
// ============================================

/**
 * GET /api/vendas-agenciador
 * Listar todas as vendas (com paginação e filtros)
 */
router.get('/', auth, async (req, res) => {
  try {
    const { agenciador_id, status, data_inicio, data_fim, page = 1, limit = 20 } = req.query;

    // Validar paginação
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM vendas_agenciador WHERE ativo = TRUE';
    const params = [];

    // Filtrar por agenciador
    if (agenciador_id) {
      query += ' AND agenciador_id = ?';
      params.push(parseInt(agenciador_id));
    }

    // Filtrar por status
    if (status && ['pendente', 'confirmada', 'cancelada'].includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Filtrar por data
    if (data_inicio) {
      query += ' AND data_venda >= ?';
      params.push(data_inicio);
    }
    if (data_fim) {
      query += ' AND data_venda <= ?';
      params.push(data_fim);
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as t`;
    const [countResult] = await db.promise().query(countQuery, params);
    const total = countResult[0].total;

    // Buscar com paginação
    query += ' ORDER BY data_venda DESC LIMIT ? OFFSET ?';
    const [vendas] = await db.promise().query(query, [...params, limitNum, offset]);

    logger.info('Vendas listadas com sucesso', {
      user_id: req.user?.id,
      total,
      page: pageNum,
      limit: limitNum
    });

    res.json({
      success: true,
      data: vendas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar vendas', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao listar vendas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/vendas-agenciador/:id
 * Obter detalhes de uma venda específica
 */
router.get('/:id', auth, param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { id } = req.params;

    const [vendas] = await db.promise().query(
      'SELECT * FROM vendas_agenciador WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Buscar parcelas associadas
    const [parcelas] = await db.promise().query(
      'SELECT * FROM parcelas_venda WHERE venda_id = ? AND ativo = TRUE ORDER BY numero_parcela',
      [id]
    );

    logger.info('Venda consultada', { venda_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      data: {
        ...vendas[0],
        parcelas
      }
    });
  } catch (error) {
    logger.error('Erro ao obter venda', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao obter venda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/vendas-agenciador
 * Criar nova venda
 */
router.post('/', auth, validateVenda, handleValidationErrors, async (req, res) => {
  const connection = await db.promise();

  try {
    const {
      agenciador_id,
      numero_processo,
      cliente_nome,
      cliente_id,
      quantidade_chapas,
      valor_total,
      comissao_percentual,
      descricao
    } = req.body;

    // Verificar se agenciador existe
    const [agenciadores] = await connection.query(
      'SELECT id FROM agenciadores WHERE id = ? AND ativo = TRUE',
      [agenciador_id]
    );

    if (agenciadores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agenciador não encontrado'
      });
    }

    // Verificar se numero_processo já existe
    const [existentes] = await connection.query(
      'SELECT id FROM vendas_agenciador WHERE numero_processo = ?',
      [numero_processo]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Número de processo já existe'
      });
    }

    // Calcular comissão
    const percentual = comissao_percentual || 5.00;
    const comissao_valor = (valor_total * percentual) / 100;

    // Inserir venda
    const [result] = await connection.query(
      `INSERT INTO vendas_agenciador 
       (agenciador_id, numero_processo, cliente_nome, cliente_id, quantidade_chapas, 
        valor_total, comissao_percentual, comissao_valor, data_venda, descricao, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'pendente')`,
      [
        agenciador_id,
        numero_processo,
        cliente_nome,
        cliente_id || null,
        quantidade_chapas || null,
        valor_total,
        percentual,
        comissao_valor,
        descricao || null
      ]
    );

    logger.info('Venda criada com sucesso', {
      venda_id: result.insertId,
      agenciador_id,
      user_id: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Venda criada com sucesso',
      data: {
        id: result.insertId,
        agenciador_id,
        numero_processo,
        cliente_nome,
        valor_total,
        comissao_valor,
        status: 'pendente'
      }
    });
  } catch (error) {
    logger.error('Erro ao criar venda', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao criar venda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/vendas-agenciador/:id
 * Atualizar venda
 */
router.put('/:id', auth, param('id').isInt({ min: 1 }), validateVenda, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      agenciador_id,
      numero_processo,
      cliente_nome,
      cliente_id,
      quantidade_chapas,
      valor_total,
      comissao_percentual,
      descricao,
      status
    } = req.body;

    // Verificar se venda existe
    const [vendas] = await db.promise().query(
      'SELECT * FROM vendas_agenciador WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Validar status
    if (status && !['pendente', 'confirmada', 'cancelada'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    // Calcular comissão se valor mudou
    const percentual = comissao_percentual || vendas[0].comissao_percentual;
    const comissao_valor = (valor_total * percentual) / 100;

    // Atualizar venda
    await db.promise().query(
      `UPDATE vendas_agenciador 
       SET agenciador_id = ?, numero_processo = ?, cliente_nome = ?, cliente_id = ?,
           quantidade_chapas = ?, valor_total = ?, comissao_percentual = ?, 
           comissao_valor = ?, descricao = ?, status = ?, data_atualizacao = NOW()
       WHERE id = ?`,
      [
        agenciador_id,
        numero_processo,
        cliente_nome,
        cliente_id || null,
        quantidade_chapas || null,
        valor_total,
        percentual,
        comissao_valor,
        descricao || null,
        status || vendas[0].status,
        id
      ]
    );

    logger.info('Venda atualizada', { venda_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      message: 'Venda atualizada com sucesso',
      data: {
        id,
        agenciador_id,
        numero_processo,
        cliente_nome,
        valor_total,
        comissao_valor,
        status: status || vendas[0].status
      }
    });
  } catch (error) {
    logger.error('Erro ao atualizar venda', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar venda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/vendas-agenciador/:id
 * Deletar venda (soft delete)
 */
router.delete('/:id', auth, param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se venda existe
    const [vendas] = await db.promise().query(
      'SELECT id FROM vendas_agenciador WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Soft delete
    await db.promise().query(
      'UPDATE vendas_agenciador SET ativo = FALSE, data_atualizacao = NOW() WHERE id = ?',
      [id]
    );

    logger.info('Venda deletada', { venda_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      message: 'Venda deletada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar venda', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar venda',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/vendas-agenciador/agenciador/:agenciador_id/resumo
 * Obter resumo de vendas de um agenciador
 */
router.get('/agenciador/:agenciador_id/resumo', auth, param('agenciador_id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { agenciador_id } = req.params;

    const [resumo] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_vendas,
        SUM(valor_total) as valor_total_vendas,
        SUM(comissao_valor) as total_comissoes,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as vendas_pendentes,
        COUNT(CASE WHEN status = 'confirmada' THEN 1 END) as vendas_confirmadas,
        COUNT(CASE WHEN status = 'cancelada' THEN 1 END) as vendas_canceladas,
        AVG(valor_total) as ticket_medio
       FROM vendas_agenciador 
       WHERE agenciador_id = ? AND ativo = TRUE`,
      [agenciador_id]
    );

    logger.info('Resumo de vendas consultado', { agenciador_id, user_id: req.user?.id });

    res.json({
      success: true,
      data: resumo[0]
    });
  } catch (error) {
    logger.error('Erro ao obter resumo de vendas', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao obter resumo de vendas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
