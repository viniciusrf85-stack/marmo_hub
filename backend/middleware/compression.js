const compression = require('compression');

/**
 * Configuração de compressão gzip para respostas
 * Reduz tamanho das respostas em ~70%
 */
const compressionMiddleware = compression({
  // Nível de compressão (0-9, padrão 6)
  // 6 é um bom balanço entre compressão e performance
  level: 6,
  
  // Apenas comprimir respostas maiores que 1KB
  threshold: 1024,
  
  // Tipos de conteúdo a comprimir
  filter: (req, res) => {
    // Não comprimir se o cliente não suporta
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Comprimir apenas JSON e texto
    return compression.filter(req, res);
  }
});

module.exports = compressionMiddleware;
