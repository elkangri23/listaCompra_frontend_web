'use client'

import * as React from 'react'
import {
  listPasskeys,
  passkeyRegisterOptions,
  passkeyRegisterVerify,
  renamePasskey,
  deletePasskey,
  browserSupportsWebAuthn,
} from '@/features/auth/services/passkey-service'
import { startRegistration } from '@simplewebauthn/browser'
import type { PasskeyItem } from '@/features/auth/types'

const MAX_PASSKEYS = 5

/**
 * Lista de passkeys en /profile Seguridad:
 * - añadir (step-up password → startRegistration → registerVerify)
 * - renombrar inline (PATCH)
 * - eliminar (window.confirm + contraseña, OBLIGATORIA)
 * - botón deshabilitado al tope de 5 con tooltip
 */
export function PasskeyList() {
  const [passkeys, setPasskeys] = React.useState<PasskeyItem[]>([])
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [addMode, setAddMode] = React.useState<'idle' | 'password'>('idle')
  const [password, setPassword] = React.useState('')
  const [deleteTarget, setDeleteTarget] = React.useState<PasskeyItem | null>(
    null,
  )
  const [deletePassword, setDeletePassword] = React.useState('')
  const [renamingId, setRenamingId] = React.useState<string | null>(null)
  const [renameValue, setRenameValue] = React.useState('')
  const supported = React.useMemo(() => browserSupportsWebAuthn(), [])
  const renameInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (renamingId) {
      // foco programático en vez de autoFocus (jsx-a11y/no-autofocus)
      renameInputRef.current?.focus()
    }
  }, [renamingId])

  const refresh = React.useCallback(async () => {
    try {
      setPasskeys(await listPasskeys())
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error cargando passkeys',
      )
    }
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const resetModes = () => {
    setAddMode('idle')
    setPassword('')
    setDeleteTarget(null)
    setDeletePassword('')
  }

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsPending(true)
    try {
      const { challengeId, options } = await passkeyRegisterOptions(password)
      const attestation = await startRegistration({
        optionsJSON: options as never,
      })
      await passkeyRegisterVerify({
        password,
        challengeId,
        credential: attestation,
      })
      resetModes()
      await refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la passkey.',
      )
    } finally {
      setIsPending(false)
    }
  }

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null)
      return
    }
    setErrorMessage(null)
    try {
      const updated = await renamePasskey(id, renameValue.trim().slice(0, 60))
      setPasskeys((prev) =>
        prev.map((passkey) => (passkey.id === id ? updated : passkey)),
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo renombrar.',
      )
    } finally {
      setRenamingId(null)
    }
  }

  const handleDelete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!deleteTarget) return
    setErrorMessage(null)
    setIsPending(true)
    try {
      await deletePasskey(deleteTarget.id, deletePassword)
      resetModes()
      await refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar la passkey.',
      )
    } finally {
      setIsPending(false)
    }
  }

  const atLimit = passkeys.length >= MAX_PASSKEYS

  return (
    <div className="w-full max-w-[480px]">
      {!supported && (
        <p className="mb-2 text-xs text-[#60708a]" role="note">
          Tu navegador no soporta passkeys (WebAuthn). Prueba con una versión
          reciente de Chrome, Edge, Safari o Firefox.
        </p>
      )}

      <ul className="flex flex-col gap-2 mb-4">
        {passkeys.map((passkey) => (
          <li
            key={passkey.id}
            className="flex items-center justify-between gap-2 bg-[#f0f2f5] rounded p-3"
          >
            {renamingId === passkey.id ? (
              <input
                className="form-input rounded border-none bg-white p-2 text-sm"
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                onBlur={() => void handleRename(passkey.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleRename(passkey.id)
                  if (event.key === 'Escape') setRenamingId(null)
                }}
                aria-label={`Nuevo nombre para ${passkey.nombre}`}
                ref={renameInputRef}
                maxLength={60}
              />
            ) : (
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#111418] truncate">
                  {passkey.nombre}
                </p>
                <p className="text-xs text-[#60708a]">
                  {passkey.deviceType === 'multiDevice'
                    ? 'Sincronizada'
                    : 'De dispositivo'}{' '}
                  · {passkey.activo ? 'activa' : 'BLOQUEADA por seguridad'}
                  {passkey.ultimoUso
                    ? ` · último uso ${new Date(passkey.ultimoUso).toLocaleDateString('es-ES')}`
                    : ''}
                </p>
              </div>
            )}
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setRenamingId(passkey.id)
                  setRenameValue(passkey.nombre)
                }}
                className="text-xs text-[#4387f4] hover:underline px-1"
                aria-label={`Renombrar ${passkey.nombre}`}
              >
                Renombrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(passkey)
                  setDeletePassword('')
                }}
                className="text-xs text-[#ef4444] hover:underline px-1"
                aria-label={`Eliminar ${passkey.nombre}`}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div aria-live="polite">
        {errorMessage ? (
          <p role="alert" className="text-sm text-[#ef4444] mb-2">
            {errorMessage}
          </p>
        ) : null}
      </div>

      {/* Añadir passkey: step-up con contraseña */}
      {addMode === 'idle' ? (
        <button
          type="button"
          onClick={() => setAddMode('password')}
          disabled={!supported || atLimit}
          title={
            atLimit
              ? `Máximo ${MAX_PASSKEYS} passkeys. Elimina alguna para añadir otra.`
              : undefined
          }
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#4387f4] text-white text-sm font-bold hover:bg-[#3a75d8] disabled:opacity-60"
        >
          Añadir passkey
        </button>
      ) : (
        <form onSubmit={handleAdd}>
          <label htmlFor="passkey-add-password" className="flex flex-col mb-2">
            <span className="text-sm font-medium text-[#111418] mb-2">
              Contraseña actual
            </span>
            <input
              id="passkey-add-password"
              type="password"
              autoComplete="current-password"
              className="form-input flex w-full rounded-lg border-none bg-[#f0f2f5] h-12 p-4 text-base"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isPending}
            />
          </label>
          <button
            type="submit"
            disabled={isPending || !password}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#4387f4] text-white text-sm font-bold hover:bg-[#3a75d8] disabled:opacity-60"
          >
            {isPending ? 'Registrando…' : 'Continuar'}
          </button>
          <button
            type="button"
            onClick={() => setAddMode('idle')}
            className="text-sm text-[#60708a] hover:underline text-left ml-3"
            disabled={isPending}
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Eliminar passkey: confirmación + contraseña OBLIGATORIA */}
      {deleteTarget && (
        <form
          onSubmit={handleDelete}
          className="mt-4 border border-[#f3c1c1] rounded p-4"
        >
          <p className="text-sm font-medium text-[#111418] mb-2">
            Eliminar «{deleteTarget.nombre}»
          </p>
          <label
            htmlFor="passkey-delete-password"
            className="flex flex-col mb-2"
          >
            <span className="text-sm text-[#111418] mb-2">
              Introduce tu contraseña para confirmar
            </span>
            <input
              id="passkey-delete-password"
              type="password"
              autoComplete="current-password"
              className="form-input flex w-full rounded-lg border-none bg-[#f0f2f5] h-12 p-4 text-base"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              required
              disabled={isPending}
            />
          </label>
          <button
            type="submit"
            disabled={isPending || !deletePassword}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#ef4444] text-white text-sm font-bold hover:bg-[#dc2626] disabled:opacity-60"
          >
            {isPending ? 'Eliminando…' : 'Eliminar definitivamente'}
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="text-sm text-[#60708a] hover:underline text-left ml-3"
            disabled={isPending}
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  )
}
