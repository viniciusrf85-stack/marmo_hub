-- ============================================
-- COMPLETAR MIGRAÇÃO - Renomear colunas temporárias
-- ============================================
-- Execute este script APENAS se a migração inicial foi executada
-- e você validou que os dados estão corretos

USE olx_pedra;

-- Verificar se as colunas temporárias existem
SELECT 
    'Verificando estrutura...' as status,
    COUNT(*) as colunas_temp_encontradas
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'olx_pedra' 
  AND TABLE_NAME = 'materiais' 
  AND COLUMN_NAME IN ('conta_id_temp', 'empresa_id');

-- ============================================
-- RENOMEAR COLUNAS EM MATERIAIS
-- ============================================
-- Descomente as linhas abaixo APENAS após validar que conta_id_temp tem dados

-- ALTER TABLE materiais DROP FOREIGN KEY IF EXISTS fk_materiais_empresa;
-- ALTER TABLE materiais DROP COLUMN IF EXISTS empresa_id;
-- ALTER TABLE materiais CHANGE COLUMN conta_id_temp conta_id INT NOT NULL;
-- ALTER TABLE materiais ADD CONSTRAINT fk_materiais_conta FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

-- ============================================
-- RENOMEAR COLUNAS EM CONTATOS
-- ============================================
-- ALTER TABLE contatos DROP FOREIGN KEY IF EXISTS fk_contatos_empresa;
-- ALTER TABLE contatos DROP COLUMN IF EXISTS empresa_id;
-- ALTER TABLE contatos CHANGE COLUMN conta_id_temp conta_id INT NOT NULL;
-- ALTER TABLE contatos ADD CONSTRAINT fk_contatos_conta FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

-- ============================================
-- RENOMEAR COLUNAS EM HISTORICO_PLANOS
-- ============================================
-- ALTER TABLE historico_planos DROP FOREIGN KEY IF EXISTS fk_historico_empresa;
-- ALTER TABLE historico_planos DROP COLUMN IF EXISTS empresa_id;
-- ALTER TABLE historico_planos CHANGE COLUMN conta_id_temp conta_id INT NOT NULL;
-- ALTER TABLE historico_planos ADD CONSTRAINT fk_historico_contas FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT 
    'Migração completa!' as status,
    'Todas as colunas foram renomeadas' as mensagem;
