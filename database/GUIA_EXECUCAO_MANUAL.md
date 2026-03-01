# 📖 Guia de Execução Manual - Sistema de Vendas para Agenciadores

## Visão Geral

Este guia fornece instruções passo a passo para executar os scripts SQL manualmente no seu banco de dados MySQL.

---

## 🔧 Pré-requisitos

- MySQL 5.7+ instalado
- Banco de dados `olx_pedra` já criado
- Acesso com privilégios de administrador
- Cliente MySQL (Workbench, phpMyAdmin, DBeaver, etc)

---

## 📋 Arquivos Necessários

1. **EXECUTAR_SCHEMA_MANUAL.sql** - Cria todas as tabelas e views
2. **DADOS_EXEMPLO_TESTE.sql** - Insere dados de teste
3. **vendas_agenciadores_queries.sql** - Queries úteis para consultas

---

## 🚀 Passo a Passo

### Opção 1: Usando MySQL Workbench

#### Passo 1: Abrir o Arquivo
1. Abra o MySQL Workbench
2. Conecte-se ao seu servidor MySQL
3. Clique em **File** → **Open SQL Script**
4. Selecione o arquivo `EXECUTAR_SCHEMA_MANUAL.sql`

#### Passo 2: Selecionar o Banco de Dados
1. Na parte superior, selecione o banco de dados **olx_pedra**
2. Ou execute:
```sql
USE olx_pedra;
```

#### Passo 3: Executar o Script
1. Clique no botão **Execute** (raio) ou pressione **Ctrl+Shift+Enter**
2. Aguarde a conclusão
3. Verifique se não há erros na aba **Output**

#### Passo 4: Verificar as Tabelas
Execute a query abaixo para verificar se todas as tabelas foram criadas:
```sql
SHOW TABLES LIKE '%agenciador%';
SHOW TABLES LIKE '%venda%';
SHOW TABLES LIKE '%parcela%';
SHOW TABLES LIKE '%comissao%';
SHOW TABLES LIKE '%recebimento%';
SHOW TABLES LIKE '%cliente%';
SHOW TABLES LIKE '%importacao%';
SHOW TABLES LIKE '%relatorio%';
```

#### Passo 5: Verificar as Views
```sql
SHOW FULL TABLES FROM olx_pedra WHERE TABLE_TYPE LIKE 'VIEW';
```

---

### Opção 2: Usando phpMyAdmin

#### Passo 1: Acessar phpMyAdmin
1. Abra seu navegador
2. Acesse `http://localhost/phpmyadmin` (ou seu servidor)
3. Faça login com suas credenciais

#### Passo 2: Selecionar o Banco de Dados
1. Na lista à esquerda, clique em **olx_pedra**

#### Passo 3: Abrir a Aba SQL
1. Clique na aba **SQL** no topo

#### Passo 4: Copiar e Colar o Script
1. Abra o arquivo `EXECUTAR_SCHEMA_MANUAL.sql` em um editor de texto
2. Copie todo o conteúdo
3. Cole na caixa de texto do phpMyAdmin
4. Clique em **Executar**

#### Passo 5: Verificar Resultado
1. Verifique a mensagem de sucesso
2. Clique em **Estrutura** para ver as tabelas criadas

---

### Opção 3: Usando Linha de Comando

#### Passo 1: Abrir Terminal/CMD
```bash
# Linux/Mac
open Terminal

# Windows
cmd
```

#### Passo 2: Navegar até a Pasta do Projeto
```bash
cd /caminho/para/marmo_hub/database
```

#### Passo 3: Executar o Script
```bash
# Opção A: Com prompt de senha
mysql -u root -p olx_pedra < EXECUTAR_SCHEMA_MANUAL.sql

# Opção B: Sem prompt de senha (menos seguro)
mysql -u root -psenha olx_pedra < EXECUTAR_SCHEMA_MANUAL.sql

# Opção C: Especificar host
mysql -h localhost -u root -p olx_pedra < EXECUTAR_SCHEMA_MANUAL.sql
```

#### Passo 4: Verificar Sucesso
```bash
# Conectar ao MySQL
mysql -u root -p olx_pedra

# Listar tabelas
SHOW TABLES;

# Sair
EXIT;
```

---

### Opção 4: Usando DBeaver

#### Passo 1: Abrir o Arquivo
1. Abra o DBeaver
2. Clique em **File** → **Open File**
3. Selecione `EXECUTAR_SCHEMA_MANUAL.sql`

#### Passo 2: Conectar ao Banco
1. Na aba de conexão, selecione sua conexão MySQL
2. Certifique-se de estar no banco `olx_pedra`

#### Passo 3: Executar
1. Clique em **Execute** ou pressione **Ctrl+Enter**
2. Aguarde a conclusão

#### Passo 4: Verificar
1. Expanda a árvore de tabelas
2. Verifique se todas as tabelas aparecem

---

## 📊 Inserir Dados de Teste

Após criar as tabelas, você pode inserir dados de teste:

### Passo 1: Executar Script de Dados
Repita o processo acima, mas usando o arquivo `DADOS_EXEMPLO_TESTE.sql`

### Passo 2: Verificar Dados Inseridos
```sql
SELECT * FROM agenciadores;
SELECT * FROM vendas_agenciador;
SELECT * FROM parcelas_venda;
SELECT * FROM comissoes_agenciador;
SELECT * FROM recebimentos_agenciador;
SELECT * FROM clientes_agenciador;
```

