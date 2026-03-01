import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const DashboardAdmin = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDashboard()
  }, [])

  const carregarDashboard = async () => {
    try {
      console.log('Carregando dashboard admin...')
      const response = await axios.get('/api/dashboard/admin')
      console.log('Dashboard carregado:', response.data)
      setDashboard(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      console.error('Detalhes do erro:', error.response?.data)
      console.error('Status:', error.response?.status)
      alert(error.response?.data?.error || 'Erro ao carregar dashboard. Verifique o console para mais detalhes.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="loading">Carregando dashboard...</div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h1>Painel Administrativo</h1>
        
        {dashboard && (
          <>
            <div className="grid grid-4" style={{ marginTop: '20px' }}>
              <div className="card text-center" style={{ border: '2px solid var(--primary-color)' }}>
                <h2 style={{ color: 'var(--primary-color)', fontSize: '36px' }}>
                  {dashboard.estatisticas.total_contas}
                </h2>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>Total de Empresas</p>
              </div>
              <div className="card text-center" style={{ border: '2px solid var(--primary-color)' }}>
                <h2 style={{ color: 'var(--primary-color)', fontSize: '36px' }}>
                  {dashboard.estatisticas.total_materiais}
                </h2>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>Total de Anúncios</p>
              </div>
              <div className="card text-center">
                <h2>{dashboard.estatisticas.total_usuarios}</h2>
                <p>Usuários</p>
              </div>
              <div className="card text-center">
                <h2>{dashboard.estatisticas.total_contatos}</h2>
                <p>Contatos</p>
              </div>
            </div>

            <div className="grid grid-2" style={{ marginTop: '20px' }}>
              <div className="card">
                <h3>Pendências</h3>
                <p><strong>Contas:</strong> {dashboard.estatisticas.contas_pendentes}</p>
                <p><strong>Materiais:</strong> {dashboard.estatisticas.materiais_pendentes}</p>
                {dashboard.estatisticas.contas_pendentes > 0 && (
                  <Link 
                    to="/admin/empresas?filtro=pendentes" 
                    className="btn btn-sm btn-warning"
                    style={{ marginTop: '10px' }}
                  >
                    Ver Contas Pendentes
                  </Link>
                )}
              </div>

              <div className="card">
                <h3>Links Rápidos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/admin/empresas" className="btn btn-sm btn-primary">
                    Gerenciar Contas
                  </Link>
                  <Link to="/admin/usuarios" className="btn btn-sm btn-primary">
                    Gerenciar Usuários
                  </Link>
                  <Link to="/admin/materiais" className="btn btn-sm btn-primary">
                    Gerenciar Materiais
                  </Link>
                  <Link to="/admin/planos" className="btn btn-sm btn-primary">
                    Gerenciar Planos
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default DashboardAdmin



