import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  // Configurar axios com token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      verificarToken()
    } else {
      setLoading(false)
    }
  }, [])

  const verificarToken = async () => {
    try {
      const response = await axios.get('/api/auth/verificar')
      setUsuario(response.data.usuario)
    } catch (error) {
      console.error('Token inválido:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, senha) => {
    try {
      const response = await axios.post('/api/auth/login', { email, senha })
      const { token, usuario } = response.data

      if (!usuario) {
        throw new Error('Resposta inválida do servidor')
      }

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUsuario(usuario)

      return { success: true, usuario }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login'
      }
    }
  }

  const registroConta = async (dados) => {
    try {
      const response = await axios.post('/api/auth/registro-conta', dados)
      const { token, usuario } = response.data

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUsuario(usuario)

      return { success: true, usuario }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar conta'
      }
    }
  }

  const registroUsuario = async (dados) => {
    try {
      const response = await axios.post('/api/auth/registro-usuario', dados)
      const { token, usuario } = response.data

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUsuario(usuario)

      return { success: true, usuario }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar usuário'
      }
    }
  }

  // Mantido para compatibilidade (deprecado)
  const registro = async (dados) => {
    // Tenta determinar se é conta ou usuário baseado nos campos
    if (dados.cnpj || dados.razao_social) {
      return await registroConta(dados)
    } else {
      return await registroUsuario(dados)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUsuario(null)
  }

  const value = {
    usuario,
    loading,
    login,
    registro,
    registroConta,
    registroUsuario,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}



