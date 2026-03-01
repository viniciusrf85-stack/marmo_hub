import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const GerenciarEmpresas = () => {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas') // todas, pendentes, aprovadas
  const [busca, setBusca] = useState('')

  // Verificar se há filtro na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const filtroUrl = params.get('filtro')
    if (filtroUrl === 'pendentes') {
      setFiltro('pendentes')
    }
  }, [])

  useEffect(() => {
    carregarContas()
  }, [filtro])

  const carregarContas = async () => {
    try {
      setLoading(true)
      let url = '/api/contas'
      const params = new URLSearchParams()

      if (filtro === 'pendentes') {
        params.append('aprovada', '0') // Usar '0' em vez de 'false' para compatibilidade
      } else if (filtro === 'aprovadas') {
        params.append('aprovada', '1') // Usar '1' em vez de 'true' para compatibilidade
      }

      if (busca) {
        params.append('cidade', busca)
      }

      if (params.toString()) {
        url += '?' + params.toString()
      }

      console.log('Carregando contas:', url)
      const response = await axios.get(url)
      console.log('Contas recebidas:', response.data)
      setContas(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
      console.error('Detalhes do erro:', error.response?.data)
      alert(error.response?.data?.error || 'Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  const aprovarConta = async (id) => {
    if (!confirm('Deseja aprovar esta empresa?')) return

    try {
      await axios.patch(`/api/contas/${id}/aprovar`)
      alert('Empresa aprovada com sucesso!')
      carregarContas()
    } catch (error) {
      console.error('Erro ao aprovar conta:', error)
      alert(error.response?.data?.error || 'Erro ao aprovar empresa')
    }
  }

  const ativarDesativarConta = async (id, ativa) => {
    const acao = ativa ? 'desativar' : 'ativar'
    if (!confirm(`Deseja ${acao} esta empresa?`)) return

    try {
      await axios.patch(`/api/contas/${id}/status`, { ativa: !ativa })
      alert(`Empresa ${ativa ? 'desativada' : 'ativada'} com sucesso!`)
      carregarContas()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert(error.response?.data?.error || 'Erro ao atualizar status')
    }
  }

  const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  // Filtrar por busca (se houver)
  const contasFiltradas = busca 
    ? contas.filter(conta => {
        const buscaLower = busca.toLowerCase()
        return (
          conta.nome_fantasia?.toLowerCase().includes(buscaLower) ||
          conta.razao_social?.toLowerCase().includes(buscaLower) ||
          conta.cnpj?.includes(busca) ||
          conta.email?.toLowerCase().includes(buscaLower) ||
          conta.cidade?.toLowerCase().includes(buscaLower)
        )
      })
    : contas

  const contasPendentes = contas.filter(c => !c.aprovada).length
  const contasAprovadas = contas.filter(c => c.aprovada).length

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h1>Gerenciar Empresas</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Total: {contas.length} | {contasPendentes} pendentes | {contasAprovadas} aprovadas
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Filtrar por status:
              </label>
              <select
                className="form-control"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="todas">Todas</option>
                <option value="pendentes">Pendentes</option>
                <option value="aprovadas">Aprovadas</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Buscar:
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nome, CNPJ, email ou cidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <button
                onClick={carregarContas}
                className="btn btn-secondary"
                style={{ marginTop: '20px' }}
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de empresas */}
        {loading ? (
          <div className="loading">Carregando empresas...</div>
        ) : contas.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666' }}>
              Nenhuma empresa cadastrada no sistema.
            </p>
          </div>
        ) : contasFiltradas.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666' }}>
              {filtro === 'pendentes' 
                ? 'Nenhuma empresa pendente de aprovação' 
                : filtro === 'aprovadas'
                ? 'Nenhuma empresa aprovada'
                : 'Nenhuma empresa encontrada com os filtros aplicados'}
            </p>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#999', marginTop: '10px' }}>
              Total de empresas: {contas.length}
            </p>
          </div>
        ) : (
          <div className="grid grid-1" style={{ gap: '15px' }}>
            {contasFiltradas.map(conta => (
              <div key={conta.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0 }}>{conta.nome_fantasia}</h3>
                      {!conta.aprovada && (
                        <span className="badge" style={{ backgroundColor: '#f59e0b', color: '#fff' }}>
                          Pendente
                        </span>
                      )}
                      {conta.aprovada && (
                        <span className="badge" style={{ backgroundColor: '#10b981', color: '#fff' }}>
                          Aprovada
                        </span>
                      )}
                      {!conta.ativa && (
                        <span className="badge" style={{ backgroundColor: '#ef4444', color: '#fff' }}>
                          Inativa
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px', color: '#666' }}>
                      <div>
                        <strong>Razão Social:</strong> {conta.razao_social}
                      </div>
                      <div>
                        <strong>CNPJ:</strong> {conta.cnpj}
                      </div>
                      <div>
                        <strong>Email:</strong> {conta.email}
                      </div>
                      <div>
                        <strong>Plano:</strong> {conta.plano_nome || 'Nenhum'}
                      </div>
                      <div>
                        <strong>Anúncios:</strong> {conta.anuncios_utilizados || 0} / {conta.anuncios_disponiveis || 0}
                      </div>
                      <div>
                        <strong>Localização:</strong> {conta.cidade || '-'}, {conta.estado || '-'}
                      </div>
                      <div>
                        <strong>Telefone:</strong> {conta.telefone_comercial || '-'}
                      </div>
                      <div>
                        <strong>WhatsApp:</strong> {conta.whatsapp || '-'}
                      </div>
                      <div>
                        <strong>Cadastro:</strong> {formatarData(conta.data_cadastro)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
                    {!conta.aprovada && (
                      <button
                        onClick={() => aprovarConta(conta.id)}
                        className="btn btn-primary btn-sm"
                      >
                        ✓ Aprovar
                      </button>
                    )}
                    <button
                      onClick={() => ativarDesativarConta(conta.id, conta.ativa)}
                      className={`btn btn-sm ${conta.ativa ? 'btn-danger' : 'btn-success'}`}
                    >
                      {conta.ativa ? '✗ Desativar' : '✓ Ativar'}
                    </button>
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

export default GerenciarEmpresas
