import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { LoginForm } from '../login-form'

const pushMock = jest.fn()
const refreshMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}))

type MockSignInResponse = {
  ok: boolean
  error: string | null
  status: number
  url: string | null
}

const signInMock = jest.fn<Promise<MockSignInResponse | undefined>, any>()

jest.mock(
  'next-auth/react',
  () => ({
    signIn: (...args: any[]) => signInMock(...args),
  }),
  { virtual: true },
)

describe('LoginForm', () => {
  beforeEach(() => {
    signInMock.mockReset()
    pushMock.mockReset()
    refreshMock.mockReset()
  })

  it('muestra mensajes de validación cuando los campos son inválidos', async () => {
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'correo-inválido' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
    expect(await screen.findByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument()
    expect(signInMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('envía las credenciales cuando los campos son válidos', async () => {
    signInMock.mockResolvedValue({ ok: true, error: null, status: 200, url: '/dashboard' })

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'contraseñaSegura' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'ana@example.com',
        password: 'contraseñaSegura',
        redirect: false,
        callbackUrl: '/dashboard',
      })
    })

    expect(pushMock).toHaveBeenCalledWith('/dashboard')
    expect(refreshMock).toHaveBeenCalled()
  })

  it('notifica cuando las credenciales son incorrectas', async () => {
    signInMock.mockResolvedValue({ ok: false, error: 'CredentialsSignin', status: 401, url: null })

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'contraseñaSegura' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText('Correo electrónico o contraseña incorrectos.')).toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalled()
  })
})
