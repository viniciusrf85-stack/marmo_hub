/**
 * Testes para validadores
 * Executar com: npm test
 */

const { body, validationResult } = require('express-validator');
const { authValidators } = require('../utils/validators');

describe('Validadores', () => {
  describe('Validação de Email', () => {
    it('deve aceitar email válido', async () => {
      const validator = body('email').isEmail();
      const req = { body: { email: 'teste@exemplo.com' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve rejeitar email inválido', async () => {
      const validator = body('email').isEmail();
      const req = { body: { email: 'email-invalido' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('Validação de Senha', () => {
    it('deve aceitar senha forte', async () => {
      const validators = [
        body('senha').isLength({ min: 8 }),
        body('senha').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ];

      const req = { body: { senha: 'SenhaForte123' } };
      
      for (const validator of validators) {
        await validator.run(req);
      }
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve rejeitar senha muito curta', async () => {
      const validator = body('senha').isLength({ min: 8 });
      const req = { body: { senha: '123' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });

    it('deve rejeitar senha sem maiúsculas', async () => {
      const validator = body('senha').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);
      const req = { body: { senha: 'senhafraca123' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });

    it('deve rejeitar senha sem números', async () => {
      const validator = body('senha').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);
      const req = { body: { senha: 'SenhaFraca' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('Validação de CNPJ', () => {
    it('deve aceitar CNPJ com formatação', async () => {
      const validator = body('cnpj').matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/);
      const req = { body: { cnpj: '12.345.678/0001-90' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve aceitar CNPJ sem formatação', async () => {
      const validator = body('cnpj').matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/);
      const req = { body: { cnpj: '12345678000190' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve rejeitar CNPJ inválido', async () => {
      const validator = body('cnpj').matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/);
      const req = { body: { cnpj: 'cnpj-invalido' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('Validação de CPF', () => {
    it('deve aceitar CPF com formatação', async () => {
      const validator = body('cpf').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/);
      const req = { body: { cpf: '123.456.789-10' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve aceitar CPF sem formatação', async () => {
      const validator = body('cpf').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/);
      const req = { body: { cpf: '12345678910' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve rejeitar CPF inválido', async () => {
      const validator = body('cpf').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/);
      const req = { body: { cpf: 'cpf-invalido' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('Validação de Telefone', () => {
    it('deve aceitar telefone com formatação', async () => {
      const validator = body('telefone').matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/);
      const req = { body: { telefone: '(27) 99999-9999' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve aceitar telefone sem formatação', async () => {
      const validator = body('telefone').matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/);
      const req = { body: { telefone: '27999999999' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve rejeitar telefone inválido', async () => {
      const validator = body('telefone').matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/);
      const req = { body: { telefone: '123' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('Validação de CEP', () => {
    it('deve aceitar CEP com formatação', async () => {
      const validator = body('cep').matches(/^\d{5}-?\d{3}$/);
      const req = { body: { cep: '29000-000' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve aceitar CEP sem formatação', async () => {
      const validator = body('cep').matches(/^\d{5}-?\d{3}$/);
      const req = { body: { cep: '29000000' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve rejeitar CEP inválido', async () => {
      const validator = body('cep').matches(/^\d{5}-?\d{3}$/);
      const req = { body: { cep: 'cep-invalido' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('Validação de Comprimento de String', () => {
    it('deve aceitar string dentro do comprimento permitido', async () => {
      const validator = body('nome').isLength({ min: 3, max: 255 });
      const req = { body: { nome: 'João Silva' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    it('deve rejeitar string muito curta', async () => {
      const validator = body('nome').isLength({ min: 3, max: 255 });
      const req = { body: { nome: 'Jo' } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });

    it('deve rejeitar string muito longa', async () => {
      const validator = body('nome').isLength({ min: 3, max: 255 });
      const req = { body: { nome: 'a'.repeat(300) } };
      
      await validator.run(req);
      const errors = validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });
  });
});
