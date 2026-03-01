import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const DashboardEmpresa = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDashboard()
  }, [])

  const carregarDashboard = async () => {
    try {
      const response = await axios.get('/api/dashboard/conta')
      setDashboard(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
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
        <h1>Dashboard da Empresa</h1>
        
        {dashboard && (
          <>
            <div className="grid grid-4" style={{ marginTop: '20px' }}>
              <div className="card text-center">
                <h2>{dashboard.estatisticas.total_materiais}</h2>
                <p>Total de Materiais</p>
              </div>
              <div className="card text-center">
                <h2>{dashboard.estatisticas.materiais_ativos}</h2>
                <p>Materiais Ativos</p>
              </div>
              <div className="card text-center">
                <h2>{dashboard.estatisticas.total_visualizacoes}</h2>
                <p>Total de Visualizações</p>
              </div>
              <div className="card text-center">
                <h2>{dashboard.estatisticas.total_contatos}</h2>
                <p>Contatos Recebidos</p>
              </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h3>Informações do Plano</h3>
              <p><strong>Plano Atual:</strong> {dashboard.conta.plano_nome || 'Nenhum'}</p>
              <p><strong>Anúncios Disponíveis:</strong> {dashboard.conta.anuncios_disponiveis}</p>
              <p><strong>Anúncios Utilizados:</strong> {dashboard.conta.anuncios_utilizados}</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <Link to="/empresa/anuncios/novo" className="btn btn-primary">
                Criar Novo Anúncio
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default DashboardEmpresa



