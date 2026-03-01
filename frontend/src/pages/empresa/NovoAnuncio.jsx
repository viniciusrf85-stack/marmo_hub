import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const NovoAnuncio = () => {
  const [tiposMateriais, setTiposMateriais] = useState([])
  const [formData, setFormData] = useState({
    tipo_material_id: '',
    nome: '',
    descricao: '',
    cor_predominante: '',
    origem: '',
    acabamento: 'polido',
    valor_m2: '',
    valor_chapa: '',
    quantidade_chapas: '',
    quantidade_m2: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    carregarTipos()
  }, [])

  const carregarTipos = async () => {
    try {
      const response = await axios.get('/api/tipos-materiais')
      setTiposMateriais(response.data)
    } catch (error) {
      console.error('Erro ao carregar tipos:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/api/materiais', formData)
      alert('Material cadastrado com sucesso!')
      navigate('/empresa/anuncios')
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao cadastrar material')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h1>Novo Anúncio</h1>
        
        <form onSubmit={handleSubmit} className="card" style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label">Tipo de Material *</label>
            <select
              name="tipo_material_id"
              className="form-control"
              value={formData.tipo_material_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {tiposMateriais.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nome do Material *</label>
            <input
              type="text"
              name="nome"
              className="form-control"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea
              name="descricao"
              className="form-control"
              value={formData.descricao}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Cor Predominante</label>
              <input
                type="text"
                name="cor_predominante"
                className="form-control"
                value={formData.cor_predominante}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Origem</label>
              <input
                type="text"
                name="origem"
                className="form-control"
                value={formData.origem}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Valor m² (R$)</label>
              <input
                type="number"
                step="0.01"
                name="valor_m2"
                className="form-control"
                value={formData.valor_m2}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor Chapa (R$)</label>
              <input
                type="number"
                step="0.01"
                name="valor_chapa"
                className="form-control"
                value={formData.valor_chapa}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar Material'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  )
}

export default NovoAnuncio



