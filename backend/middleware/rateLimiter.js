const rateLimit = require('express-rate-limit');

/**
 * Rate limiter geral para a API
 * Limita a 100 requisições por 15 minutos por IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por janela
  message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
  standardHeaders: true, // Retorna informações de rate limit nos headers RateLimit-*
  legacyHeaders: false, // Desabilita headers X-RateLimit-*
  skip: (req) => {
    // Não aplicar rate limit a health checks
    return req.path === '/health';
  }
});

/**
 * Rate limiter estrito para login
 * Limita a 5 tentativas por 15 minutos por IP
 * Previne brute force
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // limite de 5 tentativas
  message: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.',
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para registro
 * Limita a 3 registros por hora por IP
 * Previne spam de contas
 */
const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // limite de 3 registros
  message: 'Muitos registros deste IP. Por favor, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para upload de arquivos
 * Limita a 10 uploads por hora por IP
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // limite de 10 uploads
  message: 'Muitos uploads. Por favor, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para contatos
 * Limita a 20 contatos por hora por IP
 * Previne spam de mensagens
 */
const contatoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // limite de 20 contatos
  message: 'Muitos contatos enviados. Por favor, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registroLimiter,
  uploadLimiter,
  contatoLimiter
};
