import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/auth.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
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
    setLoading(true)

    const result = await login(formData.email, formData.senha)

    if (result.success) {
      // Redirecionar baseado no tipo de entidade
      if (result.usuario.tipo_entidade === 'conta') {
        navigate('/empresa/dashboard')
      } else if (result.usuario.tipo_entidade === 'administrador') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="page">
      <Navbar />
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Bem-vindo de volta!</h1>
            <p>Entre com suas credenciais para acessar sua conta</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
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
              <label className="form-label">Senha</label>
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

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Não tem uma conta?{' '}
              <Link to="/registro" className="auth-link">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-image">
          <div className="auth-image-content">
            <h2>Marketplace de Pedras Ornamentais</h2>
            <p>Conectando empresas e clientes no mercado de granito e mármore</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Login



