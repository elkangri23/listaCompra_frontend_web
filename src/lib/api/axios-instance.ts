import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3333/api'

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15_000,
})

export type ApiClient = typeof axiosInstance
