const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Configuração de cores para logs no console
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  security: 'magenta'
};

winston.addColors(colors);

/**
 * Formato customizado para logs
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

/**
 * Logger principal
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'marmo_hub-api' },
  transports: [
    // Log de erro em arquivo separado
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Log de segurança
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880,
      maxFiles: 5
    }),
    
    // Log geral
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Adicionar console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      customFormat
    )
  }));
}

/**
 * Middleware para logging de requisições
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log da requisição
  logger.info('Requisição recebida', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Interceptar resposta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log da resposta
    logger.info('Resposta enviada', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Funções de logging específicas
 */
const log = {
  // Log de autenticação
  auth: (action, data) => {
    logger.info(`[AUTH] ${action}`, data);
  },
  
  // Log de segurança
  security: (action, data) => {
    logger.warn(`[SECURITY] ${action}`, data);
  },
  
  // Log de erro
  error: (action, error, data) => {
    logger.error(`[ERROR] ${action}`, {
      message: error.message,
      stack: error.stack,
      ...data
    });
  },
  
  // Log de banco de dados
  database: (action, data) => {
    logger.debug(`[DATABASE] ${action}`, data);
  },
  
  // Log de negócio
  business: (action, data) => {
    logger.info(`[BUSINESS] ${action}`, data);
  },
  
  // Log de performance
  performance: (action, duration, data) => {
    logger.info(`[PERFORMANCE] ${action}`, {
      duration: `${duration}ms`,
      ...data
    });
  }
};

module.exports = {
  logger,
  log,
  requestLogger
};
