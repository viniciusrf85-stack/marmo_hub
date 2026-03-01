import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './FormVenda.css';

export default function FormVenda() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agenciador, setAgenciador] = useState(null);
  
  const [formData, setFormData] = useState({
    numero_processo: '',
    cliente_nome: '',
    quantidade_chapas: '',
    valor_total: '',
    comissao_percentual: '5',
    data_venda: new Date().toISOString().split('T')[0],
    descricao: ''
  });

  const [parcelas, setParcelas] = useState([]);
  const [novaParcela, setNovaParcela] = useState({
    numero_parcela: 1,
    valor: '',
    data_vencimento: '',
    forma_pagamento: 'boleto',
    numero_boleto: ''
  });

  // Buscar agenciador
  useEffect(() => {
    const fetchAgenciador = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await api.get('/api/agenciadores');
        const agenciadoresData = res.data.data || [];
        const meuAgenciador = agenciadoresData.find(a => a.usuario_id === user.id);
        setAgenciador(meuAgenciador);

        if (id) {
          // Carregar venda existente
          const vendaRes = await api.get(`/api/vendas-agenciador/${id}`);
          const venda = vendaRes.data.data;
          setFormData({
            numero_processo: venda.numero_processo,
            cliente_nome: venda.cliente_nome,
            quantidade_chapas: venda.quantidade_chapas || '',
            valor_total: venda.valor_total,
            comissao_percentual: venda.comissao_percentual,
            data_venda: venda.data_venda,
            descricao: venda.descricao || ''
          });
          setParcelas(venda.parcelas || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar dados');
      }
    };

    fetchAgenciador();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParcelaChange = (e) => {
    const { name, value } = e.target;
    setNovaParcela(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const adicionarParcela = () => {
    if (!novaParcela.valor || !novaParcela.data_vencimento) {
      setError('Preencha valor e data de vencimento da parcela');
      return;
    }

    setParcelas(prev => [
      ...prev,
      {
        ...novaParcela,
        id: Date.now()
      }
    ]);

    setNovaParcela({
      numero_parcela: novaParcela.numero_parcela + 1,
      valor: '',
      data_vencimento: '',
      forma_pagamento: 'boleto',
      numero_boleto: ''
    });
  };

  const removerParcela = (id) => {
    setParcelas(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.numero_processo || !formData.cliente_nome || !formData.valor_total) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (parcelas.length === 0) {
      setError('Adicione pelo menos uma parcela');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Criar/atualizar venda
      const vendaPayload = {
        agenciador_id: agenciador.id,
        numero_processo: formData.numero_processo,
        cliente_nome: formData.cliente_nome,
        quantidade_chapas: formData.quantidade_chapas ? parseInt(formData.quantidade_chapas) : null,
        valor_total: parseFloat(formData.valor_total),
        comissao_percentual: parseFloat(formData.comissao_percentual),
        data_venda: formData.data_venda,
        descricao: formData.descricao
      };

      let vendaId = id;
      if (!id) {
        const vendaRes = await api.post('/api/vendas-agenciador', vendaPayload);
        vendaId = vendaRes.data.data.id;
      } else {
        await api.put(`/api/vendas-agenciador/${id}`, vendaPayload);
      }

      // Criar parcelas
      for (const parcela of parcelas) {
        if (!parcela.id || typeof parcela.id === 'number') {
          // Nova parcela
          await api.post('/api/parcelas-agenciador', {
            venda_id: vendaId,
            numero_parcela: parcela.numero_parcela,
            valor: parseFloat(parcela.valor),
            data_vencimento: parcela.data_vencimento,
            forma_pagamento: parcela.forma_pagamento,
            numero_boleto: parcela.numero_boleto || null
          });
        }
      }

      navigate('/agenciador-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar venda');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!agenciador) {
    return <div className="form-venda">Carregando...</div>;
  }

  return (
    <div className="form-venda">
      <div className="form-header">
        <h1>{id ? 'Editar Venda' : 'Nova Venda'}</h1>
        <button 
          className="btn-voltar"
          onClick={() => navigate('/agenciador-dashboard')}
        >
          ← Voltar
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form-container">
        {/* Seção: Dados da Venda */}
        <div className="form-section">
          <h2>Dados da Venda</h2>

          <div className="form-group">
            <label>Número do Processo *</label>
            <input
              type="text"
              name="numero_processo"
              value={formData.numero_processo}
              onChange={handleInputChange}
              placeholder="Ex: PROC-001"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cliente *</label>
              <input
                type="text"
                name="cliente_nome"
                value={formData.cliente_nome}
                onChange={handleInputChange}
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div className="form-group">
              <label>Data da Venda *</label>
              <input
                type="date"
                name="data_venda"
                value={formData.data_venda}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantidade de Chapas</label>
              <input
                type="number"
                name="quantidade_chapas"
                value={formData.quantidade_chapas}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Valor Total *</label>
              <input
                type="number"
                name="valor_total"
                value={formData.valor_total}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Comissão (%)</label>
              <input
                type="number"
                name="comissao_percentual"
                value={formData.comissao_percentual}
                onChange={handleInputChange}
                placeholder="5"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Observações sobre a venda"
              rows="3"
            />
          </div>
        </div>

        {/* Seção: Parcelas */}
        <div className="form-section">
          <h2>Parcelas de Pagamento</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Número da Parcela</label>
              <input
                type="number"
                value={novaParcela.numero_parcela}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Valor *</label>
              <input
                type="number"
                name="valor"
                value={novaParcela.valor}
                onChange={handleParcelaChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Data de Vencimento *</label>
              <input
                type="date"
                name="data_vencimento"
                value={novaParcela.data_vencimento}
                onChange={handleParcelaChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Forma de Pagamento</label>
              <select
                name="forma_pagamento"
                value={novaParcela.forma_pagamento}
                onChange={handleParcelaChange}
              >
                <option value="boleto">Boleto</option>
                <option value="cheque">Cheque</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="transferencia">Transferência</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Número do Boleto</label>
              <input
                type="text"
                name="numero_boleto"
                value={novaParcela.numero_boleto}
                onChange={handleParcelaChange}
                placeholder="Opcional"
              />
            </div>

            <div className="form-group">
              <label>&nbsp;</label>
              <button
                type="button"
                className="btn-adicionar"
                onClick={adicionarParcela}
              >
                + Adicionar Parcela
              </button>
            </div>
          </div>

          {/* Lista de Parcelas */}
          {parcelas.length > 0 && (
            <div className="parcelas-list">
              <h3>Parcelas Adicionadas</h3>
              <table className="tabela-parcelas">
                <thead>
                  <tr>
                    <th>Parcela</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                    <th>Forma</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelas.map((parcela, idx) => (
                    <tr key={parcela.id}>
                      <td>{parcela.numero_parcela}</td>
                      <td>R$ {parseFloat(parcela.valor).toFixed(2)}</td>
                      <td>{new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}</td>
                      <td>{parcela.forma_pagamento}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-remover"
                          onClick={() => removerParcela(parcela.id)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-parcelas">
                <strong>Total: R$ {parcelas.reduce((sum, p) => sum + parseFloat(p.valor || 0), 0).toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancelar"
            onClick={() => navigate('/agenciador-dashboard')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-salvar"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Venda'}
          </button>
        </div>
      </form>
    </div>
  );
}
