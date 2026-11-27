'use client'

import * as React from 'react'
import {
  getMfaStatus,
  totpSetup,
  totpVerifyEnable,
  totpDisable,
  MfaApiError,
} from '@/features/auth/services/mfa-service'
import type { MfaStatus, TotpSetupResponse } from '@/features/auth/types'

type Phase = 'idle' | 'setup' | 'confirm' | 'codes' | 'disable'

/**
 * Sección de Seguridad (TOTP): estado, activación con QR + códigos de
 * respaldo y desactivación con step-up (contraseña + código vigente).
 * Requisitos a11y: alt descriptivo del QR, fallback manual del secret,
 * focus trap implícito del dialog, aria-live en errores.
 */
export function TotpSecuritySection() {
  const [status, setStatus] = React.useState<MfaStatus | null>(null)
  const [phase, setPhase] = React.useState<Phase>('idle')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [setupData, setSetupData] = React.useState<TotpSetupResponse | null>(
    null,
  )
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)

  const refreshStatus = React.useCallback(async () => {
    try {
      setStatus(await getMfaStatus())
    } catch {
      setStatus(null)
    }
  }, [])

  React.useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  const reset = () => {
    setPhase('idle')
    setPassword('')
    setCode('')
    setSetupData(null)
    setBackupCodes([])
    setErrorMessage(null)
  }

  const handleSetup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsPending(true)
    try {
      const data = await totpSetup(password)
      setSetupData(data)
      setPhase('confirm')
    } catch (error) {
      setErrorMessage(
        error instanceof MfaApiError
          ? error.message
          : 'No se pudo iniciar la configuración.',
      )
    } finally {
      setIsPending(false)
    }
  }

  const handleVerifyEnable = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsPending(true)
    try {
      const data = await totpVerifyEnable(password, code)
      setBackupCodes(data.backupCodes)
      setPhase('codes')
      await refreshStatus()
    } catch (error) {
      setErrorMessage(
        error instanceof MfaApiError
          ? error.message
          : 'El código no es válido.',
      )
    } finally {
      setIsPending(false)
    }
  }

  const handleDisable = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsPending(true)
    try {
      await totpDisable(password, code || undefined)
      reset()
      await refreshStatus()
    } catch (error) {
      setErrorMessage(
        error instanceof MfaApiError
          ? error.message
          : 'No se pudo desactivar el TOTP.',
      )
    } finally {
      setIsPending(false)
    }
  }

  const downloadBackupCodes = () => {
    const content = `ListaCompra — Códigos de respaldo\n\n${backupCodes.join('\n')}\n\nCada código solo se puede usar una vez. Guárdalos en un lugar seguro.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'listacompra-backup-codes.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const enabled = status?.totpEnabled ?? false
  const pending = status?.totpPending ?? false

  return (
    <div className="w-full max-w-[480px]">
      {/* Estado actual */}
      <div aria-live="polite" className="mb-4 text-sm text-[#5b6b82]">
        {enabled
          ? 'Autenticación en dos pasos: ACTIVA'
          : pending
            ? 'Autenticación en dos pasos: pendiente de confirmar'
            : 'Autenticación en dos pasos: desactivada'}
      </div>

      {/* Acción principal */}
      {phase === 'idle' && !enabled && (
        <form onSubmit={handleSetup}>
          <div className="flex flex-col gap-4">
            <label htmlFor="totp-password" className="flex flex-col">
              <span className="text-sm font-medium text-[#111418] mb-2">
                Contraseña actual
              </span>
              <input
                id="totp-password"
                type="password"
                autoComplete="current-password"
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border-none bg-[#f0f2f5] focus:border-none h-12 p-4 text-base"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isPending}
              />
            </label>
            {errorMessage ? (
              <p role="alert" className="text-sm text-[#dc2626]">
                {errorMessage}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isPending || password.length === 0}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#2563eb] text-white text-sm font-bold hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {isPending
                ? 'Preparando…'
                : pending
                  ? 'Reiniciar configuración'
                  : 'Activar TOTP'}
            </button>
          </div>
        </form>
      )}

      {phase === 'idle' && enabled && (
        <form onSubmit={handleDisable}>
          <div className="flex flex-col gap-4">
            <label htmlFor="totp-disable-password" className="flex flex-col">
              <span className="text-sm font-medium text-[#111418] mb-2">
                Contraseña actual
              </span>
              <input
                id="totp-disable-password"
                type="password"
                autoComplete="current-password"
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border-none bg-[#f0f2f5] focus:border-none h-12 p-4 text-base"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isPending}
              />
            </label>
            <label htmlFor="totp-disable-code" className="flex flex-col">
              <span className="text-sm font-medium text-[#111418] mb-2">
                Código vigente (app autenticadora o de respaldo)
              </span>
              <input
                id="totp-disable-code"
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border-none bg-[#f0f2f5] focus:border-none h-12 p-4 text-base"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
                disabled={isPending}
              />
            </label>
            {errorMessage ? (
              <p role="alert" className="text-sm text-[#dc2626]">
                {errorMessage}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isPending}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#dc2626] text-white text-sm font-bold hover:bg-[#b91c1c] disabled:opacity-60"
            >
              {isPending ? 'Desactivando…' : 'Desactivar TOTP'}
            </button>
            <p className="text-xs text-[#5b6b82]">
              Si pierdes tu teléfono y no tienes códigos de respaldo, contacta a
              soporte para recuperar tu cuenta.
            </p>
          </div>
        </form>
      )}

      {/* Fase confirm: escanear QR */}
      {phase === 'confirm' && setupData && (
        <div className="flex flex-col gap-4">
          <img
            src={setupData.qrDataUrl}
            alt="Código QR para configurar tu app autenticadora. Escanéalo con Google Authenticator o similar."
            width={200}
            height={200}
            className="self-center"
          />
          <div>
            <p className="text-sm font-medium text-[#111418] mb-1">
              Si no puedes escanear el QR, introduce esta clave manualmente:
            </p>
            <code
              className="block bg-[#f0f2f5] rounded p-2 text-xs break-all"
              aria-label="Clave secreta para introducir manualmente"
            >
              {setupData.otpauthUrl.split('secret=')[1]?.split('&')[0]}
            </code>
          </div>
          <form onSubmit={handleVerifyEnable}>
            <label htmlFor="totp-confirm-code" className="flex flex-col mb-2">
              <span className="text-sm font-medium text-[#111418] mb-2">
                Código de 6 dígitos para confirmar
              </span>
              <input
                id="totp-confirm-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border-none bg-[#f0f2f5] focus:border-none h-12 p-4 text-base tracking-[0.3em]"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/[^\d]/g, '').slice(0, 6))
                }
                maxLength={6}
                required
                disabled={isPending}
              />
            </label>
            {errorMessage ? (
              <p
                role="alert"
                aria-live="polite"
                className="text-sm text-[#dc2626] mb-2"
              >
                {errorMessage}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isPending || code.length !== 6}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#2563eb] text-white text-sm font-bold hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {isPending ? 'Verificando…' : 'Confirmar y activar'}
            </button>
          </form>
        </div>
      )}

      {/* Fase codes: mostrar backup codes UNA sola vez */}
      {phase === 'codes' && (
        <div className="flex flex-col gap-4" aria-live="polite">
          <p className="text-sm font-medium text-[#111418]">
            ¡TOTP activado! Guarda estos códigos de respaldo: no se mostrarán de
            nuevo.
          </p>
          <ul className="grid grid-cols-2 gap-2 bg-[#f0f2f5] rounded p-4">
            {backupCodes.map((backupCode, index) => (
              <li key={backupCode} className="font-mono text-sm">
                <span className="sr-only">Código {index + 1}: </span>
                {backupCode}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={downloadBackupCodes}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 border border-[#dbdfe6] text-[#111418] text-sm font-bold hover:bg-[#f0f2f5]"
          >
            Descargar como .txt
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#2563eb] text-white text-sm font-bold hover:bg-[#1d4ed8]"
          >
            Hecho
          </button>
        </div>
      )}
    </div>
  )
}
