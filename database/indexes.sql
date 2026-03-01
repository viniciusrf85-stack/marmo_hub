-- ============================================
-- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- ============================================
-- Este script adiciona índices nas colunas mais consultadas
-- Executar após a criação do schema

-- ============================================
-- ÍNDICES NA TABELA CONTAS
-- ============================================
CREATE INDEX idx_contas_email ON contas(email);
CREATE INDEX idx_contas_cnpj ON contas(cnpj);
CREATE INDEX idx_contas_aprovada ON contas(aprovada);
CREATE INDEX idx_contas_ativa ON contas(ativa);
CREATE INDEX idx_contas_plano_id ON contas(plano_id);
CREATE INDEX idx_contas_data_cadastro ON contas(data_cadastro);
CREATE INDEX idx_contas_aprovada_ativa ON contas(aprovada, ativa);

-- ============================================
-- ÍNDICES NA TABELA USUARIOS
-- ============================================
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX idx_usuarios_cnpj ON usuarios(cnpj);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX idx_usuarios_tipo_consumidor ON usuarios(tipo_consumidor);
CREATE INDEX idx_usuarios_data_cadastro ON usuarios(data_cadastro);

-- ============================================
-- ÍNDICES NA TABELA USUARIOS_ADMINISTRADORES
-- ============================================
CREATE INDEX idx_usuarios_admin_email ON usuarios_administradores(email);
CREATE INDEX idx_usuarios_admin_ativo ON usuarios_administradores(ativo);

-- ============================================
-- ÍNDICES NA TABELA MATERIAIS
-- ============================================
CREATE INDEX idx_materiais_conta_id ON materiais(conta_id);
CREATE INDEX idx_materiais_tipo_material_id ON materiais(tipo_material_id);
CREATE INDEX idx_materiais_ativo ON materiais(ativo);
CREATE INDEX idx_materiais_aprovado ON materiais(aprovado);
CREATE INDEX idx_materiais_data_cadastro ON materiais(data_cadastro);
CREATE INDEX idx_materiais_ativo_aprovado ON materiais(ativo, aprovado);
CREATE INDEX idx_materiais_conta_ativo ON materiais(conta_id, ativo);
CREATE INDEX idx_materiais_valor_m2 ON materiais(valor_m2);
CREATE INDEX idx_materiais_promocao ON materiais(promocao);
CREATE INDEX idx_materiais_destaque ON materiais(destaque);
CREATE INDEX idx_materiais_nome ON materiais(nome);

-- ============================================
-- ÍNDICES NA TABELA FOTOS_MATERIAIS
-- ============================================
CREATE INDEX idx_fotos_material_id ON fotos_materiais(material_id);
CREATE INDEX idx_fotos_principal ON fotos_materiais(principal);

-- ============================================
-- ÍNDICES NA TABELA CONTATOS
-- ============================================
CREATE INDEX idx_contatos_material_id ON contatos(material_id);
CREATE INDEX idx_contatos_conta_id ON contatos(conta_id);
CREATE INDEX idx_contatos_usuario_id ON contatos(usuario_id);
CREATE INDEX idx_contatos_data_contato ON contatos(data_contato);
CREATE INDEX idx_contatos_respondido ON contatos(respondido);

-- ============================================
-- ÍNDICES NA TABELA FAVORITOS
-- ============================================
CREATE INDEX idx_favoritos_usuario_id ON favoritos(usuario_id);
CREATE INDEX idx_favoritos_material_id ON favoritos(material_id);
CREATE INDEX idx_favoritos_usuario_material ON favoritos(usuario_id, material_id);

-- ============================================
-- ÍNDICES NA TABELA HISTORICO_PLANOS
-- ============================================
CREATE INDEX idx_historico_planos_conta_id ON historico_planos(conta_id);
CREATE INDEX idx_historico_planos_plano_id ON historico_planos(plano_id);
CREATE INDEX idx_historico_planos_data_mudanca ON historico_planos(data_mudanca);

-- ============================================
-- ÍNDICES NA TABELA PLANOS
-- ============================================
CREATE INDEX idx_planos_ativo ON planos(ativo);

-- ============================================
-- ÍNDICES NA TABELA TIPOS_MATERIAL
-- ============================================
CREATE INDEX idx_tipos_material_ativo ON tipos_material(ativo);

-- ============================================
-- VERIFICAR ÍNDICES CRIADOS
-- ============================================
-- Execute para verificar os índices:
-- SHOW INDEXES FROM contas;
-- SHOW INDEXES FROM usuarios;
-- SHOW INDEXES FROM materiais;
-- etc...
