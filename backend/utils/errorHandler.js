/**
 * Classe customizada para erros da API
 * Fornece tratamento consistente de erros em toda a aplicação
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Middleware para tratamento global de erros
 * Deve ser usado como último middleware no Express
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro (será melhorado na Fase 2)
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode: err.statusCode || 500,
    message: err.message,
    details: err.details
  });

  // Determinar status code
  const statusCode = err.statusCode || 500;
  
  // Preparar resposta de erro
  const response = {
    success: false,
    error: {
      message: err.message,
      code: statusCode
    }
  };

  // Adicionar detalhes em desenvolvimento
  if (process.env.NODE_ENV === 'development' && err.details) {
    response.error.details = err.details;
  }

  // Adicionar timestamp
  response.timestamp = new Date().toISOString();

  res.status(statusCode).json(response);
};

/**
 * Wrapper para rotas async que captura erros
 * Uso: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Erros padrão da aplicação
 */
const errors = {
  // Autenticação (401)
  UNAUTHORIZED: (message = 'Não autorizado') => 
    new ApiError(message, 401),
  
  TOKEN_INVALID: () => 
    new ApiError('Token inválido ou expirado', 401),
  
  TOKEN_MISSING: () => 
    new ApiError('Token não fornecido', 401),
  
  // Permissão (403)
  FORBIDDEN: (message = 'Acesso negado') => 
    new ApiError(message, 403),
  
  ACCOUNT_NOT_APPROVED: () => 
    new ApiError('Sua conta ainda não foi aprovada. Aguarde a aprovação do administrador.', 403),
  
  // Não encontrado (404)
  NOT_FOUND: (resource = 'Recurso') => 
    new ApiError(`${resource} não encontrado`, 404),
  
  // Validação (400)
  VALIDATION_ERROR: (message = 'Erro de validação', details = null) => 
    new ApiError(message, 400, details),
  
  MISSING_FIELDS: (fields = []) => 
    new ApiError('Campos obrigatórios faltando', 400, { fields }),
  
  DUPLICATE_EMAIL: () => 
    new ApiError('Email já cadastrado', 400),
  
  DUPLICATE_CNPJ: () => 
    new ApiError('CNPJ já cadastrado', 400),
  
  DUPLICATE_CPF: () => 
    new ApiError('CPF já cadastrado', 400),
  
  INVALID_CREDENTIALS: () => 
    new ApiError('Credenciais inválidas', 401),
  
  // Servidor (500)
  INTERNAL_ERROR: (message = 'Erro interno do servidor') => 
    new ApiError(message, 500),
  
  DATABASE_ERROR: (operation = 'operação') => 
    new ApiError(`Erro ao realizar ${operation}`, 500),
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
  errors
};
