/**
 * Documentação Swagger/OpenAPI para a API marmo_hub
 * Acesse em: http://localhost:3001/api-docs
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OLX Pedra - Marketplace de Pedras Ornamentais',
      version: '1.0.0',
      description: 'API REST para marketplace de granito e mármore',
      contact: {
        name: 'Suporte',
        email: 'suporte@olxpedra.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://api.olxpedra.com',
        description: 'Servidor de produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Conta: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            razao_social: { type: 'string' },
            nome_fantasia: { type: 'string' },
            cnpj: { type: 'string' },
            aprovada: { type: 'boolean' },
            ativa: { type: 'boolean' },
            plano_id: { type: 'integer' },
            data_cadastro: { type: 'string', format: 'date-time' }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            email: { type: 'string', format: 'email' },
            tipo_documento: { type: 'string', enum: ['cpf', 'cnpj'] },
            cpf: { type: 'string' },
            cnpj: { type: 'string' },
            tipo_consumidor: { type: 'string' },
            ativo: { type: 'boolean' },
            data_cadastro: { type: 'string', format: 'date-time' }
          }
        },
        Material: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
            tipo_material_id: { type: 'integer' },
            conta_id: { type: 'integer' },
            valor_m2: { type: 'number' },
            cor_predominante: { type: 'string' },
            acabamento: { type: 'string' },
            aprovado: { type: 'boolean' },
            ativo: { type: 'boolean' },
            data_cadastro: { type: 'string', format: 'date-time' }
          }
        },
        Erro: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                code: { type: 'integer' },
                details: { type: 'object' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/auth.js',
    './routes/contas.js',
    './routes/materiais.js',
    './routes/usuarios.js',
    './routes/dashboard.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
