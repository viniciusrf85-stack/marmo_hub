import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SelecaoCadastro.css';

export default function SelecaoCadastro() {
  const navigate = useNavigate();

  const opcoesCadastro = [
    {
      id: 'empresa',
      titulo: 'Sou Empresa',
      descricao: 'Quero anunciar pedras ornamentais',
      icone: '🏢',
      features: ['CNPJ obrigatório', 'Planos disponíveis'],
      cor: 'laranja',
      rota: '/registro-empresa'
    },
    {
      id: 'cliente',
      titulo: 'Sou Cliente',
      descricao: 'Quero buscar e comprar pedras',
      icone: '👤',
      features: ['Consumidor', 'Marmoreista', 'Atacadista', 'Construtor'],
      cor: 'azul',
      rota: '/registro-cliente'
    },
    {
      id: 'agenciador',
      titulo: 'Sou Agenciador',
      descricao: 'Quero intermediar vendas e receber comissões',
      icone: '💼',
      features: ['Comissão', 'Relatórios', 'Controle de Vendas'],
      cor: 'verde',
      rota: '/registro-agenciador',
      destaque: true
    }
  ];

  return (
    <div className="selecao-cadastro">
      <div className="container-selecao">
        <div className="header-selecao">
          <h1>Criar Conta</h1>
          <p>Escolha o tipo de cadastro</p>
          <span className="badge-novo">✓ Nova versão carregada - Selecione abaixo</span>
        </div>

        <div className="opcoes-grid">
          {opcoesCadastro.map((opcao) => (
            <div
              key={opcao.id}
              className={`card-opcao ${opcao.cor} ${opcao.destaque ? 'destaque' : ''}`}
              onClick={() => navigate(opcao.rota)}
            >
              {opcao.destaque && <div className="badge-novo-opcao">NOVO</div>}
              
              <div className="icone-opcao">{opcao.icone}</div>
              
              <h2>{opcao.titulo}</h2>
              
              <p className="descricao">{opcao.descricao}</p>
              
              <div className="features-list">
                {opcao.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <span className="feature-dot">•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button className="btn-selecionar">
                Continuar →
              </button>
            </div>
          ))}
        </div>

        <div className="footer-selecao">
          <p>
            Já tem uma conta? <a href="/login">Entrar</a>
          </p>
        </div>
      </div>
    </div>
  );
}
