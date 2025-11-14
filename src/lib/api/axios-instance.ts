import axios from 'axios'
import { getSession } from 'next-auth/react'

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3333/api/v1'

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

export type ApiClient = typeof axiosInstance
