import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'
import './GerenciarEmpresasAgenciador.css'

export default function GerenciarEmpresasAgenciador() {
  const navigate = useNavigate()
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    empresa_nome: '',
    cnpj: '',
    localizacao: '',
    comissao_percentual: ''
  })

  // Carregar empresas ao montar
  useEffect(() => {
    carregarEmpresas()
  }, [])

  const carregarEmpresas = async () => {
    try {
      setLoading(true)
      setErro(null)
      const response = await api.get('/agenciador-empresas')
      setEmpresas(response.data.data || [])
    } catch (err) {
      console.error('Erro ao carregar empresas:', err)
      setErro(err.response?.data?.message || 'Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validações básicas
    if (!formData.empresa_nome.trim()) {
      setErro('Nome da empresa é obrigatório')
      return
    }
    if (!formData.cnpj.trim()) {
      setErro('CNPJ é obrigatório')
      return
    }
    if (!formData.localizacao.trim()) {
      setErro('Localização é obrigatória')
      return
    }
    if (!formData.comissao_percentual) {
      setErro('Comissão é obrigatória')
      return
    }

    try {
      setErro(null)
      
      if (editando) {
        // Atualizar empresa existente
        await api.put(`/agenciador-empresas/${editando.id}`, formData)
        setErro(null)
        alert('Empresa atualizada com sucesso!')
      } else {
        // Criar nova empresa
        await api.post('/agenciador-empresas', formData)
        setErro(null)
        alert('Empresa adicionada com sucesso!')
      }
      
      // Limpar formulário e recarregar
      setFormData({
        empresa_nome: '',
        cnpj: '',
        localizacao: '',
        comissao_percentual: ''
      })
      setEditando(null)
      setShowForm(false)
      await carregarEmpresas()
    } catch (err) {
      console.error('Erro ao salvar empresa:', err)
      setErro(err.response?.data?.message || 'Erro ao salvar empresa')
    }
  }

  const handleEditar = (empresa) => {
    setFormData({
      empresa_nome: empresa.empresa_nome,
      cnpj: empresa.cnpj,
      localizacao: empresa.localizacao,
      comissao_percentual: empresa.comissao_percentual
    })
    setEditando(empresa)
    setShowForm(true)
  }

  const handleCancelar = () => {
    setFormData({
      empresa_nome: '',
      cnpj: '',
      localizacao: '',
      comissao_percentual: ''
    })
    setEditando(null)
    setShowForm(false)
    setErro(null)
  }

  const handleDeletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta empresa?')) {
      return
    }

    try {
      await api.delete(`/agenciador-empresas/${id}`)
      alert('Empresa removida com sucesso!')
      await carregarEmpresas()
    } catch (err) {
      console.error('Erro ao deletar empresa:', err)
      setErro(err.response?.data?.message || 'Erro ao remover empresa')
    }
  }

  return (
    <div className="gerenciar-empresas-container">
      <Navbar />
      
      <div className="gerenciar-empresas-content">
        <div className="gerenciar-empresas-header">
          <h1>Minhas Empresas Comissionárias</h1>
          <button 
            className="btn-voltar"
            onClick={() => navigate('/agenciador-dashboard')}
          >
            ← Voltar ao Dashboard
          </button>
        </div>

        {erro && (
          <div className="alert alert-error">
            {erro}
            <button onClick={() => setErro(null)}>✕</button>
          </div>
        )}

        <div className="gerenciar-empresas-main">
          {/* Formulário */}
          <div className="gerenciar-empresas-form-section">
            {!showForm ? (
              <button 
                className="btn-novo"
                onClick={() => setShowForm(true)}
              >
                + Adicionar Empresa
              </button>
            ) : (
              <div className="form-card">
                <h2>{editando ? 'Editar Empresa' : 'Adicionar Nova Empresa'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="empresa_nome">Nome da Empresa *</label>
                    <input
                      type="text"
                      id="empresa_nome"
                      name="empresa_nome"
                      value={formData.empresa_nome}
                      onChange={handleInputChange}
                      placeholder="Ex: Mármores Brasil Ltda"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cnpj">CNPJ *</label>
                    <input
                      type="text"
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      placeholder="Ex: 12345678000195"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="localizacao">Localização *</label>
                    <input
                      type="text"
                      id="localizacao"
                      name="localizacao"
                      value={formData.localizacao}
                      onChange={handleInputChange}
                      placeholder="Ex: São Paulo, SP"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="comissao_percentual">Comissão (%) *</label>
                    <input
                      type="number"
                      id="comissao_percentual"
                      name="comissao_percentual"
                      value={formData.comissao_percentual}
                      onChange={handleInputChange}
                      placeholder="Ex: 5.5"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-salvar">
                      {editando ? 'Atualizar' : 'Adicionar'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-cancelar"
                      onClick={handleCancelar}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Lista de Empresas */}
          <div className="gerenciar-empresas-list-section">
            <h2>Empresas Cadastradas</h2>
            
            {loading ? (
              <div className="loading">Carregando empresas...</div>
            ) : empresas.length === 0 ? (
              <div className="empty-state">
                <p>Você ainda não adicionou nenhuma empresa.</p>
                <p>Clique em "Adicionar Empresa" para começar!</p>
              </div>
            ) : (
              <div className="empresas-grid">
                {empresas.map(empresa => (
                  <div key={empresa.id} className="empresa-card">
                    <div className="empresa-header">
                      <h3>{empresa.empresa_nome}</h3>
                      <div className="empresa-actions">
                        <button
                          className="btn-editar"
                          onClick={() => handleEditar(empresa)}
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-deletar"
                          onClick={() => handleDeletar(empresa.id)}
                          title="Deletar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    
                    <div className="empresa-details">
                      <div className="detail-row">
                        <span className="label">CNPJ:</span>
                        <span className="value">{empresa.cnpj}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Localização:</span>
                        <span className="value">{empresa.localizacao}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Comissão:</span>
                        <span className="value comissao">{empresa.comissao_percentual}%</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Cadastro:</span>
                        <span className="value">
                          {new Date(empresa.data_cadastro).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
