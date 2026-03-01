import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/navbar.css'

const Navbar = () => {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <span className="logo-icon">💎</span>
            <span className="logo-text">MarmoHub</span>
          </Link>

          <div className="navbar-menu">
            <Link 
              to={usuario?.tipo_entidade === 'administrador' ? '/admin/dashboard' : '/'} 
              className="nav-link"
            >
              Início
            </Link>
            <Link to="/empresas" className="nav-link">Empresas</Link>

            {!usuario ? (
              <>
                <Link to="/login" className="nav-link">Entrar</Link>
                <Link to="/selecao-cadastro" className="btn btn-primary btn-sm">
                  Cadastrar
                </Link>
              </>
            ) : (
              <>
                {usuario.tipo_entidade === 'conta' && (
                  <>
                    <Link to="/empresa/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/empresa/anuncios" className="nav-link">Meus Anúncios</Link>
                    <Link to="/empresa/contatos" className="nav-link">Contatos</Link>
                  </>
                )}

                {usuario.tipo_entidade === 'usuario' && (
                  <Link to="/favoritos" className="nav-link">Favoritos</Link>
                )}

                {usuario.tipo_entidade === 'administrador' && (
                  <div 
                    className="navbar-dropdown"
                    onMouseEnter={() => setAdminMenuOpen(true)}
                    onMouseLeave={() => setAdminMenuOpen(false)}
                  >
                    <Link to="/admin/dashboard" className="nav-link">
                      Admin
                      <span className="dropdown-arrow">▼</span>
                    </Link>
                    {adminMenuOpen && (
                      <div className="dropdown-menu">
                        <Link to="/admin/dashboard" className="dropdown-item">
                          Dashboard
                        </Link>
                        <Link to="/admin/empresas" className="dropdown-item">
                          Gerenciar Empresas
                        </Link>
                        <Link to="/admin/usuarios" className="dropdown-item">
                          Gerenciar Usuários
                        </Link>
                        <Link to="/admin/materiais" className="dropdown-item">
                          Gerenciar Materiais
                        </Link>
                        <Link to="/admin/planos" className="dropdown-item">
                          Gerenciar Planos
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="navbar-user">
                  <span className="user-name">{usuario.nome || usuario.nome_fantasia}</span>
                  <button onClick={handleLogout} className="btn btn-sm btn-outline">
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar



