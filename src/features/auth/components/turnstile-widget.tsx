'use client'

import { useEffect, useRef } from 'react'

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ) => string
  remove: (id?: string) => void
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

function turnstileApi(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile
}

/**
 * Widget de Turnstile (Cloudflare) para el registro. Solo se monta cuando
 * el servidor lo activa (site key configurada); sin site key no se carga el
 * script ni se muestra nada. El token se entrega al formulario padre.
 * Patrón copiado de retaton (resources/js/components/TurnstileWidget.tsx).
 */
export function TurnstileWidget({
  siteKey,
  onToken,
  onExpire,
}: {
  siteKey: string
  onToken: (token: string) => void
  onExpire?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    let cancelled = false
    const render = () => {
      const api = turnstileApi()
      if (cancelled || !ref.current || !api || widgetId.current) return
      widgetId.current = api.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => onTokenRef.current(token),
        'expired-callback': () => {
          onTokenRef.current('')
          onExpireRef.current?.()
        },
        'error-callback': () => onTokenRef.current(''),
      })
    }
    if (turnstileApi()) {
      render()
    } else {
      let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null
      if (!script) {
        script = document.createElement('script')
        script.src = SCRIPT_SRC
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', render)
    }
    return () => {
      cancelled = true
      if (widgetId.current) {
        try {
          turnstileApi()?.remove(widgetId.current)
        } catch {
          // El widget ya no existe; nada que limpiar.
        }
        widgetId.current = null
      }
    }
  }, [siteKey])

  return <div ref={ref} data-testid="turnstile-widget" />
}
