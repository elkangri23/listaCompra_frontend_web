/**
 * URL base del API compartida entre clientes HTTP y SSE.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3333/api/v1'
