'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  exportMyData,
  requestAccountDeletion,
} from '../services/gdpr-service'

function formatFechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Sección «Mis datos» del perfil (GDPR, item 15): exportar todos los datos
 * en JSON y solicitar la eliminación de la cuenta (30 días de gracia).
 */
export function GdprSection() {
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmStep, setConfirmStep] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleted, setDeleted] = useState<{
    mensaje: string
    eliminacionDefinitivaEn: string
  } | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const { blob, filename } = await exportMyData()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : 'No se pudieron exportar tus datos. Inténtalo nuevamente.',
      )
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      const result = await requestAccountDeletion(password)
      setDeleted({
        mensaje: result.mensaje,
        eliminacionDefinitivaEn: result.eliminacionDefinitivaEn,
      })
      setConfirmStep(false)
      setPassword('')
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'No se pudo solicitar la eliminación. Verifica tu contraseña.',
      )
    } finally {
      setDeleting(false)
    }
  }

  if (deleted) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="text-base font-medium text-[#111418]">
          Cuenta desactivada
        </p>
        <p className="mt-1 text-sm text-[#111418]">{deleted.mensaje}</p>
        <p className="mt-2 text-sm text-[#5b6b82]">
          Tus listas se eliminarán definitivamente el{' '}
          {formatFechaLarga(deleted.eliminacionDefinitivaEn)}. Si te
          arrepientes antes, escríbenos a anthonymoles89@gmail.com.
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-4 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
        >
          Entendido, cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-[#dbdfe6] bg-white p-4">
        <p className="text-base font-medium text-[#111418]">
          Exportar mis datos
        </p>
        <p className="mt-1 text-sm text-[#5b6b82]">
          Descarga un archivo JSON con tu perfil, tus listas y sus productos,
          tus categorías, tiendas y plantillas, y las listas en las que
          colaboras.
        </p>
        {exportError && (
          <p role="alert" className="mt-2 text-sm text-[#dc2626]">
            {exportError}
          </p>
        )}
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="mt-3 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-50"
        >
          {exporting ? 'Preparando…' : 'Exportar mis datos'}
        </button>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-base font-medium text-[#111418]">
          Eliminar mi cuenta
        </p>
        <p className="mt-1 text-sm text-[#111418]">
          Tu cuenta quedará desactivada y no podrás entrar. A los 30 días se
          eliminará definitivamente junto con tus listas y tus plantillas; en
          las listas de otras personas solo se te quitará a ti como
          colaborador.
        </p>
        {deleteError && (
          <p role="alert" className="mt-2 text-sm text-[#dc2626]">
            {deleteError}
          </p>
        )}
        {!confirmStep ? (
          <div className="mt-3 flex flex-col gap-2">
            <label htmlFor="gdpr-password" className="text-sm text-[#5b6b82]">
              Confirma con tu contraseña actual
            </label>
            <input
              id="gdpr-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              className="w-full max-w-sm rounded-md border border-[#dbdfe6] px-3 py-2 text-sm text-[#111418]"
            />
            <button
              type="button"
              onClick={() => setConfirmStep(true)}
              disabled={password.length === 0}
              className="w-fit rounded-md bg-[#dc2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50"
            >
              Eliminar mi cuenta
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm font-medium text-[#111418]">
              ¿Seguro que quieres eliminar tu cuenta? Se desactivará ahora y
              se borrará del todo a los 30 días.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-[#dc2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#b91c1c] disabled:opacity-50"
              >
                {deleting ? 'Eliminando…' : 'Sí, eliminar mi cuenta'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmStep(false)}
                disabled={deleting}
                className="rounded-md border border-[#dbdfe6] bg-white px-4 py-2 text-sm font-medium text-[#111418] disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
