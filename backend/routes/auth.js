const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ============================================
// REGISTRO DE CONTA (Empresa Anunciante)
// ============================================
router.post('/registro-conta', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      email,
      senha,
      razao_social,
      nome_fantasia,
      cnpj,
      telefone_comercial,
      whatsapp,
      email_comercial,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      plano_id
    } = req.body;

    // Validações básicas
    if (!email || !senha || !razao_social || !nome_fantasia || !cnpj) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Verificar se email já existe (em contas, usuarios ou admins)
    const [existingConta] = await connection.execute(
      'SELECT id FROM contas WHERE email = ?',
      [email]
    );
    const [existingUsuario] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM usuarios_administradores WHERE email = ?',
      [email]
    );

    if (existingConta.length > 0 || existingUsuario.length > 0 || existingAdmin.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Verificar se CNPJ já existe
    const [existingCNPJ] = await connection.execute(
      'SELECT id FROM contas WHERE cnpj = ?',
      [cnpj]
    );

    if (existingCNPJ.length > 0) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }

    // Verificar plano selecionado
    let planoSelecionado = null;
    let anunciosDisponiveis = 0;
    
    if (plano_id) {
      const [planos] = await connection.execute(
        'SELECT * FROM planos WHERE id = ? AND ativo = TRUE',
        [plano_id]
      );
      
      if (planos.length === 0) {
        return res.status(400).json({ error: 'Plano selecionado não encontrado ou inativo' });
      }
      
      planoSelecionado = planos[0];
      anunciosDisponiveis = planoSelecionado.quantidade_anuncios;
    } else {
      // Se não selecionou plano, atribuir plano Prata (padrão)
      const [planosPrata] = await connection.execute(
        "SELECT * FROM planos WHERE nome = 'Prata' AND ativo = TRUE LIMIT 1"
      );
      
      if (planosPrata.length > 0) {
        planoSelecionado = planosPrata[0];
        anunciosDisponiveis = planoSelecionado.quantidade_anuncios;
        plano_id = planoSelecionado.id;
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir conta (campos opcionais podem ser NULL)
    const [result] = await connection.execute(
      `INSERT INTO contas (
        email, senha, razao_social, nome_fantasia, cnpj,
        telefone_comercial, whatsapp, email_comercial,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        plano_id, anuncios_disponiveis, data_inicio_plano
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        email, 
        hashedPassword, 
        razao_social, 
        nome_fantasia, 
        cnpj,
        telefone_comercial || null, 
        whatsapp || null, 
        email_comercial || email, // Se não fornecido, usa o email principal
        cep || null, 
        logradouro || null, 
        numero || null, 
        complemento || null, 
        bairro || null, 
        cidade || null, 
        estado || null,
        plano_id || null,
        anunciosDisponiveis
      ]
    );

    // Gerar token
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email, 
        tipo: 'conta',
        tipo_entidade: 'conta'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Preparar dados do usuário para o frontend
    const usuarioData = {
      id: result.insertId,
      email,
      nome_fantasia,
      nome: nome_fantasia, // Para compatibilidade
      cnpj,
      aprovada: false,
      tipo_entidade: 'conta'
    };

    res.status(201).json({
      message: 'Conta criada com sucesso. Aguardando aprovação.',
      token,
      usuario: usuarioData,
      tipo_entidade: 'conta'
    });

  } catch (error) {
    console.error('Erro no registro de conta:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  } finally {
    connection.release();
  }
});

// ============================================
// REGISTRO DE USUÁRIO (Consumidor)
// ============================================
router.post('/registro-usuario', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      nome,
      email,
      senha,
      telefone,
      tipo_documento,
      cpf,
      cnpj,
      tipo_consumidor,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado
    } = req.body;

    // Validações básicas
    if (!nome || !email || !senha || !tipo_documento || !tipo_consumidor) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Validar documento conforme tipo
    if (tipo_documento === 'cpf' && !cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório' });
    }
    if (tipo_documento === 'cnpj' && !cnpj) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    // Verificar se email já existe
    const [existingConta] = await connection.execute(
      'SELECT id FROM contas WHERE email = ?',
      [email]
    );
    const [existingUsuario] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM usuarios_administradores WHERE email = ?',
      [email]
    );

    if (existingConta.length > 0 || existingUsuario.length > 0 || existingAdmin.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Verificar se CPF/CNPJ já existe
    if (cpf) {
      const [existingCPF] = await connection.execute(
        'SELECT id FROM usuarios WHERE cpf = ?',
        [cpf]
      );
      if (existingCPF.length > 0) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }
    }

    if (cnpj) {
      const [existingCNPJ] = await connection.execute(
        'SELECT id FROM usuarios WHERE cnpj = ?',
        [cnpj]
      );
      if (existingCNPJ.length > 0) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const [result] = await connection.execute(
      `INSERT INTO usuarios (
        nome, email, senha, telefone,
        tipo_documento, cpf, cnpj,
        tipo_consumidor,
        cep, logradouro, numero, complemento, bairro, cidade, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome, email, hashedPassword, telefone,
        tipo_documento, cpf || null, cnpj || null,
        tipo_consumidor,
        cep || null, logradouro || null, numero || null, 
        complemento || null, bairro || null, cidade || null, estado || null
      ]
    );

    // Gerar token
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email, 
        tipo: 'usuario',
        tipo_entidade: 'usuario'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Preparar dados do usuário para o frontend
    const usuarioData = {
      id: result.insertId,
      nome,
      email,
      tipo_consumidor,
      tipo_entidade: 'usuario'
    };

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      usuario: usuarioData,
      tipo_entidade: 'usuario'
    });

  } catch (error) {
    console.error('Erro no registro de usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  } finally {
    connection.release();
  }
});

