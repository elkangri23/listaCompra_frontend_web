'use client'

import * as React from 'react'

type Props = {
  onSubmit: (credentials: { code?: string; backupCode?: string }) => void
  onCancel: () => void
  isPending?: boolean
  errorMessage?: string | null
}

/**
 * Paso 2 del login dos fases: introduce el código TOTP de 6 dígitos
 * o un código de respaldo. Accesible: autocomplete one-time-code,
 * inputmode numérico, aria-live en errores y foco inicial.
 */
export function MfaChallengeForm({
  onSubmit,
  onCancel,
  isPending = false,
  errorMessage,
}: Props) {
  const [mode, setMode] = React.useState<'totp' | 'backup'>('totp')
  const [code, setCode] = React.useState('')
  const [backupCode, setBackupCode] = React.useState('')
  const [localError, setLocalError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [mode])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    if (mode === 'totp') {
      if (!/^\d{6}$/.test(code)) {
        setLocalError('El código debe tener 6 dígitos.')
        return
      }
      onSubmit({ code })
      return
    }

    if (backupCode.trim().length < 6) {
      setLocalError('El código de respaldo debe tener al menos 6 caracteres.')
      return
    }
    onSubmit({ backupCode: backupCode.trim() })
  }

  const displayError = errorMessage ?? localError

  return (
    <form noValidate onSubmit={submit} aria-labelledby="mfa-step-title">
      <div className="mt-8 px-4">
        <h2
          id="mfa-step-title"
          className="text-[#111418] text-lg font-bold leading-normal mb-2"
        >
          Verificación en dos pasos
        </h2>
        <p className="text-sm text-[#60708a] mb-4">
          {mode === 'totp'
            ? 'Introduce el código de 6 dígitos de tu app autenticadora.'
            : 'Introduce uno de tus códigos de respaldo.'}
        </p>

        <div className="flex flex-col gap-4">
          {mode === 'totp' ? (
            <div>
              <label htmlFor="mfa-code" className="flex flex-col mb-2">
                <span className="text-sm font-medium text-[#111418] mb-2">
                  Código de verificación
                </span>
                <input
                  ref={inputRef}
                  id="mfa-code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 p-4 text-base font-normal leading-normal tracking-[0.3em]"
                  placeholder="000000"
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value.replace(/[^\d]/g, '').slice(0, 6),
                    )
                  }
                  maxLength={6}
                  aria-invalid={displayError ? 'true' : 'false'}
                  aria-describedby={displayError ? 'mfa-error' : undefined}
                  disabled={isPending}
                />
              </label>
            </div>
          ) : (
            <div>
              <label htmlFor="mfa-backup" className="flex flex-col mb-2">
                <span className="text-sm font-medium text-[#111418] mb-2">
                  Código de respaldo
                </span>
                <input
                  ref={inputRef}
                  id="mfa-backup"
                  name="backupCode"
                  autoComplete="off"
                  className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 p-4 text-base font-normal leading-normal"
                  placeholder="XXXX-YYYY"
                  value={backupCode}
                  onChange={(event) => setBackupCode(event.target.value)}
                  aria-invalid={displayError ? 'true' : 'false'}
                  aria-describedby={displayError ? 'mfa-error' : undefined}
                  disabled={isPending}
                />
              </label>
            </div>
          )}

          <div aria-live="polite">
            {displayError ? (
              <p id="mfa-error" role="alert" className="text-sm text-[#ef4444]">
                {displayError}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3a75d8] disabled:opacity-60"
          >
            {isPending ? 'Verificando…' : 'Verificar'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'totp' ? 'backup' : 'totp'))
              setCode('')
              setBackupCode('')
              setLocalError(null)
            }}
            className="text-sm text-[#4387f4] hover:underline text-left"
            disabled={isPending}
          >
            {mode === 'totp'
              ? 'Usar un código de respaldo'
              : 'Usar mi app autenticadora'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-[#60708a] hover:underline text-left"
            disabled={isPending}
          >
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    </form>
  )
}
