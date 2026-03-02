import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './RegistroAgenciador.css';

export default function RegistroAgenciador() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Dados Pessoais, 2: Confirmação

  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
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

  const handleProximo = () => {
    if (validarStep1()) {
      setStep(2);
      setError(null);
    }
  };

  const handleVoltar = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarStep1()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/registro-agenciador', {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        senha: formData.senha
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar agenciador');
      console.error('Erro ao registrar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-agenciador-container">
      <div className="registro-agenciador-card">
        <h1>Cadastro de Agenciador</h1>
        
        {/* Indicador de Progresso */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">DADOS PESSOAIS</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">CONFIRMAÇÃO</span>
          </div>
        </div>

        {success ? (
          <div className="success-message">
            <h2>✓ Cadastro Realizado com Sucesso!</h2>
            <p>Você será redirecionado para a página de login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* ETAPA 1: DADOS PESSOAIS */}
            {step === 1 && (
              <div className="form-section">
                <h2>Dados Pessoais</h2>
                
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome completo"
                    className={errosCampo.nome ? 'error' : ''}
                  />
                  {errosCampo.nome && <span className="error-message">{errosCampo.nome}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className={errosCampo.email ? 'error' : ''}
                    />
                    {errosCampo.email && <span className="error-message">{errosCampo.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="telefone">Telefone *</label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      placeholder="(00) 99999-9999"
                      className={errosCampo.telefone ? 'error' : ''}
                    />
                    {errosCampo.telefone && <span className="error-message">{errosCampo.telefone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="senha">Senha *</label>
                    <input
                      type="password"
                      id="senha"
                      name="senha"
                      value={formData.senha}
                      onChange={handleInputChange}
                      placeholder="Mínimo 8 caracteres (maiúsculas, minúsculas, números)"
                      autoComplete="new-password"
                      className={errosCampo.senha ? 'error' : ''}
                    />
                    {errosCampo.senha && <span className="error-message">{errosCampo.senha}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmarSenha">Confirmar Senha *</label>
                    <input
                      type="password"
                      id="confirmarSenha"
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleInputChange}
                      placeholder="Repita sua senha"
                      autoComplete="new-password"
                      className={errosCampo.confirmarSenha ? 'error' : ''}
                    />
                    {errosCampo.confirmarSenha && <span className="error-message">{errosCampo.confirmarSenha}</span>}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
                    ← Voltar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleProximo}>
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: CONFIRMAÇÃO */}
            {step === 2 && (
              <div className="form-section">
                <h2>Confirmação de Dados</h2>
                
                <div className="confirmation-box">
                  <h3>Dados Pessoais</h3>
                  <div className="confirmation-item">
                    <span className="label">Nome:</span>
                    <span className="value">{formData.nome}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="label">Email:</span>
                    <span className="value">{formData.email}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="label">Telefone:</span>
                    <span className="value">{formData.telefone}</span>
                  </div>
                </div>

                <div className="confirmation-notice">
                  <p>✓ Ao confirmar, você concordará com nossos termos de serviço e política de privacidade.</p>
                </div>

                {error && <div className="error-box">{error}</div>}

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleVoltar} disabled={loading}>
                    ← Voltar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Confirmar Registro'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
