import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './GerenciarEmpresas.css';

export default function GerenciarEmpresas() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errosCampo, setErrosCampo] = useState({});

  const [formData, setFormData] = useState({
    empresa_nome: '',
    cnpj: '',
    localizacao: '',
    comissao_percentual: 5.00
  });

  // Carregar empresas ao montar o componente
  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agenciador-empresas');
      setEmpresas(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar empresas');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'comissao_percentual' ? parseFloat(value) : value
    }));
    // Limpar erro do campo
    if (errosCampo[name]) {
      setErrosCampo(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validarFormulario = () => {
    const erros = {};

    if (!formData.empresa_nome || formData.empresa_nome.length < 3) {
      erros.empresa_nome = 'Nome da empresa deve ter no mínimo 3 caracteres';
    }

    if (!formData.cnpj || !/^\d{11,14}$/.test(formData.cnpj.replace(/\D/g, ''))) {
      erros.cnpj = 'CNPJ inválido';
    }

    if (!formData.localizacao || formData.localizacao.length < 3) {
      erros.localizacao = 'Localização inválida';
    }

    if (formData.comissao_percentual < 0 || formData.comissao_percentual > 100) {
      erros.comissao_percentual = 'Comissão deve estar entre 0 e 100%';
    }

    setErrosCampo(erros);
    return Object.keys(erros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Atualizar empresa
        await api.put(`/agenciador-empresas/${editingId}`, formData);
      } else {
        // Criar nova empresa
        await api.post('/agenciador-empresas', formData);
      }

      // Recarregar lista
      await carregarEmpresas();
      
      // Limpar formulário
      setFormData({
        empresa_nome: '',
        cnpj: '',
        localizacao: '',
        comissao_percentual: 5.00
      });
      setShowForm(false);
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar empresa');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (empresa) => {
    setFormData({
      empresa_nome: empresa.empresa_nome,
      cnpj: empresa.cnpj,
      localizacao: empresa.localizacao,
      comissao_percentual: empresa.comissao_percentual
    });
    setEditingId(empresa.id);
    setShowForm(true);
    setErrosCampo({});
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta empresa?')) {
      try {
        setLoading(true);
        await api.delete(`/agenciador-empresas/${id}`);
        await carregarEmpresas();
        setError(null);
      } catch (err) {
        setError('Erro ao deletar empresa');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      empresa_nome: '',
      cnpj: '',
      localizacao: '',
      comissao_percentual: 5.00
    });
    setErrosCampo({});
  };

  return (
    <div className="gerenciar-empresas-container">
      <div className="gerenciar-empresas-header">
        <h1>Empresas Comissionárias</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? '← Voltar' : '+ Nova Empresa'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {showForm ? (
        <div className="gerenciar-empresas-form">
          <h2>{editingId ? 'Editar Empresa' : 'Adicionar Nova Empresa'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="empresa_nome">Nome da Empresa *</label>
              <input
                type="text"
                id="empresa_nome"
                name="empresa_nome"
                value={formData.empresa_nome}
                onChange={handleInputChange}
                placeholder="Digite o nome da empresa"
                className={errosCampo.empresa_nome ? 'error' : ''}
              />
              {errosCampo.empresa_nome && <span className="error-message">{errosCampo.empresa_nome}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cnpj">CNPJ *</label>
                <input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  className={errosCampo.cnpj ? 'error' : ''}
                />
                {errosCampo.cnpj && <span className="error-message">{errosCampo.cnpj}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="comissao_percentual">Comissão (%) *</label>
                <input
                  type="number"
                  id="comissao_percentual"
                  name="comissao_percentual"
                  value={formData.comissao_percentual}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className={errosCampo.comissao_percentual ? 'error' : ''}
                />
                {errosCampo.comissao_percentual && <span className="error-message">{errosCampo.comissao_percentual}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="localizacao">Localização *</label>
              <input
                type="text"
                id="localizacao"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleInputChange}
                placeholder="Cidade, Estado ou Região"
                className={errosCampo.localizacao ? 'error' : ''}
              />
              {errosCampo.localizacao && <span className="error-message">{errosCampo.localizacao}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleCancelar} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="gerenciar-empresas-list">
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : empresas.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma empresa cadastrada</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                + Adicionar Primeira Empresa
              </button>
            </div>
          ) : (
            <table className="empresas-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CNPJ</th>
                  <th>Localização</th>
                  <th>Comissão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map(empresa => (
                  <tr key={empresa.id}>
                    <td>{empresa.empresa_nome}</td>
                    <td>{empresa.cnpj}</td>
                    <td>{empresa.localizacao}</td>
                    <td>{empresa.comissao_percentual}%</td>
                    <td className="actions">
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => handleEditar(empresa)}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeletar(empresa.id)}
                        disabled={loading}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
