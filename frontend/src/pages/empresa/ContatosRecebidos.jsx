import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const ContatosRecebidos = () => {
  const [contatos, setContatos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarContatos()
  }, [])

  const carregarContatos = async () => {
    try {
      const response = await axios.get('/api/contatos/conta')
      setContatos(response.data)
    } catch (error) {
      console.error('Erro ao carregar contatos:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarRespondido = async (id) => {
    try {
      await axios.patch(`/api/contatos/${id}/respondido`)
      setContatos(contatos.map(c => 
        c.id === id ? { ...c, respondido: true } : c
      ))
    } catch (error) {
      alert('Erro ao marcar como respondido')
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="loading">Carregando contatos...</div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h1>Contatos Recebidos</h1>
        
        {contatos.length === 0 ? (
          <div className="card">
            <p>Nenhum contato recebido ainda.</p>
          </div>
        ) : (
          <div className="grid grid-1" style={{ marginTop: '20px' }}>
            {contatos.map(contato => (
              <div key={contato.id} className="card">
                <div className="flex-between">
                  <div>
                    <h3>{contato.nome}</h3>
                    <p><strong>Material:</strong> {contato.material_nome}</p>
                    <p><strong>Email:</strong> {contato.email}</p>
                    {contato.telefone && <p><strong>Telefone:</strong> {contato.telefone}</p>}
                    <p><strong>Mensagem:</strong> {contato.mensagem}</p>
                    <p style={{ fontSize: '12px', opacity: 0.7 }}>
                      {new Date(contato.data_contato).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    {!contato.respondido && (
                      <button
                        onClick={() => marcarRespondido(contato.id)}
                        className="btn btn-sm btn-primary"
                      >
                        Marcar como Respondido
                      </button>
                    )}
                    {contato.respondido && (
                      <span className="badge badge-success">Respondido</span>
                    )}
                  </div>
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

export default ContatosRecebidos



