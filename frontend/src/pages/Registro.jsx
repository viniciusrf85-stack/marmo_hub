import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/auth.css'

const Registro = () => {
  const [tipoRegistro, setTipoRegistro] = useState(null) // null, 'conta', 'usuario'
  const navigate = useNavigate()

  // Debug: verificar se o componente está sendo renderizado
  console.log('Registro component renderizado, tipoRegistro:', tipoRegistro)

  return (
    <div className="page">
      <Navbar />
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Criar conta</h1>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>
              Escolha o tipo de cadastro
            </p>
            <p style={{ fontSize: '12px', color: '#10b981', marginTop: '5px', fontWeight: 'bold' }}>
              ✓ Nova versão carregada - Selecione abaixo
            </p>
          </div>

          {tipoRegistro === null ? (
            <div className="auth-form">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setTipoRegistro('conta')}
                  className="btn btn-primary btn-lg"
                  style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <h3 style={{ margin: '0 0 10px 0' }}>📦 Sou Empresa</h3>
                  <p style={{ marginTop: '10px', fontSize: '14px', margin: '5px 0' }}>
                    Quero anunciar pedras ornamentais
                  </p>
                  <p style={{ marginTop: '5px', fontSize: '12px', opacity: 0.8, margin: '5px 0' }}>
                    CNPJ obrigatório • Planos disponíveis
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoRegistro('usuario')}
                  className="btn btn-secondary btn-lg"
                  style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <h3 style={{ margin: '0 0 10px 0' }}>👤 Sou Cliente</h3>
                  <p style={{ marginTop: '10px', fontSize: '14px', margin: '5px 0' }}>
                    Quero buscar e comprar pedras
                  </p>
                  <p style={{ marginTop: '5px', fontSize: '12px', opacity: 0.8, margin: '5px 0' }}>
                    Consumidor • Marmorista • Atacadista • Construtor
                  </p>
                </button>
              </div>
            </div>
          ) : tipoRegistro === 'conta' ? (
            <RegistroConta onCancel={() => setTipoRegistro(null)} />
          ) : (
            <RegistroUsuario onCancel={() => setTipoRegistro(null)} />
          )}

          <div className="auth-footer">
            <p>
              Já tem uma conta?{' '}
              <Link to="/login" className="auth-link">
                Entrar
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-image">
          <div className="auth-image-content">
            <h2>Junte-se ao Marketplace</h2>
            <p>Anuncie ou encontre as melhores pedras ornamentais do Espírito Santo</p>
            <ul className="auth-benefits">
              <li>✓ Galeria completa de fotos</li>
              <li>✓ Contato direto com fornecedores</li>
              <li>✓ Filtros avançados de busca</li>
              <li>✓ Planos acessíveis para empresas</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