### Passo 3: Testar as Views
```sql
SELECT * FROM vw_vendas_por_agenciador;
SELECT * FROM vw_parcelas_pendentes;
SELECT * FROM vw_comissoes_a_receber;
SELECT * FROM vw_desempenho_clientes;
```

---

## 🧪 Testes Recomendados

Após inserir os dados, execute estas queries para validar:

### Teste 1: Total de Vendas por Agenciador
```sql
SELECT 
  a.id,
  a.nome,
  COUNT(DISTINCT v.id) as total_vendas,
  SUM(v.valor_total) as valor_total,
  SUM(v.comissao_valor) as comissoes_totais
FROM agenciadores a
LEFT JOIN vendas_agenciador v ON a.id = v.agenciador_id AND v.ativo = TRUE
WHERE a.ativo = TRUE
GROUP BY a.id, a.nome;
```

**Resultado esperado:**
- João Silva: 2 vendas, R$ 4.390,80, Comissão: R$ 87,82
- Maria Santos: 1 venda, R$ 3.500,00, Comissão: R$ 87,50
- Carlos Oliveira: 2 vendas, R$ 8.400,00, Comissão: R$ 252,00

### Teste 2: Parcelas Pagas vs Pendentes
```sql
SELECT 
  a.nome,
  COUNT(DISTINCT CASE WHEN p.status = 'paga' THEN p.id END) as pagas,
  COUNT(DISTINCT CASE WHEN p.status = 'pendente' THEN p.id END) as pendentes,
  SUM(CASE WHEN p.status = 'paga' THEN p.valor ELSE 0 END) as valor_pago,
  SUM(CASE WHEN p.status = 'pendente' THEN p.valor ELSE 0 END) as valor_pendente
FROM vendas_agenciador v
INNER JOIN agenciadores a ON v.agenciador_id = a.id
LEFT JOIN parcelas_venda p ON v.id = p.venda_id AND p.ativo = TRUE
WHERE v.ativo = TRUE
GROUP BY a.id, a.nome;
```

### Teste 3: Comissões por Período
```sql
SELECT 
  a.nome,
  c.periodo_mes,
  c.periodo_ano,
  COUNT(DISTINCT c.id) as total_comissoes,
  SUM(c.valor_comissao) as valor_total,
  COUNT(DISTINCT CASE WHEN c.status = 'pendente' THEN c.id END) as pendentes,
  COUNT(DISTINCT CASE WHEN c.status = 'paga' THEN c.id END) as pagas
FROM agenciadores a
LEFT JOIN comissoes_agenciador c ON a.id = c.agenciador_id AND c.ativo = TRUE
WHERE a.ativo = TRUE
GROUP BY a.id, a.nome, c.periodo_ano, c.periodo_mes
ORDER BY c.periodo_ano DESC, c.periodo_mes DESC;
```

### Teste 4: Desempenho de Clientes
```sql
SELECT * FROM vw_desempenho_clientes
ORDER BY agenciador_id, valor_total DESC;
```

---

## ⚠️ Troubleshooting

### Erro: "Table already exists"
**Solução**: As tabelas já foram criadas. Você pode:
- Deletar as tabelas existentes e executar novamente
- Ou usar `DROP TABLE IF EXISTS` antes de criar

### Erro: "Foreign key constraint fails"
**Solução**: Certifique-se de que:
- A tabela `contas` existe no banco
- A tabela `usuarios` existe no banco
- Execute o script de schema antes do script de dados

### Erro: "Access denied"
**Solução**: Verifique suas credenciais de acesso ao MySQL

### Erro: "Database does not exist"
**Solução**: Crie o banco de dados primeiro:
```sql
CREATE DATABASE olx_pedra;
USE olx_pedra;
```

---

## 📈 Próximos Passos

Após executar os scripts com sucesso:

1. **Criar APIs** - Implementar rotas para CRUD de vendas
2. **Frontend** - Criar interface para visualizar dados
3. **Importação** - Implementar importação de Excel
4. **Relatórios** - Gerar relatórios em PDF
5. **Notificações** - Alertar sobre pagamentos pendentes

---

## 🔍 Verificação Final

Execute esta query para confirmar que tudo está funcionando:

```sql
SELECT 
  'Agenciadores' as tabela, COUNT(*) as total FROM agenciadores
UNION ALL
SELECT 'Vendas', COUNT(*) FROM vendas_agenciador
UNION ALL
SELECT 'Parcelas', COUNT(*) FROM parcelas_venda
UNION ALL
SELECT 'Comissões', COUNT(*) FROM comissoes_agenciador
UNION ALL
SELECT 'Recebimentos', COUNT(*) FROM recebimentos_agenciador
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes_agenciador
UNION ALL
SELECT 'Views', COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'olx_pedra' AND TABLE_TYPE = 'VIEW';
```

**Resultado esperado:**
- Agenciadores: 3
- Vendas: 5
- Parcelas: 11
- Comissões: 5
- Recebimentos: 3
- Clientes: 5
- Views: 4

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique a versão do MySQL (deve ser 5.7+)
2. Verifique se o banco de dados `olx_pedra` existe
3. Verifique se as tabelas `contas` e `usuarios` existem
4. Consulte os logs de erro do MySQL
5. Tente executar os scripts um por um

---

**Data**: 01/03/2026  
**Versão**: 1.0.0  
**Status**: Pronto para Execução
