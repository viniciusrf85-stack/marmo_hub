import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/home.css'

const Home = () => {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [materiais, setMateriais] = useState([])
  const [tiposMateriais, setTiposMateriais] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo_material_id: '',
    preco_min: '',
    preco_max: '',
    cidade: '',
    estado: '',
    promocao: false,
    destaque: false
  })

  useEffect(() => {
    // Redirecionar administradores para o dashboard
    if (usuario?.tipo_entidade === 'administrador') {
      navigate('/admin/dashboard')
      return
    }
    carregarDados()
  }, [usuario, navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarMateriais()
    }, 500)
    return () => clearTimeout(timer)
  }, [filtros])

  const carregarDados = async () => {
    try {
      const [materiaisRes, tiposRes] = await Promise.all([
        axios.get('/api/materiais'),
        axios.get('/api/tipos-materiais')
      ])
      setMateriais(materiaisRes.data.materiais || materiaisRes.data)
      setTiposMateriais(tiposRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const buscarMateriais = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const response = await axios.get(`/api/materiais?${params}`)
      setMateriais(response.data.materiais || response.data)
    } catch (error) {
      console.error('Erro ao buscar materiais:', error)
    }
  }

  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target
    setFiltros({
      ...filtros,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      tipo_material_id: '',
      preco_min: '',
      preco_max: '',
      cidade: '',
      estado: '',
      promocao: false,
      destaque: false
    })
  }

  const formatarPreco = (preco) => {
    if (!preco) return 'Consulte'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco)
  }

  return (
    <div className="page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Encontre as Melhores Pedras Ornamentais</h1>
          <p className="hero-subtitle">
            Granito, Mármore e muito mais direto do Espírito Santo
          </p>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Buscar por nome, tipo de material..."
              className="hero-search-input"
              name="busca"
              value={filtros.busca}
              onChange={handleFiltroChange}
            />
            <button className="btn btn-primary">
              Buscar
            </button>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="marketplace">
          {/* Filtros laterais */}
          <aside className="filtros-sidebar">
            <div className="filtros-header">
              <h3>Filtros</h3>
              <button onClick={limparFiltros} className="btn-text">
                Limpar
              </button>
            </div>

            <div className="filtro-group">
              <label className="filtro-label">Tipo de Material</label>
              <select
                name="tipo_material_id"
                className="form-control"
                value={filtros.tipo_material_id}
                onChange={handleFiltroChange}
              >
                <option value="">Todos</option>
                {tiposMateriais.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-group">
              <label className="filtro-label">Faixa de Preço (m²)</label>
              <div className="preco-inputs">
                <input
                  type="number"
                  name="preco_min"
                  placeholder="Mín"
                  className="form-control"
                  value={filtros.preco_min}
                  onChange={handleFiltroChange}
                />
                <span>até</span>
                <input
                  type="number"
                  name="preco_max"
                  placeholder="Máx"
                  className="form-control"
                  value={filtros.preco_max}
                  onChange={handleFiltroChange}
                />
              </div>
            </div>

            <div className="filtro-group">
              <label className="filtro-label">Localização</label>
              <input
                type="text"
                name="cidade"
                placeholder="Cidade"
                className="form-control"
                value={filtros.cidade}
                onChange={handleFiltroChange}
              />
              <input
                type="text"
                name="estado"
                placeholder="Estado (UF)"
                className="form-control"
                value={filtros.estado}
                onChange={handleFiltroChange}
                maxLength={2}
                style={{ marginTop: '8px' }}
              />
            </div>

            <div className="filtro-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="promocao"
                  checked={filtros.promocao}
                  onChange={handleFiltroChange}
                />
                <span>Apenas promoções</span>
              </label>
            </div>

            <div className="filtro-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="destaque"
                  checked={filtros.destaque}
                  onChange={handleFiltroChange}
                />
                <span>Destaques</span>
              </label>
            </div>
          </aside>

          {/* Grade de materiais */}
          <div className="materiais-grid">
            {loading ? (
              <div className="loading">Carregando materiais...</div>
            ) : materiais.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum material encontrado com os filtros selecionados.</p>
                <button onClick={limparFiltros} className="btn btn-primary">
                  Ver todos os materiais
                </button>
              </div>
            ) : (
              materiais.map(material => (
                <Link
                  key={material.id}
                  to={`/material/${material.id}`}
                  className="material-card"
                >
                  <div className="material-image">
                    {material.foto_principal ? (
                      <img src={material.foto_principal} alt={material.nome} />
                    ) : (
                      <div className="material-image-placeholder">
                        <span>Sem foto</span>
                      </div>
                    )}
                    {material.promocao && (
                      <span className="badge-promocao">Promoção</span>
                    )}
                    {material.destaque && (
                      <span className="badge-destaque">Destaque</span>
                    )}
                  </div>

                  <div className="material-info">
                    <h3 className="material-nome">{material.nome}</h3>
                    <p className="material-tipo">{material.tipo_material}</p>
                    
                    {material.cor_predominante && (
                      <p className="material-cor">Cor: {material.cor_predominante}</p>
                    )}

                    <div className="material-preco">
                      {material.promocao && material.valor_promocional ? (
                        <>
                          <span className="preco-antigo">
                            {formatarPreco(material.valor_m2)}
                          </span>
                          <span className="preco-atual">
                            {formatarPreco(material.valor_promocional)}/m²
                          </span>
                        </>
                      ) : (
                        <span className="preco-atual">
                          {formatarPreco(material.valor_m2)}/m²
                        </span>
                      )}
                    </div>

                    <div className="material-empresa">
                      <span className="empresa-nome">{material.empresa_nome}</span>
                      <span className="empresa-local">
                        {material.empresa_cidade}, {material.empresa_estado}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Home



