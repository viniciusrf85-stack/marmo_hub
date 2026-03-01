import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Páginas públicas
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import MaterialDetalhes from './pages/MaterialDetalhes'
import Empresas from './pages/Empresas'

// Páginas da empresa
import DashboardEmpresa from './pages/empresa/Dashboard'
import MeusAnuncios from './pages/empresa/MeusAnuncios'
import NovoAnuncio from './pages/empresa/NovoAnuncio'
import EditarAnuncio from './pages/empresa/EditarAnuncio'
import PerfilEmpresa from './pages/empresa/PerfilEmpresa'
import ContatosRecebidos from './pages/empresa/ContatosRecebidos'

// Páginas do cliente
import MeusFavoritos from './pages/cliente/MeusFavoritos'
import MeuPerfil from './pages/cliente/MeuPerfil'

// Páginas administrativas
import DashboardAdmin from './pages/admin/Dashboard'
import GerenciarEmpresas from './pages/admin/GerenciarEmpresas'
import GerenciarUsuarios from './pages/admin/GerenciarUsuarios'
import GerenciarMateriais from './pages/admin/GerenciarMateriais'
import GerenciarPlanos from './pages/admin/GerenciarPlanos'

// Componente de rota protegida
const ProtectedRoute = ({ children, requiredRole, requiredTipo }) => {
  const { usuario, loading } = useAuth()

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  if (!usuario) {
    return <Navigate to="/login" />
  }

  // Verificar tipo_entidade (nova estrutura)
  if (requiredTipo) {
    if (usuario.tipo_entidade !== requiredTipo) {
      return <Navigate to="/" />
    }
  }

  // Verificar requiredRole (compatibilidade com código antigo)
  if (requiredRole) {
    // Mapear roles antigas para novos tipos
    if (requiredRole === 'empresa' && usuario.tipo_entidade !== 'conta') {
      return <Navigate to="/" />
    }
    if (requiredRole === 'administrador' && usuario.tipo_entidade !== 'administrador') {
      return <Navigate to="/" />
    }
    if (requiredRole === 'cliente' && usuario.tipo_entidade !== 'usuario') {
      return <Navigate to="/" />
    }
  }

  return children
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/material/:id" element={<MaterialDetalhes />} />
          <Route path="/empresas" element={<Empresas />} />

          {/* Rotas da empresa (conta) */}
          <Route
            path="/empresa/dashboard"
            element={
              <ProtectedRoute requiredTipo="conta">
                <DashboardEmpresa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empresa/anuncios"
            element={
              <ProtectedRoute requiredTipo="conta">
                <MeusAnuncios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empresa/anuncios/novo"
            element={
              <ProtectedRoute requiredTipo="conta">
                <NovoAnuncio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empresa/anuncios/editar/:id"
            element={
              <ProtectedRoute requiredTipo="conta">
                <EditarAnuncio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empresa/perfil"
            element={
              <ProtectedRoute requiredTipo="conta">
                <PerfilEmpresa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empresa/contatos"
            element={
              <ProtectedRoute requiredTipo="conta">
                <ContatosRecebidos />
              </ProtectedRoute>
            }
          />

          {/* Rotas do cliente */}
          <Route
            path="/favoritos"
            element={
              <ProtectedRoute>
                <MeusFavoritos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <MeuPerfil />
              </ProtectedRoute>
            }
          />

          {/* Rotas administrativas */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredTipo="administrador">
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/empresas"
            element={
              <ProtectedRoute requiredTipo="administrador">
                <GerenciarEmpresas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute requiredTipo="administrador">
                <GerenciarUsuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/materiais"
            element={
              <ProtectedRoute requiredTipo="administrador">
                <GerenciarMateriais />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/planos"
            element={
              <ProtectedRoute requiredTipo="administrador">
                <GerenciarPlanos />
              </ProtectedRoute>
            }
          />

          {/* Rota 404 */}
          <Route path="*" element={<div>Página não encontrada</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App



