/**
 * Middleware de cache para otimizar performance
 * Pode usar Redis ou cache em memória
 */

// Cache em memória simples (sem Redis)
// Para produção, considere usar Redis
const memoryCache = new Map();

/**
 * Configuração de TTL (Time To Live) para diferentes tipos de dados
 */
const CACHE_TTL = {
  planos: 60 * 60 * 1000, // 1 hora
  tipos_materiais: 60 * 60 * 1000, // 1 hora
  materiais: 5 * 60 * 1000, // 5 minutos
  contas: 10 * 60 * 1000, // 10 minutos
  usuarios: 10 * 60 * 1000, // 10 minutos
  default: 5 * 60 * 1000 // 5 minutos
};

/**
 * Armazenar valor em cache
 */
const setCache = (key, value, ttl = CACHE_TTL.default) => {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttl
  });
};

/**
 * Recuperar valor do cache
 */
const getCache = (key) => {
  const cached = memoryCache.get(key);
  
  if (!cached) {
    return null;
  }
  
  // Verificar se expirou
  if (Date.now() > cached.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.value;
};

/**
 * Limpar cache específico
 */
const clearCache = (key) => {
  memoryCache.delete(key);
};

/**
 * Limpar cache por padrão
 */
const clearCacheByPattern = (pattern) => {
  const regex = new RegExp(pattern);
  
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }
};

/**
 * Limpar todo o cache
 */
const clearAllCache = () => {
  memoryCache.clear();
};

/**
 * Middleware para cache de GET requests
 */
const cacheMiddleware = (cacheDuration = CACHE_TTL.default) => {
  return (req, res, next) => {
    // Apenas cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Não cachear se houver parâmetros de busca específicos
    if (req.query.search || req.query.filtro) {
      return next();
    }
    
    const cacheKey = `${req.method}:${req.originalUrl}`;
    const cachedData = getCache(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Interceptar a resposta
    const originalSend = res.send;
    res.send = function(data) {
      // Cachear apenas respostas bem-sucedidas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
          setCache(cacheKey, jsonData, cacheDuration);
        } catch (e) {
          // Ignorar se não conseguir fazer parse
        }
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware para invalidar cache em operações de escrita
 */
const invalidateCacheOnWrite = (pattern) => {
  return (req, res, next) => {
    // Interceptar a resposta
    const originalSend = res.send;
    res.send = function(data) {
      // Invalidar cache se a operação foi bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        clearCacheByPattern(pattern);
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Funções de cache específicas para diferentes recursos
 */
const cache = {
  // Planos
  getPlanos: () => getCache('GET:/api/planos'),
  setPlanos: (data) => setCache('GET:/api/planos', data, CACHE_TTL.planos),
  clearPlanos: () => clearCacheByPattern('^GET:/api/planos'),
  
  // Tipos de materiais
  getTiposMateriais: () => getCache('GET:/api/tipos-materiais'),
  setTiposMateriais: (data) => setCache('GET:/api/tipos-materiais', data, CACHE_TTL.tipos_materiais),
  clearTiposMateriais: () => clearCacheByPattern('^GET:/api/tipos-materiais'),
  
  // Materiais
  getMateriais: (query) => getCache(`GET:/api/materiais?${query}`),
  setMateriais: (query, data) => setCache(`GET:/api/materiais?${query}`, data, CACHE_TTL.materiais),
  clearMateriais: () => clearCacheByPattern('^GET:/api/materiais'),
  
  // Contas
  getContas: () => getCache('GET:/api/contas'),
  setContas: (data) => setCache('GET:/api/contas', data, CACHE_TTL.contas),
  clearContas: () => clearCacheByPattern('^GET:/api/contas'),
  
  // Usuários
  getUsuarios: () => getCache('GET:/api/usuarios'),
  setUsuarios: (data) => setCache('GET:/api/usuarios', data, CACHE_TTL.usuarios),
  clearUsuarios: () => clearCacheByPattern('^GET:/api/usuarios'),
  
  // Limpar tudo
  clearAll: clearAllCache
};

/**
 * Obter estatísticas do cache
 */
const getCacheStats = () => {
  return {
    size: memoryCache.size,
    entries: Array.from(memoryCache.entries()).map(([key, value]) => ({
      key,
      expiresIn: Math.max(0, value.expiresAt - Date.now()),
      isExpired: Date.now() > value.expiresAt
    }))
  };
};

module.exports = {
  cacheMiddleware,
  invalidateCacheOnWrite,
  cache,
  getCacheStats,
  setCache,
  getCache,
  clearCache,
  clearCacheByPattern,
  clearAllCache,
  CACHE_TTL
};
