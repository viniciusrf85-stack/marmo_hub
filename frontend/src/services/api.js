import axios from 'axios';

// Configurar URL base da API
// Usa VITE_API_URL do .env ou padrão localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

console.log('[API] Conectando em:', API_BASE_URL);

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log de erro para debug
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('[API] Erro de conexão:', error.message);
      console.error('[API] Verifique se o backend está rodando em', API_BASE_URL);
    }
    
    // Se receber 401 (não autorizado), redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
