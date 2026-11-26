import { isAxiosError } from 'axios'
import { axiosInstance } from '@/lib/api/axios-instance'

export class GdprApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GdprApiError'
  }
}

function buildGdprApiError(
  error: unknown,
  fallbackMessage: string,
): GdprApiError {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined
    const message =
      data?.message ?? data?.error ?? error.message ?? fallbackMessage
    return new GdprApiError(message || fallbackMessage)
  }
  if (error instanceof Error) {
    return new GdprApiError(error.message || fallbackMessage)
  }
  return new GdprApiError(fallbackMessage)
}

export interface AccountDeletionResult {
  mensaje: string
  eliminacionSolicitadaEn: string
  eliminacionDefinitivaEn: string
}

export interface ExportedDataFile {
  blob: Blob
  filename: string
}

/**
 * Descarga todos los datos del usuario autenticado (GDPR, item 15).
 * Devuelve el blob y el nombre de archivo; el componente dispara la descarga.
 */
export async function exportMyData(): Promise<ExportedDataFile> {
  try {
    const response = await axiosInstance.get('/auth/me/export', {
      responseType: 'blob',
    })
    const disposition = response.headers?.['content-disposition'] as
      | string
      | undefined
    const match = disposition?.match(/filename="?([^";]+)"?/)
    return {
      blob: response.data as Blob,
      filename: match?.[1] ?? 'mis-datos-lista-compra.json',
    }
  } catch (error) {
    throw buildGdprApiError(
      error,
      'No se pudieron exportar tus datos. Inténtalo nuevamente.',
    )
  }
}

/**
 * Solicita la eliminación de la cuenta (GDPR, item 15). Requiere la
 * contraseña actual; la cuenta queda desactivada y se purga a los 30 días.
 */
export async function requestAccountDeletion(
  password: string,
): Promise<AccountDeletionResult> {
  try {
    const { data } = await axiosInstance.delete<AccountDeletionResult>(
      '/auth/me',
      { data: { password } },
    )
    return data
  } catch (error) {
    throw buildGdprApiError(
      error,
      'No se pudo solicitar la eliminación. Verifica tu contraseña.',
    )
  }
}
