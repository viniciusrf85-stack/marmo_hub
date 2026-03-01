const { log } = require('../utils/logger');

/**
 * Middleware para auditoria de ações sensíveis
 * Registra todas as operações críticas do sistema
 */
const auditLog = (action, resourceType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Apenas registrar se a operação foi bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        log.business(`${action} - ${resourceType}`, {
          userId: req.user?.id,
          userEmail: req.user?.email,
          userType: req.user?.tipo_entidade,
          method: req.method,
          path: req.path,
          resourceId: req.params.id,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString()
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware para registrar tentativas de acesso não autorizado
 */
const auditSecurityEvent = (req, res, next) => {
  // Interceptar respostas de erro de segurança
  const originalSend = res.send;
  
  res.send = function(data) {
    // Registrar erros de autenticação e autorização
    if (res.statusCode === 401 || res.statusCode === 403) {
      log.security(`Acesso negado`, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        userId: req.user?.id,
        userEmail: req.user?.email,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware para registrar operações de dados sensíveis
 */
const auditDataAccess = (dataType) => {
  return (req, res, next) => {
    log.business(`Acesso a dados sensíveis - ${dataType}`, {
      userId: req.user?.id,
      userEmail: req.user?.email,
      userType: req.user?.tipo_entidade,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString()
    });
    
    next();
  };
};

module.exports = {
  auditLog,
  auditSecurityEvent,
  auditDataAccess
};