// ============================================
// LOGIN (Unificado - Conta, Usuário ou Admin)
// ============================================
router.post('/login', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    let user = null;
    let tipo_entidade = null;

    // Tentar encontrar em contas (empresas)
    const [contas] = await connection.execute(
      'SELECT * FROM contas WHERE email = ? AND ativa = TRUE',
      [email]
    );

    if (contas.length > 0) {
      user = contas[0];
      tipo_entidade = 'conta';
    } else {
      // Tentar encontrar em usuários (consumidores)
      const [usuarios] = await connection.execute(
        'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE',
        [email]
      );

      if (usuarios.length > 0) {
        user = usuarios[0];
        tipo_entidade = 'usuario';
      } else {
        // Tentar encontrar em administradores
        const [admins] = await connection.execute(
          'SELECT * FROM usuarios_administradores WHERE email = ? AND ativo = TRUE',
          [email]
        );

        if (admins.length > 0) {
          user = admins[0];
          tipo_entidade = 'administrador';
          console.log('Admin encontrado na tabela usuarios_administradores:', email);
        } else {
          // Fallback: verificar na tabela antiga usuarios (se ainda existir)
          try {
            const [usuariosAntigos] = await connection.execute(
              'SELECT * FROM usuarios WHERE email = ? AND tipo_usuario = ? AND ativo = TRUE',
              [email, 'administrador']
            );

            if (usuariosAntigos.length > 0) {
              user = usuariosAntigos[0];
              tipo_entidade = 'administrador';
              console.log('Admin encontrado na tabela usuarios (antiga):', email);
            } else {
              console.log('Admin não encontrado em nenhuma tabela:', email);
            }
          } catch (err) {
            // Tabela usuarios pode não ter mais tipo_usuario
            console.log('Tabela usuarios não tem tipo_usuario ou não existe');
          }
        }
      }
    }

    if (!user) {
      console.error('Login falhou - usuário não encontrado:', email);
      console.error('Tentou buscar em: contas, usuarios, usuarios_administradores');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar se a senha existe
    if (!user.senha) {
      console.error('Login falhou - senha não encontrada no registro:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(senha, user.senha);
    
    if (!validPassword) {
      console.error('Login falhou - senha incorreta para:', email);
      console.error('Hash da senha no banco:', user.senha.substring(0, 20) + '...');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    console.log('Login bem-sucedido:', { email, tipo_entidade, id: user.id });

    // Preparar dados do usuário conforme tipo (normalizado para frontend)
    let userData = {};
    if (tipo_entidade === 'conta') {
      userData = {
        id: user.id,
        email: user.email,
        nome_fantasia: user.nome_fantasia,
        nome: user.nome_fantasia, // Para compatibilidade
        cnpj: user.cnpj,
        aprovada: user.aprovada,
        plano_id: user.plano_id,
        tipo_entidade: 'conta'
      };
    } else if (tipo_entidade === 'usuario') {
      userData = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo_consumidor: user.tipo_consumidor,
        foto_perfil: user.foto_perfil,
        tipo_entidade: 'usuario'
      };
    } else if (tipo_entidade === 'administrador') {
      userData = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        foto_perfil: user.foto_perfil,
        tipo_entidade: 'administrador'
      };
    }

    // Gerar token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        tipo_entidade
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      usuario: userData,
      tipo_entidade
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  } finally {
    connection.release();
  }
});

