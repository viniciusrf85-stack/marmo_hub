import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const MaterialDetalhes = () => {
  const { id } = useParams()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarMaterial()
  }, [id])

  const carregarMaterial = async () => {
    try {
      const response = await axios.get(`/api/materiais/${id}`)
      setMaterial(response.data)
    } catch (error) {
      console.error('Erro ao carregar material:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarPreco = (preco) => {
    if (!preco) return 'Consulte'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco)
  }

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="loading">Carregando material...</div>
        <Footer />
      </div>
    )
  }

  if (!material) {
    return (
      <div className="page">
        <Navbar />
        <div className="container">
          <p>Material não encontrado.</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <div className="card">
          <h1>{material.nome}</h1>
          <p><strong>Tipo:</strong> {material.tipo_material}</p>
          <p><strong>Preço m²:</strong> {formatarPreco(material.valor_m2)}</p>
          <p><strong>Empresa:</strong> {material.empresa_nome}</p>
          {material.descricao && <p>{material.descricao}</p>}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MaterialDetalhes



