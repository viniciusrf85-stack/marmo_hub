const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware de autenticação
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Garantir que tipo_entidade existe (compatibilidade com tokens antigos)
    if (!decoded.tipo_entidade && decoded.tipo) {
      decoded.tipo_entidade = decoded.tipo;
    }
    
    req.user = decoded;
    
    // Debug apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH] Token decodificado:', {
        id: decoded.id,
        tipo_entidade: decoded.tipo_entidade
      });
    }
    
    // Verificar se a entidade ainda existe e está ativa
    const connection = await pool.getConnection();
    try {
      const { tipo_entidade, id } = decoded;
      
      if (tipo_entidade === 'conta') {
        const [contas] = await connection.execute(
          'SELECT id FROM contas WHERE id = ? AND ativa = TRUE',
          [id]
        );
        if (contas.length === 0) {
          return res.status(401).json({ error: 'Conta inativa ou não encontrada' });
        }
      } else if (tipo_entidade === 'usuario') {
        const [usuarios] = await connection.execute(
          'SELECT id FROM usuarios WHERE id = ? AND ativo = TRUE',
          [id]
        );
        if (usuarios.length === 0) {
          return res.status(401).json({ error: 'Usuário inativo ou não encontrado' });
        }
      } else if (tipo_entidade === 'administrador') {
        const [admins] = await connection.execute(
          'SELECT id FROM usuarios_administradores WHERE id = ? AND ativo = TRUE',
          [id]
        );
        if (admins.length === 0) {
          return res.status(401).json({ error: 'Administrador inativo ou não encontrado' });
        }
      }
    } finally {
      connection.release();
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar tipo de entidade
const checkTipo = (...tipos) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('checkTipo: req.user não existe');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Debug apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('[CHECKTYPE] Verificando tipos:', {
        atual: req.user.tipo_entidade || req.user.tipo,
        esperados: tipos
      });
    }

    // Verificar tipo_entidade ou tipo (compatibilidade)
    const tipoAtual = req.user.tipo_entidade || req.user.tipo;
    
    if (!tipoAtual) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: 'Token inválido: tipo de entidade não encontrado',
          code: 403
        }
      });
    }

    if (!tipos.includes(tipoAtual)) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: 'Acesso negado. Você não tem permissão para acessar este recurso.',
          code: 403
        }
      });
    }

    next();
  };
};

// Middleware para verificar se é conta aprovada
const checkContaAprovada = async (req, res, next) => {
  if (!req.user || req.user.tipo_entidade !== 'conta') {
    return res.status(403).json({ error: 'Acesso restrito a contas aprovadas' });
  }

  // Verificar se conta está aprovada
  const connection = await pool.getConnection();
  try {
    const [contas] = await connection.execute(
      'SELECT aprovada FROM contas WHERE id = ?',
      [req.user.id]
    );

    if (contas.length === 0 || !contas[0].aprovada) {
      return res.status(403).json({ 
        error: 'Sua conta ainda não foi aprovada. Aguarde a aprovação do administrador.' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar aprovação:', error);
    res.status(500).json({ error: 'Erro ao verificar aprovação' });
  } finally {
    connection.release();
  }
};

// Manter compatibilidade com código antigo (deprecated)
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Mapear tipos antigos para novos
    const tipoMap = {
      'administrador': 'administrador',
      'empresa': 'conta',
      'cliente': 'usuario'
    };

    const tipoAtual = tipoMap[req.user.tipo_usuario] || req.user.tipo_entidade;

    if (!roles.some(role => {
      const tipoEsperado = tipoMap[role] || role;
      return tipoEsperado === tipoAtual;
    })) {
      return res.status(403).json({ 
        error: 'Acesso negado. Você não tem permissão para acessar este recurso.' 
      });
    }

    next();
  };
};

module.exports = { auth, checkTipo, checkContaAprovada, checkRole };