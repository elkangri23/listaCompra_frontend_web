import axios from 'axios'
import { getSession } from 'next-auth/react'
import { API_BASE_URL } from '@/lib/api/api-url'

const baseURL = API_BASE_URL

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15_000,
})

// Interceptor para añadir el token de autenticación en el cliente
if (typeof window !== 'undefined') {
  axiosInstance.interceptors.request.use(
    async config => {
      const session = await getSession()
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`
      }
      return config
    },
    error => {
      return Promise.reject(error)
    },
  )
}

// Interceptor de respuesta: si el access token caducó entre la sesión y
// la llamada, renovar la sesión y reintentar una sola vez. Si la sesión
// está muerta (el refresh falló o no hay refresh token), ir a /login en
// vez de enseñar el error crudo de la API en cada acción.
if (typeof window !== 'undefined') {
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const original = error.config as
        | (typeof error.config & { _retry?: boolean })
        | undefined
      const url = original?.url ?? ''
      const isAuthCall = [
        '/auth/login',
        '/auth/refresh',
        '/auth/register',
        '/auth/forgot-password',
      ].some(path => url.includes(path))
      if (
        error.response?.status === 401 &&
        original &&
        !original._retry &&
        !isAuthCall
      ) {
        original._retry = true
        try {
          // getSession() ejecuta el callback jwt en el servidor, que
          // renueva el token si caducó
          const session = await getSession()
          const freshToken = session?.accessToken
          if (freshToken && !session.error) {
            original.headers = {
              ...original.headers,
              Authorization: `Bearer ${freshToken}`,
            }
            return axiosInstance(original)
          }
        } catch {
          // Sin sesión renovada: cae al login de abajo
        }
        window.location.href = '/login'
      }
      return Promise.reject(error)
    },
  )
}

export type ApiClient = typeof axiosInstance
