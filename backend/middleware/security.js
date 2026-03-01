const helmet = require('helmet');

/**
 * Configuração de segurança com Helmet
 * Adiciona headers HTTP de segurança
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

/**
 * Middleware para sanitização básica de entrada
 * Remove caracteres perigosos de strings
 */
const sanitizeInput = (req, res, next) => {
  // Função para sanitizar valores
  const sanitize = (value) => {
    if (typeof value === 'string') {
      // Remove caracteres de controle e XSS básicos
      return value
        .replace(/[<>]/g, '') // Remove < e >
        .replace(/javascript:/gi, '') // Remove javascript:
        .trim();
    }
    return value;
  };

  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitize(req.body[key]);
    });
  }

  // Sanitizar query
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitize(req.query[key]);
    });
  }

  // Sanitizar params
  if (req.params && typeof req.params === 'object') {
    Object.keys(req.params).forEach(key => {
      req.params[key] = sanitize(req.params[key]);
    });
  }

  next();
};

/**
 * Middleware para validação de Content-Type
 * Garante que apenas JSON é aceito em POST/PUT/PATCH
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Content-Type deve ser application/json',
          code: 400
        },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  next();
};

/**
 * Middleware para adicionar headers de segurança customizados
 */
const customSecurityHeaders = (req, res, next) => {
  // Previne MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Previne clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Habilita XSS protection no IE
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Previne referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Força HTTPS (será habilitado em produção com domínio)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Desabilita cache de dados sensíveis
  if (req.path.includes('/auth') || req.path.includes('/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

module.exports = {
  securityHeaders,
  sanitizeInput,
  validateContentType,
  customSecurityHeaders
};
