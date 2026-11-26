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

// El access token dura 1h y el callback jwt de NextAuth lo renueva en el
// servidor cuando quedan <60 s. Guardar en memoria el último token válido
// sirve para dos cosas: no llamar a /api/auth/session en cada petición
// (antes era una llamada extra por cada llamada a la API, decenas por
// segundo en el dashboard) y, sobre todo, seguir llamando a la API aunque
// el endpoint de sesión falle un momento (p. ej. durante un despliegue):
// sin esto, una sesión que no responde dejaba las peticiones sin cabecera
// Authorization y el dashboard entraba en un bucle login <-> dashboard
// (incidente 2026-11-26: el build del frontend saturó el VPS, la sesión
// devolvió 502, las llamadas salieron sin token -> 401 -> /login ->
// /dashboard en bucle, y la avalancha disparó el rate limit de la API).
let cachedAccessToken: string | null = null

function tokenExpiresAtMs(token: string): number | null {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    )
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function cachedTokenIsUsable(): boolean {
  if (!cachedAccessToken) return false
  const exp = tokenExpiresAtMs(cachedAccessToken)
  // Sin exp legible, no arriesgar: pedir sesión nueva
  if (exp === null) return false
  return Date.now() < exp - 60_000
}

async function resolveAccessToken(): Promise<string | null> {
  if (cachedTokenIsUsable()) return cachedAccessToken
  try {
    const session = await getSession()
    if (session?.accessToken) {
      cachedAccessToken = session.accessToken
      return cachedAccessToken
    }
    cachedAccessToken = null
    return null
  } catch {
    // La sesión no responde (despliegue, red): usar el token en caché
    // aunque esté cerca de caducar antes que salir sin cabecera.
    return cachedAccessToken
  }
}

// Interceptor para añadir el token de autenticación en el cliente
if (typeof window !== 'undefined') {
  axiosInstance.interceptors.request.use(
    async config => {
      const token = await resolveAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
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
            cachedAccessToken = freshToken
            original.headers = {
              ...original.headers,
              Authorization: `Bearer ${freshToken}`,
            }
            return axiosInstance(original)
          }
          // La sesión responde pero está muerta: ir a /login
          window.location.href = '/login'
        } catch {
          // getSession() falló (la web no responde, despliegue en curso):
          // NO redirigir. La sesión puede estar perfectamente viva y
          // redirigir aquí era lo que metía al dashboard en el bucle
          // login <-> dashboard. Se devuelve el 401 y React Query
          // reintenta con backoff sin recargar la página.
        }
      }
      return Promise.reject(error)
    },
  )
}

export type ApiClient = typeof axiosInstance
