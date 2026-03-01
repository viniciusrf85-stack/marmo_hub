const { body, query, param, validationResult } = require('express-validator');
const { errors } = require('./errorHandler');

/**
 * Middleware para validação de entrada
 * Verifica se há erros de validação e retorna resposta apropriada
 */
const validate = (req, res, next) => {
  const validationErrors = validationResult(req);
  
  if (!validationErrors.isEmpty()) {
    const errorDetails = validationErrors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Erro de validação',
        code: 400,
        details: errorDetails
      },
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Validadores para autenticação
 */
const authValidators = {
  // Validação de registro de conta (empresa)
  registroConta: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('senha')
      .isLength({ min: 8 })
      .withMessage('Senha deve ter no mínimo 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter maiúsculas, minúsculas e números'),
    body('razao_social')
      .trim()
      .notEmpty()
      .withMessage('Razão social é obrigatória')
      .isLength({ min: 3, max: 255 })
      .withMessage('Razão social deve ter entre 3 e 255 caracteres'),
    body('nome_fantasia')
      .trim()
      .notEmpty()
      .withMessage('Nome fantasia é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome fantasia deve ter entre 3 e 255 caracteres'),
    body('cnpj')
      .trim()
      .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)
      .withMessage('CNPJ inválido'),
    body('telefone_comercial')
      .optional()
      .trim()
      .matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/)
      .withMessage('Telefone inválido'),
    body('whatsapp')
      .optional()
      .trim()
      .matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/)
      .withMessage('WhatsApp inválido'),
    body('email_comercial')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email comercial inválido'),
    body('cep')
      .optional()
      .trim()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP inválido'),
    body('plano_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID do plano inválido')
  ],

  // Validação de registro de usuário (consumidor)
  registroUsuario: [
    body('nome')
      .trim()
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('senha')
      .isLength({ min: 8 })
      .withMessage('Senha deve ter no mínimo 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter maiúsculas, minúsculas e números'),
    body('telefone')
      .optional()
      .trim()
      .matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/)
      .withMessage('Telefone inválido'),
    body('tipo_documento')
      .isIn(['cpf', 'cnpj'])
      .withMessage('Tipo de documento inválido'),
    body('cpf')
      .if(() => body('tipo_documento').equals('cpf'))
      .trim()
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/)
      .withMessage('CPF inválido'),
    body('cnpj')
      .if(() => body('tipo_documento').equals('cnpj'))
      .trim()
      .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)
      .withMessage('CNPJ inválido'),
    body('tipo_consumidor')
      .notEmpty()
      .withMessage('Tipo de consumidor é obrigatório')
      .isIn(['marmorista', 'arquiteto', 'designer', 'construtor', 'outro'])
      .withMessage('Tipo de consumidor inválido'),
    body('cep')
      .optional()
      .trim()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP inválido')
  ],

  // Validação de login
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('senha')
      .notEmpty()
      .withMessage('Senha é obrigatória')
  ]
};

/**
 * Validadores para materiais
 */
const materiaisValidators = {
  criar: [
    body('nome')
      .trim()
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    body('tipo_material_id')
      .isInt({ min: 1 })
      .withMessage('Tipo de material inválido'),
    body('descricao')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Descrição não pode exceder 2000 caracteres'),
    body('valor_m2')
      .isFloat({ min: 0 })
      .withMessage('Valor deve ser um número positivo'),
    body('cor_predominante')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Cor não pode exceder 100 caracteres'),
    body('acabamento')
      .optional()
      .trim()
      .isIn(['polido', 'flameado', 'apoiado', 'escovado', 'outro'])
      .withMessage('Acabamento inválido')
  ],

  listar: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve estar entre 1 e 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset deve ser um número não-negativo'),
    query('preco_min')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço mínimo inválido'),
    query('preco_max')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço máximo inválido'),
    query('tipo_material_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Tipo de material inválido')
  ]
};

/**
 * Validadores para contas
 */
const contasValidators = {
  atualizar: [
    body('razao_social')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Razão social deve ter entre 3 e 255 caracteres'),
    body('nome_fantasia')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome fantasia deve ter entre 3 e 255 caracteres'),
    body('telefone_comercial')
      .optional()
      .trim()
      .matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/)
      .withMessage('Telefone inválido'),
    body('whatsapp')
      .optional()
      .trim()
      .matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/)
      .withMessage('WhatsApp inválido'),
    body('email_comercial')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email comercial inválido'),
    body('cep')
      .optional()
      .trim()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP inválido')
  ]
};

/**
 * Validadores para contatos
 */
const contatosValidators = {
  criar: [
    body('material_id')
      .isInt({ min: 1 })
      .withMessage('ID do material inválido'),
    body('mensagem')
      .trim()
      .notEmpty()
      .withMessage('Mensagem é obrigatória')
      .isLength({ min: 5, max: 1000 })
      .withMessage('Mensagem deve ter entre 5 e 1000 caracteres'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('telefone')
      .optional()
      .trim()
      .matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/)
      .withMessage('Telefone inválido')
  ]
};

module.exports = {
  validate,
  authValidators,
  materiaisValidators,
  contasValidators,
  contatosValidators
};
