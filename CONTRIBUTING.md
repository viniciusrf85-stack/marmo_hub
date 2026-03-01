# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o marmo_hub! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## Código de Conduta

Todos os contribuidores devem seguir nosso código de conduta:

- Ser respeitoso com outros contribuidores
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

## Como Contribuir

### 1. Reportar Bugs

Se encontrar um bug, abra uma issue no GitHub com:

- **Título descritivo**: Descreva o problema brevemente
- **Descrição detalhada**: Explique o comportamento esperado vs. o atual
- **Passos para reproduzir**: Lista de passos para reproduzir o bug
- **Screenshots**: Se aplicável, adicione screenshots
- **Ambiente**: Sistema operacional, versão do Node.js, etc.

### 2. Sugerir Melhorias

Para sugerir uma melhoria:

- Use um **título descritivo**
- Forneça uma **descrição detalhada** da melhoria sugerida
- Liste **exemplos** de como a melhoria funcionaria
- Explique **por que** essa melhoria seria útil

### 3. Fazer um Pull Request

#### Passo 1: Fork o Repositório
```bash
git clone https://github.com/seu-usuario/marmo_hub.git
cd marmo_hub
```

#### Passo 2: Criar uma Branch
```bash
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug-fix
```

#### Passo 3: Fazer Alterações
- Siga os padrões de código do projeto
- Adicione testes para novas funcionalidades
- Atualize a documentação se necessário

#### Passo 4: Commit
```bash
git add .
git commit -m "feat(escopo): descrição da mudança"
```

**Padrão de Commit:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção

#### Passo 5: Push e Pull Request
```bash
git push origin feature/sua-feature
```

Depois, abra um Pull Request no GitHub com:
- Descrição clara das mudanças
- Referência a issues relacionadas
- Screenshots se aplicável

## Padrões de Código

### Backend (Node.js)

#### Estrutura de Arquivo
```javascript
// Imports
const express = require('express');
const { asyncHandler, errors } = require('../utils/errorHandler');

// Constantes
const CONSTANTS = { /* ... */ };

// Middleware
const middleware = (req, res, next) => { /* ... */ };

// Rotas
router.get('/endpoint', middleware, asyncHandler(async (req, res) => {
  try {
    // Implementação
    res.json({ success: true, data: {} });
  } catch (error) {
    if (error.statusCode) throw error;
    throw errors.DATABASE_ERROR('operação');
  }
}));

// Exports
module.exports = router;
```

#### Nomeação
- Variáveis: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Funções: `camelCase`
- Classes: `PascalCase`
- Arquivos: `kebab-case.js`

#### Comentários
```javascript
/**
 * Descrição da função
 * @param {type} param - Descrição do parâmetro
 * @returns {type} Descrição do retorno
 */
function meuFuncao(param) {
  // Implementação
}
```

### Frontend (React)

#### Estrutura de Componente
```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Component.module.css';

export default function Component({ prop }) {
  const { usuario } = useAuth();
  const [state, setState] = useState(null);

  useEffect(() => {
    // Efeito
  }, []);

  const handleAction = () => {
    // Ação
  };

  return <div className={styles.container}>Conteúdo</div>;
}
```

#### Nomeação
- Componentes: `PascalCase`
- Props: `camelCase`
- Estados: `camelCase`
- Handlers: `handleActionName`
- Arquivos: `ComponentName.jsx`

## Testes

### Adicionar Testes

Para novas funcionalidades, adicione testes:

```javascript
describe('Funcionalidade', () => {
  it('deve fazer algo', async () => {
    const result = await funcao();
    expect(result).toBe(esperado);
  });
});
```

### Executar Testes
```bash
cd backend
npm test
npm run test:coverage
```

## Documentação

### Atualizar Documentação

Se suas mudanças afetarem a documentação:

1. Atualize o README.md se necessário
2. Atualize arquivos relevantes em /docs
3. Adicione exemplos de uso
4. Atualize o CHANGELOG.md

## Processo de Review

1. Um mantenedor revisará seu PR
2. Pode haver pedidos de mudanças
3. Após aprovação, seu PR será mergeado
4. Sua contribuição será creditada

## Dúvidas?

Se tiver dúvidas:

1. Verifique a documentação existente
2. Procure por issues similares
3. Abra uma discussion no GitHub
4. Entre em contato com os mantenedores

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

Obrigado por contribuir! 🎉
