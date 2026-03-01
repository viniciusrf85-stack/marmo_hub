-- ============================================
-- CRIAR PLANOS: PRATA, OURO E DIAMANTE
-- ============================================

USE olx_pedra;

-- Atualizar tabela planos para incluir novos campos
-- Verificar e adicionar quantidade_fotos se não existir
SET @dbname = DATABASE();
SET @tablename = 'planos';
SET @columnname = 'quantidade_fotos';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT DEFAULT 3')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar e adicionar permite_video se não existir
SET @columnname = 'permite_video';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Deletar planos antigos (opcional - comente se quiser manter)
-- DELETE FROM planos WHERE nome NOT IN ('Prata', 'Ouro', 'Diamante');

-- Criar/Atualizar os 3 planos
-- PLANO PRATA (Inicial)
INSERT INTO planos (nome, descricao, quantidade_anuncios, quantidade_fotos, permite_video, valor_mensal, ativo, ordem) 
VALUES 
('Prata', 'Plano inicial - Ideal para começar no marketplace', 5, 3, FALSE, 0.00, TRUE, 1)
ON DUPLICATE KEY UPDATE 
    descricao = 'Plano inicial - Ideal para começar no marketplace',
    quantidade_anuncios = 5,
    quantidade_fotos = 3,
    permite_video = FALSE,
    valor_mensal = 0.00,
    ativo = TRUE,
    ordem = 1;

-- PLANO OURO
INSERT INTO planos (nome, descricao, quantidade_anuncios, quantidade_fotos, permite_video, valor_mensal, ativo, ordem) 
VALUES 
('Ouro', 'Plano intermediário - Para empresas em crescimento', 7, 5, FALSE, 0.00, TRUE, 2)
ON DUPLICATE KEY UPDATE 
    descricao = 'Plano intermediário - Para empresas em crescimento',
    quantidade_anuncios = 7,
    quantidade_fotos = 5,
    permite_video = FALSE,
    valor_mensal = 0.00,
    ativo = TRUE,
    ordem = 2;

-- PLANO DIAMANTE
INSERT INTO planos (nome, descricao, quantidade_anuncios, quantidade_fotos, permite_video, valor_mensal, ativo, ordem) 
VALUES 
('Diamante', 'Plano completo - Máxima visibilidade e recursos', 10, 5, TRUE, 0.00, TRUE, 3)
ON DUPLICATE KEY UPDATE 
    descricao = 'Plano completo - Máxima visibilidade e recursos',
    quantidade_anuncios = 10,
    quantidade_fotos = 5,
    permite_video = TRUE,
    valor_mensal = 0.00,
    ativo = TRUE,
    ordem = 3;

-- Verificar planos criados
SELECT 
    id,
    nome,
    quantidade_anuncios,
    quantidade_fotos,
    permite_video,
    valor_mensal,
    ativo,
    ordem
FROM planos 
WHERE nome IN ('Prata', 'Ouro', 'Diamante')
ORDER BY ordem;
