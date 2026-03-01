-- ============================================
-- ADICIONAR SUPORTE A VÍDEO NA TABELA MATERIAIS
-- ============================================

USE olx_pedra;

-- Adicionar campo de vídeo (se não existir)
SET @dbname = DATABASE();
SET @tablename = 'materiais';
SET @columnname = 'video_url';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(500) NULL COMMENT ''URL do vídeo do material (apenas plano Diamante)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar estrutura
DESCRIBE materiais;