// ============================================
// VERIFICAR TOKEN
// ============================================
router.get('/verificar', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { tipo_entidade, id } = req.user;

    if (tipo_entidade === 'conta') {
      const [contas] = await connection.execute(
        `SELECT id, email, razao_social, nome_fantasia, cnpj, 
                aprovada, ativa, plano_id, logo 
         FROM contas WHERE id = ? AND ativa = TRUE`,
        [id]
      );

      if (contas.length === 0) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      const conta = contas[0];
      return res.json({ 
        tipo_entidade: 'conta',
        usuario: {
          id: conta.id,
          email: conta.email,
          nome_fantasia: conta.nome_fantasia,
          nome: conta.nome_fantasia, // Para compatibilidade
          cnpj: conta.cnpj,
          aprovada: conta.aprovada,
          plano_id: conta.plano_id,
          logo: conta.logo,
          tipo_entidade: 'conta'
        }
      });
    }

    if (tipo_entidade === 'usuario') {
      const [usuarios] = await connection.execute(
        `SELECT id, nome, email, tipo_consumidor, foto_perfil 
         FROM usuarios WHERE id = ? AND ativo = TRUE`,
        [id]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const usuario = usuarios[0];
      return res.json({ 
        tipo_entidade: 'usuario',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo_consumidor: usuario.tipo_consumidor,
          foto_perfil: usuario.foto_perfil,
          tipo_entidade: 'usuario'
        }
      });
    }

    if (tipo_entidade === 'administrador') {
      const [admins] = await connection.execute(
        `SELECT id, nome, email, foto_perfil 
         FROM usuarios_administradores WHERE id = ? AND ativo = TRUE`,
        [id]
      );

      if (admins.length === 0) {
        return res.status(404).json({ error: 'Administrador não encontrado' });
      }

      const admin = admins[0];
      return res.json({ 
        tipo_entidade: 'administrador',
        usuario: {
          id: admin.id,
          nome: admin.nome,
          email: admin.email,
          foto_perfil: admin.foto_perfil,
          tipo_entidade: 'administrador'
        }
      });
    }

    return res.status(400).json({ error: 'Tipo de entidade inválido' });

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ error: 'Erro ao verificar token' });
  } finally {
    connection.release();
  }
});

// ============================================
// ALTERAR SENHA
// ============================================
router.post('/alterar-senha', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { senha_atual, senha_nova } = req.body;
    const { tipo_entidade, id } = req.user;

    if (!senha_atual || !senha_nova) {
      return res.status(400).json({ error: 'Senhas são obrigatórias' });
    }

    let tableName = '';
    let idColumn = 'id';

    if (tipo_entidade === 'conta') {
      tableName = 'contas';
    } else if (tipo_entidade === 'usuario') {
      tableName = 'usuarios';
    } else if (tipo_entidade === 'administrador') {
      tableName = 'usuarios_administradores';
    } else {
      return res.status(400).json({ error: 'Tipo de entidade inválido' });
    }

    // Buscar senha atual
    const [users] = await connection.execute(
      `SELECT senha FROM ${tableName} WHERE ${idColumn} = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    // Verificar senha atual
    const validPassword = await bcrypt.compare(senha_atual, users[0].senha);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(senha_nova, 10);

    // Atualizar senha
    await connection.execute(
      `UPDATE ${tableName} SET senha = ? WHERE ${idColumn} = ?`,
      [hashedPassword, id]
    );

    res.json({ message: 'Senha alterada com sucesso' });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  } finally {
    connection.release();
  }
});

module.exports = router;
