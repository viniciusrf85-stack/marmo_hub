import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AgenciadorDashboard.css';

export default function AgenciadorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vendas');
  
  // Estados para dados
  const [agenciador, setAgenciador] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  
  // Estados para paginação
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Estados para filtros
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());

  // Buscar dados do agenciador
  useEffect(() => {
    const fetchAgenciador = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Buscar agenciador
        const agenciadoresRes = await api.get('/api/agenciadores');
        const agenciadoresData = agenciadoresRes.data.data || [];
        const meuAgenciador = agenciadoresData.find(a => a.usuario_id === user.id);
        
        if (meuAgenciador) {
          setAgenciador(meuAgenciador);
          await fetchVendas(meuAgenciador.id);
          await fetchRelatorio(meuAgenciador.id);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar dados');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgenciador();
  }, []);

  // Buscar vendas
  const fetchVendas = async (agenciadorId) => {
    try {
      const res = await api.get('/api/vendas-agenciador', {
        params: {
          agenciador_id: agenciadorId,
          status: filtroStatus || undefined,
          page,
          limit
        }
      });
      setVendas(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Erro ao buscar vendas:', err);
    }
  };

  // Buscar parcelas
  const fetchParcelas = async (agenciadorId) => {
    try {
      const res = await api.get('/api/parcelas-agenciador', {
        params: {
          venda_id: agenciadorId,
          page,
          limit
        }
      });
      setParcelas(res.data.data || []);
    } catch (err) {
      console.error('Erro ao buscar parcelas:', err);
    }
  };

  // Buscar clientes
  const fetchClientes = async (agenciadorId) => {
    try {
      const res = await api.get('/api/clientes-agenciador', {
        params: {
          agenciador_id: agenciadorId,
          page,
          limit
        }
      });
      setClientes(res.data.data || []);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  };

  // Buscar relatório
  const fetchRelatorio = async (agenciadorId) => {
    try {
      const res = await api.get(
        `/api/relatorios-agenciador/agenciador/${agenciadorId}/mensal`,
        {
          params: {
            mes: filtroMes,
            ano: filtroAno
          }
        }
      );
      setRelatorio(res.data.data || null);
    } catch (err) {
      console.error('Erro ao buscar relatório:', err);
    }
  };

  // Atualizar ao mudar aba
  useEffect(() => {
    if (!agenciador) return;

    if (activeTab === 'vendas') {
      fetchVendas(agenciador.id);
    } else if (activeTab === 'parcelas') {
      fetchParcelas(agenciador.id);
    } else if (activeTab === 'clientes') {
      fetchClientes(agenciador.id);
    } else if (activeTab === 'relatorio') {
      fetchRelatorio(agenciador.id);
    }
  }, [activeTab, agenciador, page, filtroStatus, filtroMes, filtroAno]);

  if (loading) {
    return (
      <div className="agenciador-dashboard">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agenciador-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!agenciador) {
    return (
      <div className="agenciador-dashboard">
        <div className="error-message">Agenciador não encontrado</div>
      </div>
    );
  }

  return (
    <div className="agenciador-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard de Vendas</h1>
        <p>Agenciador: {agenciador.usuario_id}</p>
      </div>

      {/* Resumo Geral */}
      <div className="resumo-geral">
        <div className="card-resumo">
          <h3>Comissão Padrão</h3>
          <p className="valor">{agenciador.comissao_percentual}%</p>
        </div>
        <div className="card-resumo">
          <h3>Total de Vendas</h3>
          <p className="valor">{agenciador.total_vendas_intermediadas}</p>
        </div>
        <div className="card-resumo">
          <h3>Total de Comissões</h3>
          <p className="valor">R$ {parseFloat(agenciador.total_comissao || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'vendas' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendas')}
          >
            Vendas
          </button>
          <button 
            className={`tab ${activeTab === 'parcelas' ? 'active' : ''}`}
            onClick={() => setActiveTab('parcelas')}
          >
            Parcelas
          </button>
          <button 
            className={`tab ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clientes')}
          >
            Clientes
          </button>
          <button 
            className={`tab ${activeTab === 'relatorio' ? 'active' : ''}`}
            onClick={() => setActiveTab('relatorio')}
          >
            Relatório
          </button>
          <button 
            className="tab btn-empresas"
            onClick={() => navigate('/agenciador-empresas')}
          >
            ⚙️ Minhas Empresas
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="tabs-content">
        
        {/* Aba: Vendas */}
        {activeTab === 'vendas' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Minhas Vendas</h2>
              <button 
                className="btn-novo"
                onClick={() => navigate('/nova-venda')}
              >
                + Nova Venda
              </button>
            </div>

            {/* Filtros */}
            <div className="filtros">
              <select 
                value={filtroStatus}
                onChange={(e) => {
                  setFiltroStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Tabela de Vendas */}
            <div className="tabela-container">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Processo</th>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Comissão</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.length > 0 ? (
                    vendas.map(venda => (
                      <tr key={venda.id}>
                        <td>{venda.numero_processo}</td>
                        <td>{venda.cliente_nome}</td>
                        <td>R$ {parseFloat(venda.valor_total).toFixed(2)}</td>
                        <td>R$ {parseFloat(venda.comissao_valor || 0).toFixed(2)}</td>
                        <td>{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <span className={`status ${venda.status}`}>
                            {venda.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-pequeno"
                            onClick={() => navigate(`/venda/${venda.id}`)}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="sem-dados">Nenhuma venda encontrada</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="paginacao">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <span>Página {page} de {Math.ceil(total / limit)}</span>
              <button 
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </button>
            </div>
          </div>
        )}

        {/* Aba: Parcelas */}
        {activeTab === 'parcelas' && (
          <div className="tab-content">
            <h2>Parcelas de Pagamento</h2>
            
            <div className="tabela-container">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Venda</th>
                    <th>Número</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelas.length > 0 ? (
                    parcelas.map(parcela => (
                      <tr key={parcela.id}>
                        <td>{parcela.venda_id}</td>
                        <td>{parcela.numero_parcela}</td>
                        <td>R$ {parseFloat(parcela.valor).toFixed(2)}</td>
                        <td>{new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <span className={`status ${parcela.status}`}>
                            {parcela.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-pequeno">Editar</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="sem-dados">Nenhuma parcela encontrada</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aba: Clientes */}
        {activeTab === 'clientes' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Meus Clientes</h2>
              <button className="btn-novo">+ Novo Cliente</button>
            </div>
            
            <div className="tabela-container">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Total de Vendas</th>
                    <th>Valor Total</th>
                    <th>Prioridade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.length > 0 ? (
                    clientes.map(cliente => (
                      <tr key={cliente.id}>
                        <td>{cliente.nome_cliente}</td>
                        <td>{cliente.total_vendas || 0}</td>
                        <td>R$ {parseFloat(cliente.valor_total || 0).toFixed(2)}</td>
                        <td>
                          <span className={`prioridade ${cliente.prioridade}`}>
                            {cliente.prioridade}
                          </span>
                        </td>
                        <td>
                          <button className="btn-pequeno">Ver</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="sem-dados">Nenhum cliente encontrado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aba: Relatório */}
        {activeTab === 'relatorio' && (
          <div className="tab-content">
            <h2>Relatório Mensal</h2>
            
            <div className="filtros-relatorio">
              <select 
                value={filtroMes}
                onChange={(e) => setFiltroMes(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                  <option key={m} value={m}>
                    {new Date(2024, m - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select 
                value={filtroAno}
                onChange={(e) => setFiltroAno(parseInt(e.target.value))}
              >
                {[2024, 2025, 2026].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {relatorio && (
              <div className="relatorio-container">
                <div className="relatorio-card">
                  <h3>Total de Vendas</h3>
                  <p className="valor">R$ {parseFloat(relatorio.total_vendas || 0).toFixed(2)}</p>
                </div>
                <div className="relatorio-card">
                  <h3>Comissões</h3>
                  <p className="valor">R$ {parseFloat(relatorio.total_comissoes || 0).toFixed(2)}</p>
                </div>
                <div className="relatorio-card">
                  <h3>Parcelas Pagas</h3>
                  <p className="valor">{relatorio.parcelas_pagas || 0}</p>
                </div>
                <div className="relatorio-card">
                  <h3>Parcelas Pendentes</h3>
                  <p className="valor">{relatorio.parcelas_pendentes || 0}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
