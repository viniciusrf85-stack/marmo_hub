const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validationResult, body, param } = require('express-validator');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

// ============================================
// MIDDLEWARE DE VALIDAÇÃO
// ============================================

const validateParcela = [
  body('venda_id')
    .isInt({ min: 1 })
    .withMessage('venda_id deve ser um número inteiro válido'),
  body('numero_parcela')
    .isInt({ min: 1 })
    .withMessage('numero_parcela deve ser um número inteiro positivo'),
  body('valor')
    .isFloat({ min: 0.01 })
    .withMessage('valor deve ser um número maior que 0'),
  body('data_vencimento')
    .isISO8601()
    .withMessage('data_vencimento deve estar em formato ISO8601 (YYYY-MM-DD)'),
  body('forma_pagamento')
    .optional()
    .isIn(['boleto', 'cheque', 'dinheiro', 'transferencia', 'outro'])
    .withMessage('forma_pagamento inválida'),
  body('numero_boleto')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('numero_boleto não pode ter mais de 50 caracteres'),
  body('observacao')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('observacao não pode ter mais de 1000 caracteres')
];

// ============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Erro de validação em parcelas_agenciador', {
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
// ROTAS - PARCELAS
// ============================================

/**
 * GET /api/parcelas-agenciador
 * Listar todas as parcelas (com filtros)
 */
router.get('/', auth, async (req, res) => {
  try {
    const { venda_id, status, data_inicio, data_fim, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM parcelas_venda WHERE ativo = TRUE';
    const params = [];

    if (venda_id) {
      query += ' AND venda_id = ?';
      params.push(parseInt(venda_id));
    }

    if (status && ['pendente', 'paga', 'atrasada', 'cancelada'].includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (data_inicio) {
      query += ' AND data_vencimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND data_vencimento <= ?';
      params.push(data_fim);
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as t`;
    const [countResult] = await db.promise().query(countQuery, params);
    const total = countResult[0].total;

    // Buscar com paginação
    query += ' ORDER BY data_vencimento ASC LIMIT ? OFFSET ?';
    const [parcelas] = await db.promise().query(query, [...params, limitNum, offset]);

    logger.info('Parcelas listadas com sucesso', {
      user_id: req.user?.id,
      total,
      page: pageNum
    });

    res.json({
      success: true,
      data: parcelas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar parcelas', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao listar parcelas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/parcelas-agenciador/:id
 * Obter detalhes de uma parcela
 */
router.get('/:id', auth, param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { id } = req.params;

    const [parcelas] = await db.promise().query(
      'SELECT * FROM parcelas_venda WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (parcelas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parcela não encontrada'
      });
    }

    logger.info('Parcela consultada', { parcela_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      data: parcelas[0]
    });
  } catch (error) {
    logger.error('Erro ao obter parcela', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao obter parcela',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/parcelas-agenciador
 * Criar nova parcela
 */
router.post('/', auth, validateParcela, handleValidationErrors, async (req, res) => {
  try {
    const {
      venda_id,
      numero_parcela,
      valor,
      data_vencimento,
      forma_pagamento,
      numero_boleto,
      observacao
    } = req.body;

    // Verificar se venda existe
    const [vendas] = await db.promise().query(
      'SELECT id FROM vendas_agenciador WHERE id = ? AND ativo = TRUE',
      [venda_id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Verificar se parcela já existe
    const [parcelas] = await db.promise().query(
      'SELECT id FROM parcelas_venda WHERE venda_id = ? AND numero_parcela = ?',
      [venda_id, numero_parcela]
    );

    if (parcelas.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Parcela já existe para esta venda'
      });
    }

    // Inserir parcela
    const [result] = await db.promise().query(
      `INSERT INTO parcelas_venda 
       (venda_id, numero_parcela, valor, data_vencimento, forma_pagamento, numero_boleto, observacao)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        venda_id,
        numero_parcela,
        valor,
        data_vencimento,
        forma_pagamento || 'boleto',
        numero_boleto || null,
        observacao || null
      ]
    );

    logger.info('Parcela criada com sucesso', {
      parcela_id: result.insertId,
      venda_id,
      user_id: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Parcela criada com sucesso',
      data: {
        id: result.insertId,
        venda_id,
        numero_parcela,
        valor,
        data_vencimento,
        status: 'pendente'
      }
    });
  } catch (error) {
    logger.error('Erro ao criar parcela', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao criar parcela',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/parcelas-agenciador/:id
 * Atualizar parcela
 */
router.put('/:id', auth, param('id').isInt({ min: 1 }), validateParcela, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      venda_id,
      numero_parcela,
      valor,
      data_vencimento,
      forma_pagamento,
      numero_boleto,
      observacao,
      status,
      data_pagamento
    } = req.body;

    // Verificar se parcela existe
    const [parcelas] = await db.promise().query(
      'SELECT * FROM parcelas_venda WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (parcelas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parcela não encontrada'
      });
    }

    // Validar status
    if (status && !['pendente', 'paga', 'atrasada', 'cancelada'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    // Atualizar parcela
    await db.promise().query(
      `UPDATE parcelas_venda 
       SET venda_id = ?, numero_parcela = ?, valor = ?, data_vencimento = ?,
           forma_pagamento = ?, numero_boleto = ?, observacao = ?, 
           status = ?, data_pagamento = ?, data_atualizacao = NOW()
       WHERE id = ?`,
      [
        venda_id,
        numero_parcela,
        valor,
        data_vencimento,
        forma_pagamento || 'boleto',
        numero_boleto || null,
        observacao || null,
        status || parcelas[0].status,
        (status === 'paga' && data_pagamento) ? data_pagamento : null,
        id
      ]
    );

    logger.info('Parcela atualizada', { parcela_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      message: 'Parcela atualizada com sucesso',
      data: {
        id,
        venda_id,
        numero_parcela,
        valor,
        status: status || parcelas[0].status
      }
    });
  } catch (error) {
    logger.error('Erro ao atualizar parcela', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar parcela',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/parcelas-agenciador/:id
 * Deletar parcela (soft delete)
 */
router.delete('/:id', auth, param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { id } = req.params;

    const [parcelas] = await db.promise().query(
      'SELECT id FROM parcelas_venda WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (parcelas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parcela não encontrada'
      });
    }

    await db.promise().query(
      'UPDATE parcelas_venda SET ativo = FALSE, data_atualizacao = NOW() WHERE id = ?',
      [id]
    );

    logger.info('Parcela deletada', { parcela_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      message: 'Parcela deletada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar parcela', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar parcela',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/parcelas-agenciador/venda/:venda_id/resumo
 * Obter resumo de parcelas de uma venda
 */
router.get('/venda/:venda_id/resumo', auth, param('venda_id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { venda_id } = req.params;

    const [resumo] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_parcelas,
        SUM(valor) as valor_total,
        COUNT(CASE WHEN status = 'paga' THEN 1 END) as pagas,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'atrasada' THEN 1 END) as atrasadas,
        SUM(CASE WHEN status = 'paga' THEN valor ELSE 0 END) as valor_pago,
        SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as valor_pendente
       FROM parcelas_venda 
       WHERE venda_id = ? AND ativo = TRUE`,
      [venda_id]
    );

    logger.info('Resumo de parcelas consultado', { venda_id, user_id: req.user?.id });

    res.json({
      success: true,
      data: resumo[0]
    });
  } catch (error) {
    logger.error('Erro ao obter resumo de parcelas', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao obter resumo de parcelas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
