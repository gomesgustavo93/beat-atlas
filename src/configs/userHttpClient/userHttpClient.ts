import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import {
  getUserAccessToken as getUserAccessTokenService,
  logout as logoutService,
} from '../../services/oauthService'

interface SpotifyErrorResponse {
  error?: {
    message?: string
    status?: number
  }
}

const userHttpClient = axios.create({
  baseURL: import.meta.env.VITE_SPOTIFY_API_URL || 'https://api.spotify.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

userHttpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getUserAccessTokenService()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        throw new Error('Usuário não autenticado')
      }
    } catch (error) {
      console.error('Erro ao obter token do usuário:', error)
      return Promise.reject(error)
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

userHttpClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        const token = await getUserAccessTokenService()
        if (!token) {
          logoutService()
          window.location.href = '/login'
        }
      } catch {
        logoutService()
        return Promise.reject(
          new Error('Sessão expirada. Faça login novamente.')
        )
      }
    }

    if (error.response?.status === 403) {
      const errorData = error.response.data as SpotifyErrorResponse
      const errorMessage =
        errorData?.error?.message || 'Insufficient client scope'
      if (
        errorMessage.includes('scope') ||
        errorMessage.includes('Insufficient')
      ) {
        logoutService()
        return Promise.reject(
          new Error(
            'Permissões insuficientes. Faça logout e login novamente para conceder todas as permissões necessárias.'
          )
        )
      }
    }

    return Promise.reject(error)
  }
)

export default userHttpClient
