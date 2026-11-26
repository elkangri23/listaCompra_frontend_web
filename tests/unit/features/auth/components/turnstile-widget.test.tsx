/**
 * Tests del widget de Turnstile (Cloudflare) para el registro.
 * Mockea window.turnstile: render, callbacks de expiración/error y limpieza.
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { TurnstileWidget } from '@/features/auth/components/turnstile-widget'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

type TurnstileApiMock = {
  render: jest.Mock
  remove: jest.Mock
}

describe('TurnstileWidget', () => {
  let apiMock: TurnstileApiMock
  let renderCallbacks: {
    callback: (token: string) => void
    'expired-callback': () => void
    'error-callback': () => void
  } | null

  beforeEach(() => {
    renderCallbacks = null
    apiMock = {
      render: jest.fn((_el: HTMLElement, opts: typeof renderCallbacks) => {
        renderCallbacks = opts as never
        return 'widget-1'
      }),
      remove: jest.fn(),
    }
    ;(window as unknown as { turnstile?: TurnstileApiMock }).turnstile = apiMock
  })

  afterEach(() => {
    delete (window as unknown as { turnstile?: TurnstileApiMock }).turnstile
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  it('renderiza el widget con la site key cuando la API ya está cargada', () => {
    render(<TurnstileWidget siteKey="site-key-test" onToken={jest.fn()} />)

    expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument()
    expect(apiMock.render).toHaveBeenCalledTimes(1)
    expect(apiMock.render.mock.calls[0][1]).toMatchObject({ sitekey: 'site-key-test' })
  })

  it('entrega el token al padre cuando Cloudflare resuelve el captcha', () => {
    const onToken = jest.fn()
    render(<TurnstileWidget siteKey="site-key-test" onToken={onToken} />)

    act(() => {
      renderCallbacks?.callback('token-resuelto')
    })

    expect(onToken).toHaveBeenCalledWith('token-resuelto')
  })

  it('limpia el token y avisa al expirar', () => {
    const onToken = jest.fn()
    const onExpire = jest.fn()
    render(<TurnstileWidget siteKey="site-key-test" onToken={onToken} onExpire={onExpire} />)

    act(() => {
      renderCallbacks?.['expired-callback']()
    })

    expect(onToken).toHaveBeenCalledWith('')
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('limpia el token cuando la API devuelve error', () => {
    const onToken = jest.fn()
    render(<TurnstileWidget siteKey="site-key-test" onToken={onToken} />)

    act(() => {
      renderCallbacks?.['error-callback']()
    })

    expect(onToken).toHaveBeenCalledWith('')
  })

  it('carga el script cuando la API aún no existe y renderiza al cargarlo', () => {
    delete (window as unknown as { turnstile?: TurnstileApiMock }).turnstile
    render(<TurnstileWidget siteKey="site-key-test" onToken={jest.fn()} />)

    const script = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null
    expect(script).not.toBeNull()
    expect(apiMock.render).not.toHaveBeenCalled()

    // La API aparece al cargar el script
    ;(window as unknown as { turnstile?: TurnstileApiMock }).turnstile = apiMock
    act(() => {
      script?.dispatchEvent(new Event('load'))
    })

    expect(apiMock.render).toHaveBeenCalledTimes(1)
  })

  it('reutiliza el script si ya existe en la página', () => {
    delete (window as unknown as { turnstile?: TurnstileApiMock }).turnstile
    const existing = document.createElement('script')
    existing.src = SCRIPT_SRC
    document.head.appendChild(existing)

    render(<TurnstileWidget siteKey="site-key-test" onToken={jest.fn()} />)

    expect(document.querySelectorAll(`script[src="${SCRIPT_SRC}"]`)).toHaveLength(1)
  })

  it('no renderiza si el componente se desmonta antes de cargar el script', () => {
    delete (window as unknown as { turnstile?: TurnstileApiMock }).turnstile
    const { unmount } = render(<TurnstileWidget siteKey="site-key-test" onToken={jest.fn()} />)

    const script = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null
    unmount()
    ;(window as unknown as { turnstile?: TurnstileApiMock }).turnstile = apiMock
    act(() => {
      script?.dispatchEvent(new Event('load'))
    })

    expect(apiMock.render).not.toHaveBeenCalled()
  })

  it('elimina el widget al desmontar', () => {
    const { unmount } = render(<TurnstileWidget siteKey="site-key-test" onToken={jest.fn()} />)

    unmount()

    expect(apiMock.remove).toHaveBeenCalledWith('widget-1')
  })

  it('no falla si eliminar el widget lanza un error', () => {
    apiMock.remove.mockImplementation(() => {
      throw new Error('ya no existe')
    })
    const { unmount } = render(<TurnstileWidget siteKey="site-key-test" onToken={jest.fn()} />)

    expect(() => unmount()).not.toThrow()
  })

  it('usa el último onToken aunque cambie entre renders', () => {
    const first = jest.fn()
    const second = jest.fn()
    const { rerender } = render(<TurnstileWidget siteKey="site-key-test" onToken={first} />)

    rerender(<TurnstileWidget siteKey="site-key-test" onToken={second} />)
    act(() => {
      renderCallbacks?.callback('token-nuevo')
    })

    expect(second).toHaveBeenCalledWith('token-nuevo')
    expect(first).not.toHaveBeenCalled()
  })
})
