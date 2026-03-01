/**
 * Testes para rotas de autenticação
 * Executar com: npm test
 */

const request = require('supertest');
const app = require('../server');

describe('Autenticação', () => {
  // Dados de teste
  const contaTeste = {
    email: 'empresa@teste.com',
    senha: 'Senha123',
    razao_social: 'Empresa Teste LTDA',
    nome_fantasia: 'Empresa Teste',
    cnpj: '12.345.678/0001-90'
  };

  const usuarioTeste = {
    nome: 'Usuário Teste',
    email: 'usuario@teste.com',
    senha: 'Senha123',
    tipo_documento: 'cpf',
    cpf: '123.456.789-10',
    tipo_consumidor: 'marmorista'
  };

  describe('POST /api/auth/registro-conta', () => {
    it('deve registrar uma nova conta com sucesso', async () => {
      const res = await request(app)
        .post('/api/auth/registro-conta')
        .send(contaTeste);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.usuario.email).toBe(contaTeste.email);
      expect(res.body.usuario.tipo_entidade).toBe('conta');
    });

    it('deve rejeitar email duplicado', async () => {
      // Primeira requisição
      await request(app)
        .post('/api/auth/registro-conta')
        .send(contaTeste);

      // Segunda requisição com mesmo email
      const res = await request(app)
        .post('/api/auth/registro-conta')
        .send(contaTeste);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Email');
    });

    it('deve validar campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/auth/registro-conta')
        .send({
          email: 'teste@teste.com',
          // Faltam outros campos obrigatórios
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('deve validar formato de email', async () => {
      const res = await request(app)
        .post('/api/auth/registro-conta')
        .send({
          ...contaTeste,
          email: 'email-invalido'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('deve validar força de senha', async () => {
      const res = await request(app)
        .post('/api/auth/registro-conta')
        .send({
          ...contaTeste,
          senha: '123' // Muito fraca
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('deve validar formato de CNPJ', async () => {
      const res = await request(app)
        .post('/api/auth/registro-conta')
        .send({
          ...contaTeste,
          cnpj: 'cnpj-invalido'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/registro-usuario', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const res = await request(app)
        .post('/api/auth/registro-usuario')
        .send(usuarioTeste);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.usuario.email).toBe(usuarioTeste.email);
      expect(res.body.usuario.tipo_entidade).toBe('usuario');
    });

    it('deve rejeitar email duplicado', async () => {
      // Primeira requisição
      await request(app)
        .post('/api/auth/registro-usuario')
        .send(usuarioTeste);

      // Segunda requisição com mesmo email
      const res = await request(app)
        .post('/api/auth/registro-usuario')
        .send(usuarioTeste);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('deve validar tipo_consumidor', async () => {
      const res = await request(app)
        .post('/api/auth/registro-usuario')
        .send({
          ...usuarioTeste,
          tipo_consumidor: 'tipo-invalido'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Registrar usuário antes de testar login
      await request(app)
        .post('/api/auth/registro-usuario')
        .send(usuarioTeste);
    });

    it('deve fazer login com sucesso', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: usuarioTeste.email,
          senha: usuarioTeste.senha
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.usuario.email).toBe(usuarioTeste.email);
    });

    it('deve rejeitar senha incorreta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: usuarioTeste.email,
          senha: 'SenhaErrada123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('deve rejeitar email não encontrado', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@teste.com',
          senha: 'Senha123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('deve validar campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: usuarioTeste.email
          // Falta senha
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/verificar', () => {
    let token;

    beforeEach(async () => {
      // Registrar e obter token
      const res = await request(app)
        .post('/api/auth/registro-usuario')
        .send(usuarioTeste);

      token = res.body.token;
    });

    it('deve verificar token válido', async () => {
      const res = await request(app)
        .get('/api/auth/verificar')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.usuario.email).toBe(usuarioTeste.email);
    });

    it('deve rejeitar token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/verificar')
        .set('Authorization', 'Bearer token-invalido');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app)
        .get('/api/auth/verificar');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
