import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const MeusAnuncios = () => {
  const [materiais, setMateriais] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarMateriais()
  }, [])

  const carregarMateriais = async () => {
    try {
      const response = await axios.get('/api/materiais/conta/meus-materiais')
      setMateriais(response.data)
    } catch (error) {
      console.error('Erro ao carregar materiais:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletarMaterial = async (id) => {
    if (!confirm('Deseja realmente deletar este material?')) return
    
    try {
      await axios.delete(`/api/materiais/${id}`)
      setMateriais(materiais.filter(m => m.id !== id))
      alert('Material deletado com sucesso!')
    } catch (error) {
      alert('Erro ao deletar material')
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h1>Meus Anúncios</h1>
          <Link to="/empresa/anuncios/novo" className="btn btn-primary">
            Novo Anúncio
          </Link>
        </div>

        {loading ? (
          <div className="loading">Carregando anúncios...</div>
        ) : materiais.length === 0 ? (
          <div className="card">
            <p>Você ainda não tem anúncios cadastrados.</p>
            <Link to="/empresa/anuncios/novo" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Criar Primeiro Anúncio
            </Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {materiais.map(material => (
              <div key={material.id} className="card">
                <h3>{material.nome}</h3>
                <p><strong>Tipo:</strong> {material.tipo_material}</p>
                <p><strong>Status:</strong> {material.ativo ? '✓ Ativo' : '✗ Inativo'}</p>
                <p><strong>Aprovado:</strong> {material.aprovado ? '✓ Sim' : '⏳ Pendente'}</p>
                <p><strong>Visualizações:</strong> {material.visualizacoes}</p>
                <div className="flex gap-2" style={{ marginTop: '10px' }}>
                  <Link to={`/empresa/anuncios/editar/${material.id}`} className="btn btn-sm btn-secondary">
                    Editar
                  </Link>
                  <button onClick={() => deletarMaterial(material.id)} className="btn btn-sm btn-danger">
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default MeusAnuncios



