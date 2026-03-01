const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validationResult, body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// ============================================
// MIDDLEWARE DE VALIDAÇÃO
// ============================================

const validateComissao = [
  body('agenciador_id')
    .isInt({ min: 1 })
    .withMessage('agenciador_id deve ser um número inteiro válido'),
  body('venda_id')
    .isInt({ min: 1 })
    .withMessage('venda_id deve ser um número inteiro válido'),
  body('valor_venda')
    .isFloat({ min: 0.01 })
    .withMessage('valor_venda deve ser um número maior que 0'),
  body('percentual_comissao')
    .isFloat({ min: 0, max: 100 })
    .withMessage('percentual_comissao deve estar entre 0 e 100'),
  body('valor_comissao')
    .isFloat({ min: 0.01 })
    .withMessage('valor_comissao deve ser um número maior que 0'),
  body('periodo_mes')
    .isInt({ min: 1, max: 12 })
    .withMessage('periodo_mes deve estar entre 1 e 12'),
  body('periodo_ano')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('periodo_ano deve ser um ano válido')
];

const validateRecebimento = [
  body('agenciador_id')
    .isInt({ min: 1 })
    .withMessage('agenciador_id deve ser um número inteiro válido'),
  body('periodo_mes')
    .isInt({ min: 1, max: 12 })
    .withMessage('periodo_mes deve estar entre 1 e 12'),
  body('periodo_ano')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('periodo_ano deve ser um ano válido'),
  body('valor_total_comissoes')
    .isFloat({ min: 0.01 })
    .withMessage('valor_total_comissoes deve ser um número maior que 0'),
  body('valor_recebido')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('valor_recebido deve ser um número válido'),
  body('forma_pagamento')
    .optional()
    .isIn(['transferencia', 'cheque', 'dinheiro', 'outro'])
    .withMessage('forma_pagamento inválida'),
  body('data_recebimento')
    .optional()
    .isISO8601()
    .withMessage('data_recebimento deve estar em formato ISO8601'),
  body('numero_comprovante')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('numero_comprovante não pode ter mais de 100 caracteres')
];

// ============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Erro de validação em comissoes_agenciador', {
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
// ROTAS - COMISSÕES
// ============================================

/**
 * GET /api/comissoes-agenciador
 * Listar todas as comissões (com filtros)
 */
