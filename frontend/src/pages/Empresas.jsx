import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Empresas = () => {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarEmpresas()
  }, [])

  const carregarEmpresas = async () => {
    try {
      const response = await axios.get('/api/contas?ativa=true&aprovada=true')
      setEmpresas(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h1>Empresas Cadastradas</h1>
        {loading ? (
          <div className="loading">Carregando empresas...</div>
        ) : (
          <div className="grid grid-3" style={{ marginTop: '20px' }}>
            {empresas.map(empresa => (
              <div key={empresa.id} className="card">
                <h3>{empresa.nome_fantasia}</h3>
                <p>{empresa.cidade}, {empresa.estado}</p>
                {empresa.telefone_comercial && <p>📞 {empresa.telefone_comercial}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Empresas



