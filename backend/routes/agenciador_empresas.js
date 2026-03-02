const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { errorHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { verificarAutenticacao } = require('../middleware/auth');

// Validadores
const validarEmpresa = [
  body('empresa_nome').trim().isLength({ min: 3, max: 255 }).withMessage('Nome da empresa deve ter entre 3 e 255 caracteres'),
  body('cnpj').matches(/^\d{11,14}$/).withMessage('CNPJ inválido'),
  body('localizacao').trim().isLength({ min: 3, max: 255 }).withMessage('Localização inválida'),
  body('comissao_percentual').isFloat({ min: 0, max: 100 }).withMessage('Comissão deve estar entre 0 e 100')
];

/**
 * GET /api/agenciador-empresas
 * Listar todas as empresas do agenciador logado
 */
router.get('/', verificarAutenticacao, async (req, res) => {
  try {
    const agenciador_id = req.usuario.agenciador_id;

    const [empresas] = await db.promise().query(
      `SELECT id, agenciador_id, empresa_nome, cnpj, localizacao, comissao_percentual, ativo, data_cadastro
       FROM agenciador_empresas
       WHERE agenciador_id = ? AND ativo = true
       ORDER BY data_cadastro DESC`,
      [agenciador_id]
    );

    logger.info('Empresas listadas com sucesso', { agenciador_id, total: empresas.length });

    return res.status(200).json({
      success: true,
      data: empresas
    });

  } catch (erro) {
    logger.error('Erro ao listar empresas', { erro: erro.message });
    return res.status(500).json(errorHandler.handle(erro));
  }
});

/**
 * GET /api/agenciador-empresas/:id
 * Obter detalhes de uma empresa específica
 */
router.get('/:id', verificarAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;
    const agenciador_id = req.usuario.agenciador_id;

    const [empresas] = await db.promise().query(
      `SELECT id, agenciador_id, empresa_nome, cnpj, localizacao, comissao_percentual, ativo, data_cadastro
       FROM agenciador_empresas
       WHERE id = ? AND agenciador_id = ?`,
      [id, agenciador_id]
    );

    if (empresas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    logger.info('Empresa obtida com sucesso', { id, agenciador_id });

    return res.status(200).json({
      success: true,
      data: empresas[0]
    });

  } catch (erro) {
    logger.error('Erro ao obter empresa', { erro: erro.message });
    return res.status(500).json(errorHandler.handle(erro));
  }
});

/**
 * POST /api/agenciador-empresas
 * Criar nova empresa comissionária
 */
router.post('/', verificarAutenticacao, validarEmpresa, async (req, res) => {
  try {
    // Validar erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validação falhou ao criar empresa', { errors: errors.array() });
      return res.status(400).json({
        success: false,
        message: 'Validação falhou',
        errors: errors.array()
      });
    }

    const agenciador_id = req.usuario.agenciador_id;
    const { empresa_nome, cnpj, localizacao, comissao_percentual } = req.body;

    // Verificar se CNPJ já existe para este agenciador
    const [empresaExistente] = await db.promise().query(
      'SELECT id FROM agenciador_empresas WHERE agenciador_id = ? AND cnpj = ?',
      [agenciador_id, cnpj]
    );

    if (empresaExistente.length > 0) {
      logger.warn('Tentativa de criar empresa com CNPJ duplicado', { agenciador_id, cnpj });
      return res.status(409).json({
        success: false,
        message: 'Já existe uma empresa com este CNPJ'
      });
    }

    // Criar empresa
    const [resultado] = await db.promise().query(
      `INSERT INTO agenciador_empresas (agenciador_id, empresa_nome, cnpj, localizacao, comissao_percentual, ativo, data_cadastro)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [agenciador_id, empresa_nome, cnpj, localizacao, comissao_percentual, true]
    );

    const empresa_id = resultado.insertId;

    logger.info('Empresa criada com sucesso', { empresa_id, agenciador_id, cnpj });

    return res.status(201).json({
      success: true,
      message: 'Empresa criada com sucesso',
      data: {
        id: empresa_id,
        agenciador_id,
        empresa_nome,
        cnpj,
        localizacao,
        comissao_percentual,
        ativo: true
      }
    });

  } catch (erro) {
    logger.error('Erro ao criar empresa', { erro: erro.message });
    return res.status(500).json(errorHandler.handle(erro));
  }
});

/**
 * PUT /api/agenciador-empresas/:id
 * Atualizar empresa comissionária
 */
router.put('/:id', verificarAutenticacao, validarEmpresa, async (req, res) => {
  try {
    // Validar erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validação falhou ao atualizar empresa', { errors: errors.array() });
      return res.status(400).json({
        success: false,
        message: 'Validação falhou',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const agenciador_id = req.usuario.agenciador_id;
    const { empresa_nome, cnpj, localizacao, comissao_percentual } = req.body;

    // Verificar se empresa existe
    const [empresaExistente] = await db.promise().query(
      'SELECT id FROM agenciador_empresas WHERE id = ? AND agenciador_id = ?',
      [id, agenciador_id]
    );

    if (empresaExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Verificar se CNPJ já existe para outro registro
    const [cnpjDuplicado] = await db.promise().query(
      'SELECT id FROM agenciador_empresas WHERE agenciador_id = ? AND cnpj = ? AND id != ?',
      [agenciador_id, cnpj, id]
    );

    if (cnpjDuplicado.length > 0) {
      logger.warn('Tentativa de atualizar empresa com CNPJ duplicado', { id, agenciador_id, cnpj });
      return res.status(409).json({
        success: false,
        message: 'Já existe outra empresa com este CNPJ'
      });
    }

    // Atualizar empresa
    await db.promise().query(
      `UPDATE agenciador_empresas
       SET empresa_nome = ?, cnpj = ?, localizacao = ?, comissao_percentual = ?
       WHERE id = ? AND agenciador_id = ?`,
      [empresa_nome, cnpj, localizacao, comissao_percentual, id, agenciador_id]
    );

    logger.info('Empresa atualizada com sucesso', { id, agenciador_id });

    return res.status(200).json({
      success: true,
      message: 'Empresa atualizada com sucesso',
      data: {
        id,
        agenciador_id,
        empresa_nome,
        cnpj,
        localizacao,
        comissao_percentual
      }
    });

  } catch (erro) {
    logger.error('Erro ao atualizar empresa', { erro: erro.message });
    return res.status(500).json(errorHandler.handle(erro));
  }
});

/**
 * DELETE /api/agenciador-empresas/:id
 * Deletar empresa (soft delete)
 */
router.delete('/:id', verificarAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;
    const agenciador_id = req.usuario.agenciador_id;

    // Verificar se empresa existe
    const [empresaExistente] = await db.promise().query(
      'SELECT id FROM agenciador_empresas WHERE id = ? AND agenciador_id = ?',
      [id, agenciador_id]
    );

    if (empresaExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Soft delete
    await db.promise().query(
      'UPDATE agenciador_empresas SET ativo = false WHERE id = ? AND agenciador_id = ?',
      [id, agenciador_id]
    );

    logger.info('Empresa deletada com sucesso', { id, agenciador_id });

    return res.status(200).json({
      success: true,
      message: 'Empresa deletada com sucesso'
    });

  } catch (erro) {
    logger.error('Erro ao deletar empresa', { erro: erro.message });
    return res.status(500).json(errorHandler.handle(erro));
  }
});

module.exports = router;