router.get('/', auth, async (req, res) => {
  try {
    const { agenciador_id, status, periodo_mes, periodo_ano, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM comissoes_agenciador WHERE ativo = TRUE';
    const params = [];

    if (agenciador_id) {
      query += ' AND agenciador_id = ?';
      params.push(parseInt(agenciador_id));
    }

    if (status && ['pendente', 'paga', 'cancelada'].includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (periodo_mes) {
      query += ' AND periodo_mes = ?';
      params.push(parseInt(periodo_mes));
    }

    if (periodo_ano) {
      query += ' AND periodo_ano = ?';
      params.push(parseInt(periodo_ano));
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as t`;
    const [countResult] = await db.promise().query(countQuery, params);
    const total = countResult[0].total;

    // Buscar com paginação
    query += ' ORDER BY periodo_ano DESC, periodo_mes DESC LIMIT ? OFFSET ?';
    const [comissoes] = await db.promise().query(query, [...params, limitNum, offset]);

    logger.info('Comissões listadas com sucesso', {
      user_id: req.user?.id,
      total,
      page: pageNum
    });

    res.json({
      success: true,
      data: comissoes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar comissões', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao listar comissões',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/comissoes-agenciador/:id
 * Obter detalhes de uma comissão
 */
router.get('/:id', auth, param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { id } = req.params;

    const [comissoes] = await db.promise().query(
      'SELECT * FROM comissoes_agenciador WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (comissoes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comissão não encontrada'
      });
    }

    logger.info('Comissão consultada', { comissao_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      data: comissoes[0]
    });
  } catch (error) {
    logger.error('Erro ao obter comissão', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao obter comissão',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/comissoes-agenciador
 * Criar nova comissão
 */
router.post('/', auth, validateComissao, handleValidationErrors, async (req, res) => {
  try {
    const {
      agenciador_id,
      venda_id,
      valor_venda,
      percentual_comissao,
      valor_comissao,
      periodo_mes,
      periodo_ano,
      observacao
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

    // Inserir comissão
    const [result] = await db.promise().query(
      `INSERT INTO comissoes_agenciador 
       (agenciador_id, venda_id, valor_venda, percentual_comissao, valor_comissao, 
        periodo_mes, periodo_ano, observacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agenciador_id,
        venda_id,
        valor_venda,
        percentual_comissao,
        valor_comissao,
        periodo_mes,
        periodo_ano,
        observacao || null
      ]
    );

    logger.info('Comissão criada com sucesso', {
      comissao_id: result.insertId,
      agenciador_id,
      user_id: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Comissão criada com sucesso',
      data: {
        id: result.insertId,
        agenciador_id,
        venda_id,
        valor_comissao,
        status: 'pendente'
      }
    });
  } catch (error) {
    logger.error('Erro ao criar comissão', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao criar comissão',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/comissoes-agenciador/:id
 * Atualizar comissão
 */
router.put('/:id', auth, param('id').isInt({ min: 1 }), validateComissao, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { agenciador_id, venda_id, valor_venda, percentual_comissao, valor_comissao, periodo_mes, periodo_ano, status, data_pagamento, observacao } = req.body;

    // Verificar se comissão existe
    const [comissoes] = await db.promise().query(
      'SELECT * FROM comissoes_agenciador WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (comissoes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comissão não encontrada'
      });
    }

    // Validar status
    if (status && !['pendente', 'paga', 'cancelada'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    // Atualizar comissão
    await db.promise().query(
      `UPDATE comissoes_agenciador 
       SET agenciador_id = ?, venda_id = ?, valor_venda = ?, percentual_comissao = ?,
           valor_comissao = ?, periodo_mes = ?, periodo_ano = ?, status = ?,
           data_pagamento = ?, observacao = ?, data_atualizacao = NOW()
       WHERE id = ?`,
      [
        agenciador_id,
        venda_id,
        valor_venda,
        percentual_comissao,
        valor_comissao,
        periodo_mes,
        periodo_ano,
        status || comissoes[0].status,
        (status === 'paga' && data_pagamento) ? data_pagamento : null,
        observacao || null,
        id
      ]
    );

    logger.info('Comissão atualizada', { comissao_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      message: 'Comissão atualizada com sucesso',
      data: {
        id,
        agenciador_id,
        valor_comissao,
        status: status || comissoes[0].status
      }
    });
  } catch (error) {
    logger.error('Erro ao atualizar comissão', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar comissão',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/comissoes-agenciador/:id
 * Deletar comissão (soft delete)
 */
router.delete('/:id', auth, param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { id } = req.params;

    const [comissoes] = await db.promise().query(
      'SELECT id FROM comissoes_agenciador WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (comissoes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comissão não encontrada'
      });
    }

    await db.promise().query(
      'UPDATE comissoes_agenciador SET ativo = FALSE, data_atualizacao = NOW() WHERE id = ?',
      [id]
    );

    logger.info('Comissão deletada', { comissao_id: id, user_id: req.user?.id });

    res.json({
      success: true,
      message: 'Comissão deletada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar comissão', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar comissão',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/comissoes-agenciador/agenciador/:agenciador_id/periodo
 * Obter comissões de um agenciador por período
 */
router.get('/agenciador/:agenciador_id/periodo', auth, param('agenciador_id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { agenciador_id } = req.params;
    const { periodo_mes, periodo_ano } = req.query;

    let query = 'SELECT * FROM comissoes_agenciador WHERE agenciador_id = ? AND ativo = TRUE';
    const params = [agenciador_id];

    if (periodo_mes) {
      query += ' AND periodo_mes = ?';
      params.push(parseInt(periodo_mes));
    }

    if (periodo_ano) {
      query += ' AND periodo_ano = ?';
      params.push(parseInt(periodo_ano));
    }

    const [comissoes] = await db.promise().query(query, params);

    // Calcular resumo
    const resumo = {
      total_comissoes: comissoes.length,
      valor_total: comissoes.reduce((sum, c) => sum + parseFloat(c.valor_comissao || 0), 0),
      pagas: comissoes.filter(c => c.status === 'paga').length,
      pendentes: comissoes.filter(c => c.status === 'pendente').length,
      valor_pago: comissoes.filter(c => c.status === 'paga').reduce((sum, c) => sum + parseFloat(c.valor_comissao || 0), 0),
      valor_pendente: comissoes.filter(c => c.status === 'pendente').reduce((sum, c) => sum + parseFloat(c.valor_comissao || 0), 0)
    };

    logger.info('Comissões por período consultadas', { agenciador_id, user_id: req.user?.id });

    res.json({
      success: true,
      data: comissoes,
      resumo
    });
  } catch (error) {
    logger.error('Erro ao obter comissões por período', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao obter comissões por período',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// ROTAS - RECEBIMENTOS
// ============================================

/**
 * GET /api/recebimentos-agenciador
 * Listar todos os recebimentos
 */
router.get('/recebimentos', auth, async (req, res) => {
  try {
    const { agenciador_id, status, periodo_mes, periodo_ano, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM recebimentos_agenciador WHERE ativo = TRUE';
    const params = [];

    if (agenciador_id) {
      query += ' AND agenciador_id = ?';
      params.push(parseInt(agenciador_id));
    }

    if (status && ['pendente', 'pago', 'cancelado'].includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (periodo_mes) {
      query += ' AND periodo_mes = ?';
      params.push(parseInt(periodo_mes));
    }

    if (periodo_ano) {
      query += ' AND periodo_ano = ?';
      params.push(parseInt(periodo_ano));
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as t`;
    const [countResult] = await db.promise().query(countQuery, params);
    const total = countResult[0].total;

    // Buscar com paginação
    query += ' ORDER BY periodo_ano DESC, periodo_mes DESC LIMIT ? OFFSET ?';
    const [recebimentos] = await db.promise().query(query, [...params, limitNum, offset]);

    logger.info('Recebimentos listados com sucesso', {
      user_id: req.user?.id,
      total,
      page: pageNum
    });

    res.json({
      success: true,
      data: recebimentos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar recebimentos', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao listar recebimentos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/recebimentos-agenciador
 * Criar novo recebimento
 */
router.post('/recebimentos', auth, validateRecebimento, handleValidationErrors, async (req, res) => {
  try {
    const {
      agenciador_id,
      periodo_mes,
      periodo_ano,
      valor_total_comissoes,
      valor_recebido,
      forma_pagamento,
      data_recebimento,
      numero_comprovante,
      observacao
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

    // Inserir recebimento
    const [result] = await db.promise().query(
      `INSERT INTO recebimentos_agenciador 
       (agenciador_id, periodo_mes, periodo_ano, valor_total_comissoes, valor_recebido,
        forma_pagamento, data_recebimento, numero_comprovante, observacao, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agenciador_id,
        periodo_mes,
        periodo_ano,
        valor_total_comissoes,
        valor_recebido || null,
        forma_pagamento || 'transferencia',
        data_recebimento || null,
        numero_comprovante || null,
        observacao || null,
        data_recebimento ? 'pago' : 'pendente'
      ]
    );

    logger.info('Recebimento criado com sucesso', {
      recebimento_id: result.insertId,
      agenciador_id,
      user_id: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Recebimento criado com sucesso',
      data: {
        id: result.insertId,
        agenciador_id,
        periodo_mes,
        periodo_ano,
        valor_total_comissoes,
        status: data_recebimento ? 'pago' : 'pendente'
      }
    });
  } catch (error) {
    logger.error('Erro ao criar recebimento', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao criar recebimento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
