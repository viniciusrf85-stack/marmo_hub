import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './RegistroAgenciador.css';

export default function RegistroAgenciador() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Dados Pessoais, 2: Dados Empresa, 3: Confirmação

  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    
    // Dados da Empresa
    nome_empresa: '',
    cnpj_cpf: '',
    tipo_pessoa: 'pj',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    comissao_percentual: 5.00
  });

  const [errosCampo, setErrosCampo] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro do campo
    if (errosCampo[name]) {
      setErrosCampo(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validarStep1 = () => {
    const erros = {};

    if (!formData.nome || formData.nome.length < 3) {
      erros.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erros.email = 'Email inválido';
    }

    if (!formData.telefone || !/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) {
      erros.telefone = 'Telefone deve ter 10 ou 11 dígitos';
    }

    if (!formData.senha || formData.senha.length < 8) {
      erros.senha = 'Senha deve ter no mínimo 8 caracteres';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.senha)) {
      erros.senha = 'Senha deve conter maiúsculas, minúsculas e números';
    }

    if (formData.senha !== formData.confirmarSenha) {
      erros.confirmarSenha = 'Senhas não coincidem';
    }

    setErrosCampo(erros);
    return Object.keys(erros).length === 0;
  };

  const validarStep2 = () => {
    const erros = {};

    if (!formData.nome_empresa || formData.nome_empresa.length < 3) {
      erros.nome_empresa = 'Nome da empresa deve ter no mínimo 3 caracteres';
    }

    if (!formData.cnpj_cpf || !/^\d{11,14}$/.test(formData.cnpj_cpf.replace(/\D/g, ''))) {
      erros.cnpj_cpf = 'CNPJ/CPF inválido';
    }

    if (!formData.endereco || formData.endereco.length < 5) {
      erros.endereco = 'Endereço inválido';
    }

    if (!formData.cidade || formData.cidade.length < 3) {
      erros.cidade = 'Cidade inválida';
    }

    if (!formData.estado || formData.estado.length !== 2) {
      erros.estado = 'Estado deve ter 2 caracteres';
    }

    if (!formData.cep || !/^\d{8}$/.test(formData.cep.replace(/\D/g, ''))) {
      erros.cep = 'CEP deve ter 8 dígitos';
    }

    setErrosCampo(erros);
    return Object.keys(erros).length === 0;
  };

  const handleProximoStep = () => {
    if (step === 1 && validarStep1()) {
      setStep(2);
      setError(null);
    } else if (step === 2 && validarStep2()) {
      setStep(3);
      setError(null);
    }
  };

  const handleVoltarStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step !== 3) {
      handleProximoStep();
      return;
    }

    if (!validarStep2()) {
      setStep(2);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''),
        senha: formData.senha,
        nome_empresa: formData.nome_empresa,
        cnpj_cpf: formData.cnpj_cpf.replace(/\D/g, ''),
        tipo_pessoa: formData.tipo_pessoa,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado.toUpperCase(),
        cep: formData.cep.replace(/\D/g, ''),
        comissao_percentual: parseFloat(formData.comissao_percentual)
      };

      const response = await api.post('/api/auth/registro-agenciador', payload);

      if (response.data.success) {
        setSuccess(true);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        localStorage.setItem('token', response.data.data.token);

        setTimeout(() => {
          navigate('/agenciador-dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar agenciador');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatarCEP = (valor) => {
    return valor.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatarCNPJCPF = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length === 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <div className="registro-agenciador">
      <div className="container-registro">
        <div className="header-registro">
          <button 
            className="btn-voltar-header"
            onClick={() => navigate('/selecao-cadastro')}
          >
            ← Voltar
          </button>
          <h1>Registrar como Agenciador</h1>
          <p>Intermedie vendas e receba comissões</p>
        </div>

        {success && (
          <div className="success-message">
            ✓ Agenciador registrado com sucesso! Redirecionando...
          </div>
        )}

        {error && (
          <div className="error-message">
            ✗ {error}
          </div>
        )}

        {/* Indicador de Progresso */}
        <div className="progress-indicator">
          <div className={`step ${step >= 1 ? 'ativo' : ''}`}>
            <div className="step-numero">1</div>
            <div className="step-label">Dados Pessoais</div>
          </div>
          <div className="step-linha"></div>
          <div className={`step ${step >= 2 ? 'ativo' : ''}`}>
            <div className="step-numero">2</div>
            <div className="step-label">Dados Empresa</div>
          </div>
          <div className="step-linha"></div>
          <div className={`step ${step >= 3 ? 'ativo' : ''}`}>
            <div className="step-numero">3</div>
            <div className="step-label">Confirmação</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-registro">
          {/* STEP 1: Dados Pessoais */}
          {step === 1 && (
            <div className="form-step">
              <h2>Dados Pessoais</h2>

              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className={errosCampo.nome ? 'erro' : ''}
                />
                {errosCampo.nome && <span className="erro-texto">{errosCampo.nome}</span>}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className={errosCampo.email ? 'erro' : ''}
                />
                {errosCampo.email && <span className="erro-texto">{errosCampo.email}</span>}
              </div>

              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formatarTelefone(formData.telefone)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    telefone: e.target.value.replace(/\D/g, '')
                  }))}
                  placeholder="(11) 99999-9999"
                  className={errosCampo.telefone ? 'erro' : ''}
                />
                {errosCampo.telefone && <span className="erro-texto">{errosCampo.telefone}</span>}
              </div>

              <div className="form-group">
                <label>Senha *</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder="Mínimo 8 caracteres (maiúsculas, minúsculas, números)"
                  className={errosCampo.senha ? 'erro' : ''}
                />
                {errosCampo.senha && <span className="erro-texto">{errosCampo.senha}</span>}
              </div>

              <div className="form-group">
                <label>Confirmar Senha *</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  placeholder="Repita sua senha"
                  className={errosCampo.confirmarSenha ? 'erro' : ''}
                />
                {errosCampo.confirmarSenha && <span className="erro-texto">{errosCampo.confirmarSenha}</span>}
              </div>
            </div>
          )}

          {/* STEP 2: Dados da Empresa */}
          {step === 2 && (
            <div className="form-step">
              <h2>Dados da Empresa</h2>

              <div className="form-group">
                <label>Nome da Empresa *</label>
                <input
                  type="text"
                  name="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={handleInputChange}
                  placeholder="Nome da sua empresa"
                  className={errosCampo.nome_empresa ? 'erro' : ''}
                />
                {errosCampo.nome_empresa && <span className="erro-texto">{errosCampo.nome_empresa}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Pessoa *</label>
                  <select
                    name="tipo_pessoa"
                    value={formData.tipo_pessoa}
                    onChange={handleInputChange}
                  >
                    <option value="pj">Pessoa Jurídica (PJ)</option>
                    <option value="pf">Pessoa Física (PF)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{formData.tipo_pessoa === 'pj' ? 'CNPJ' : 'CPF'} *</label>
                  <input
                    type="text"
                    name="cnpj_cpf"
                    value={formatarCNPJCPF(formData.cnpj_cpf)}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cnpj_cpf: e.target.value.replace(/\D/g, '')
                    }))}
                    placeholder={formData.tipo_pessoa === 'pj' ? '00.000.000/0000-00' : '000.000.000-00'}
                    className={errosCampo.cnpj_cpf ? 'erro' : ''}
                  />
                  {errosCampo.cnpj_cpf && <span className="erro-texto">{errosCampo.cnpj_cpf}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Endereço *</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento"
                  className={errosCampo.endereco ? 'erro' : ''}
                />
                {errosCampo.endereco && <span className="erro-texto">{errosCampo.endereco}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cidade *</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    placeholder="São Paulo"
                    className={errosCampo.cidade ? 'erro' : ''}
                  />
                  {errosCampo.cidade && <span className="erro-texto">{errosCampo.cidade}</span>}
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    placeholder="SP"
                    maxLength="2"
                    className={errosCampo.estado ? 'erro' : ''}
                  />
                  {errosCampo.estado && <span className="erro-texto">{errosCampo.estado}</span>}
                </div>

                <div className="form-group">
                  <label>CEP *</label>
                  <input
                    type="text"
                    name="cep"
                    value={formatarCEP(formData.cep)}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cep: e.target.value.replace(/\D/g, '')
                    }))}
                    placeholder="01234-567"
                    className={errosCampo.cep ? 'erro' : ''}
                  />
                  {errosCampo.cep && <span className="erro-texto">{errosCampo.cep}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Comissão Padrão (%)</label>
                <input
                  type="number"
                  name="comissao_percentual"
                  value={formData.comissao_percentual}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="5.00"
                />
                <small>Comissão padrão para suas vendas (pode ser alterada por venda)</small>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmação */}
          {step === 3 && (
            <div className="form-step">
              <h2>Confirmação de Dados</h2>

              <div className="confirmacao-secao">
                <h3>Dados Pessoais</h3>
                <div className="confirmacao-grid">
                  <div className="confirmacao-item">
                    <span className="label">Nome:</span>
                    <span className="valor">{formData.nome}</span>
                  </div>
                  <div className="confirmacao-item">
                    <span className="label">Email:</span>
                    <span className="valor">{formData.email}</span>
                  </div>
                  <div className="confirmacao-item">
                    <span className="label">Telefone:</span>
                    <span className="valor">{formatarTelefone(formData.telefone)}</span>
                  </div>
                </div>
              </div>

              <div className="confirmacao-secao">
                <h3>Dados da Empresa</h3>
                <div className="confirmacao-grid">
                  <div className="confirmacao-item">
                    <span className="label">Empresa:</span>
                    <span className="valor">{formData.nome_empresa}</span>
                  </div>
                  <div className="confirmacao-item">
                    <span className="label">{formData.tipo_pessoa === 'pj' ? 'CNPJ' : 'CPF'}:</span>
                    <span className="valor">{formatarCNPJCPF(formData.cnpj_cpf)}</span>
                  </div>
                  <div className="confirmacao-item">
                    <span className="label">Localização:</span>
                    <span className="valor">{formData.cidade}, {formData.estado}</span>
                  </div>
                  <div className="confirmacao-item">
                    <span className="label">Comissão:</span>
                    <span className="valor">{formData.comissao_percentual}%</span>
                  </div>
                </div>
              </div>

              <div className="confirmacao-aviso">
                <p>✓ Ao confirmar, você concorda com nossos termos de serviço e política de privacidade.</p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="form-actions">
            {step > 1 && (
              <button
                type="button"
                className="btn-voltar"
                onClick={handleVoltarStep}
              >
                ← Voltar
              </button>
            )}
            <button
              type="submit"
              className="btn-proximo"
              disabled={loading}
            >
              {loading ? 'Processando...' : step === 3 ? 'Confirmar Registro' : 'Próximo →'}
            </button>
          </div>
        </form>

        <div className="footer-registro">
          <p>Já tem uma conta? <a href="/login">Faça login aqui</a></p>
        </div>
      </div>
    </div>
  );
}