// Componente de registro de conta (empresa)
const RegistroConta = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone_comercial: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    plano_id: ''
  })
  const [planos, setPlanos] = useState([])
  const [loadingPlanos, setLoadingPlanos] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { registroConta } = useAuth()
  const navigate = useNavigate()

  // Carregar planos disponíveis
  useEffect(() => {
    const carregarPlanos = async () => {
      try {
        const response = await axios.get('/api/planos')
        setPlanos(response.data)
        // Selecionar plano Prata por padrão (primeiro plano)
        const planoPrata = response.data.find(p => p.nome === 'Prata')
        if (planoPrata) {
          setFormData(prev => ({ ...prev, plano_id: planoPrata.id }))
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error)
      } finally {
        setLoadingPlanos(false)
      }
    }
    carregarPlanos()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (!formData.plano_id) {
      setError('Selecione um plano para continuar')
      return
    }

    setLoading(true)

    const { confirmarSenha, ...dadosRegistro } = formData
    const result = await registroConta(dadosRegistro)

    if (result.success) {
      navigate('/empresa/dashboard')
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <button
        type="button"
        onClick={onCancel}
        className="btn btn-sm btn-outline"
        style={{ marginBottom: '20px' }}
      >
        ← Voltar
      </button>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Razão Social *</label>
        <input
          type="text"
          name="razao_social"
          className="form-control"
          value={formData.razao_social}
          onChange={handleChange}
          required
          placeholder="Nome da empresa"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Nome Fantasia *</label>
        <input
          type="text"
          name="nome_fantasia"
          className="form-control"
          value={formData.nome_fantasia}
          onChange={handleChange}
          required
          placeholder="Nome comercial"
        />
      </div>

      <div className="form-group">
        <label className="form-label">CNPJ *</label>
        <input
          type="text"
          name="cnpj"
          className="form-control"
          value={formData.cnpj}
          onChange={handleChange}
          required
          placeholder="00.000.000/0000-00"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email *</label>
        <input
          type="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="comercial@empresa.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Telefone Comercial</label>
        <input
          type="tel"
          name="telefone_comercial"
          className="form-control"
          value={formData.telefone_comercial}
          onChange={handleChange}
          placeholder="(00) 0000-0000"
        />
      </div>

      <div className="form-group">
        <label className="form-label">WhatsApp</label>
        <input
          type="tel"
          name="whatsapp"
          className="form-control"
          value={formData.whatsapp}
          onChange={handleChange}
          placeholder="(00) 00000-0000"
        />
      </div>

      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">Cidade</label>
          <input
            type="text"
            name="cidade"
            className="form-control"
            value={formData.cidade}
            onChange={handleChange}
            placeholder="Cidade"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Estado</label>
          <input
            type="text"
            name="estado"
            className="form-control"
            value={formData.estado}
            onChange={handleChange}
            placeholder="ES"
            maxLength="2"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Plano *</label>
        {loadingPlanos ? (
          <div className="form-control" style={{ padding: '10px' }}>
            Carregando planos...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '10px' }}>
            {planos.map(plano => (
              <div
                key={plano.id}
                onClick={() => setFormData(prev => ({ ...prev, plano_id: plano.id }))}
                style={{
                  border: formData.plano_id == plano.id ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px',
                  cursor: 'pointer',
                  backgroundColor: formData.plano_id == plano.id ? '#eff6ff' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>
                  {plano.nome === 'Prata' && '🥈'}
                  {plano.nome === 'Ouro' && '🥇'}
                  {plano.nome === 'Diamante' && '💎'}
                  {' '}{plano.nome}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  {plano.descricao}
                </div>
                <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>
                  {plano.quantidade_anuncios} materiais
                </div>
                <div style={{ fontSize: '12px', color: '#2563eb' }}>
                  {plano.quantidade_fotos} fotos por material
                </div>
                {plano.permite_video && (
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', marginTop: '5px' }}>
                    ✓ Inclui vídeo
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!formData.plano_id && !loadingPlanos && (
          <small className="form-text" style={{ color: '#ef4444' }}>
            Selecione um plano para continuar
          </small>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Senha *</label>
        <input
          type="password"
          name="senha"
          className="form-control"
          value={formData.senha}
          onChange={handleChange}
          required
          placeholder="••••••••"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Confirmar senha *</label>
        <input
          type="password"
          name="confirmarSenha"
          className="form-control"
          value={formData.confirmarSenha}
          onChange={handleChange}
          required
          placeholder="••••••••"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary btn-lg w-full"
        disabled={loading}
      >
        {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
      </button>
    </form>
  )
}

// Componente de registro de usuário (cliente)
const RegistroUsuario = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: '',
    tipo_consumidor: 'consumidor_final'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { registroUsuario } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    const { confirmarSenha, ...dadosRegistro } = formData
    const result = await registroUsuario(dadosRegistro)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <button
        type="button"
        onClick={onCancel}
        className="btn btn-sm btn-outline"
        style={{ marginBottom: '20px' }}
      >
        ← Voltar
      </button>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Tipo de Consumidor *</label>
        <select
          name="tipo_consumidor"
          className="form-control"
          value={formData.tipo_consumidor}
          onChange={handleChange}
          required
        >
          <option value="consumidor_final">Consumidor Final</option>
          <option value="marmorista">Marmorista</option>
          <option value="atacadista">Atacadista</option>
          <option value="construtor">Construtor</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Nome completo *</label>
        <input
          type="text"
          name="nome"
          className="form-control"
          value={formData.nome}
          onChange={handleChange}
          required
          placeholder="Seu nome completo"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email *</label>
        <input
          type="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="seu@email.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Telefone</label>
        <input
          type="tel"
          name="telefone"
          className="form-control"
          value={formData.telefone}
          onChange={handleChange}
          placeholder="(00) 00000-0000"
        />
      </div>

      <div className="form-group">
        <label className="form-label">CPF</label>
        <input
          type="text"
          name="cpf"
          className="form-control"
          value={formData.cpf}
          onChange={handleChange}
          placeholder="000.000.000-00"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Senha *</label>
        <input
          type="password"
          name="senha"
          className="form-control"
          value={formData.senha}
          onChange={handleChange}
          required
          placeholder="••••••••"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Confirmar senha *</label>
        <input
          type="password"
          name="confirmarSenha"
          className="form-control"
          value={formData.confirmarSenha}
          onChange={handleChange}
          required
          placeholder="••••••••"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary btn-lg w-full"
        disabled={loading}
      >
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}

export default Registro
