/**
 * Tests de componentes de auth con coverage 0%:
 * profile-form, forgot-password-form, change-password-form, session-status
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'sonner'

import { ProfileForm } from '@/features/auth/components/profile-form'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import { ChangePasswordForm } from '@/features/auth/components/change-password-form'
import { SessionStatus } from '@/features/auth/components/session/session-status'
import { useProfile, useUpdateProfile } from '@/features/auth/hooks/use-profile'
import {
  requestPasswordReset,
  AuthApiError,
} from '@/features/auth/services/auth-service'
import { createTestQueryClient } from '../../utils/test-utils'

jest.mock('@/features/auth/hooks/use-profile', () => ({
  useProfile: jest.fn(),
  useUpdateProfile: jest.fn(),
}))

jest.mock('@/features/auth/services/auth-service', () => ({
  requestPasswordReset: jest.fn(),
  AuthApiError: class AuthApiError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'AuthApiError'
    }
  },
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Los componentes UI de formulario son stubs; los sustituimos por una
// implementación funcional que conecta react-hook-form (Controller + contexto)
jest.mock('@/components/ui/form', () => {
  const React = require('react')
  const {
    Controller,
    FormProvider,
    useFormContext,
  } = require('react-hook-form')

  const FormFieldContext = React.createContext({ name: '' })

  const Form = (props: any) => {
    const { children, ...rest } = props
    return <FormProvider {...rest}>{children}</FormProvider>
  }

  const FormField = ({ control, name, render }: any) => (
    <FormFieldContext.Provider value={{ name }}>
      <Controller
        control={control}
        name={name}
        render={(props: any) =>
          render({
            field: props.field,
            fieldState: props.fieldState,
            formState: props.formState,
          })
        }
      />
    </FormFieldContext.Provider>
  )

  const FormControl = ({ children }: any) => <div>{children}</div>
  const FormItem = ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  )
  const FormLabel = ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  )
  const FormDescription = ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  )

  const FormMessage = ({ children, className, ...props }: any) => {
    const { formState } = useFormContext()
    const { name } = React.useContext(FormFieldContext)
    const error = name ? formState.errors?.[name] : null
    const body = error?.message ?? children
    if (!body) return null
    return (
      <p className={className} role="alert" {...props}>
        {String(body)}
      </p>
    )
  }

  return {
    Form,
    FormField,
    FormControl,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage,
  }
})

const mockUseProfile = useProfile as jest.Mock
const mockUseUpdateProfile = useUpdateProfile as jest.Mock
const mockUseSession = useSession as jest.Mock
const mockSignOut = signOut as jest.Mock
const mockRequestReset = requestPasswordReset as jest.Mock
const mockToastSuccess = toast.success as jest.Mock
const mockToastError = toast.error as jest.Mock

const mockUser = {
  id: 'user-1',
  name: 'Usuario Test',
  email: 'test@example.com',
  image: null,
}

describe('componentes auth sin coverage previo', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  beforeEach(() => {
    queryClient = createTestQueryClient()
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    jest.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('ProfileForm', () => {
    const mutateAsync = jest.fn()

    beforeEach(() => {
      mockUseProfile.mockReturnValue({ data: mockUser, isLoading: false })
      mockUseUpdateProfile.mockReturnValue({ mutateAsync, isPending: false })
    })

    it('debe cargar los datos del usuario en el formulario', async () => {
      render(<ProfileForm />, { wrapper })

      await waitFor(() => {
        expect(screen.getByDisplayValue('Usuario Test')).toBeInTheDocument()
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
      })
    })

    it('debe mostrar el esqueleto mientras carga el perfil', () => {
      mockUseProfile.mockReturnValue({ data: undefined, isLoading: true })

      const { container } = render(<ProfileForm />, { wrapper })

      expect(screen.getByRole('status', { name: /Cargando perfil/i })).toBeInTheDocument()
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /guardar/i }),
      ).not.toBeInTheDocument()
    })

    it('debe enviar el perfil actualizado y notificar éxito', async () => {
      const user = userEvent.setup()
      mutateAsync.mockResolvedValue(mockUser)

      render(<ProfileForm />, { wrapper })

      await waitFor(() =>
        expect(screen.getByDisplayValue('Usuario Test')).toBeInTheDocument(),
      )

      // El botón está deshabilitado hasta que el formulario sea "dirty"
      const nameInput = screen.getByDisplayValue('Usuario Test')
      await user.clear(nameInput)
      await user.type(nameInput, 'Nombre Actualizado')

      await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

      await waitFor(() =>
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Perfil actualizado',
          expect.objectContaining({ description: expect.any(String) }),
        ),
      )
      expect(mutateAsync).toHaveBeenCalledWith({
        nombre: 'Nombre Actualizado',
        email: 'test@example.com',
        bio: '',
      })
    })

    it('debe notificar el error del API (AuthApiError)', async () => {
      const user = userEvent.setup()
      mutateAsync.mockRejectedValue(new AuthApiError('Email ya registrado'))

      render(<ProfileForm />, { wrapper })

      await waitFor(() =>
        expect(screen.getByDisplayValue('Usuario Test')).toBeInTheDocument(),
      )

      const nameInput = screen.getByDisplayValue('Usuario Test')
      await user.clear(nameInput)
      await user.type(nameInput, 'Nombre Actualizado')

      await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith(
          'Error al actualizar perfil',
          expect.objectContaining({ description: 'Email ya registrado' }),
        ),
      )
    })

    it('debe notificar error genérico si no es AuthApiError', async () => {
      const user = userEvent.setup()
      mutateAsync.mockRejectedValue(new Error('Network error'))

      render(<ProfileForm />, { wrapper })

      await waitFor(() =>
        expect(screen.getByDisplayValue('Usuario Test')).toBeInTheDocument(),
      )

      const nameInput = screen.getByDisplayValue('Usuario Test')
      await user.clear(nameInput)
      await user.type(nameInput, 'Nombre Actualizado')

      await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith(
          'Error al actualizar perfil',
          expect.objectContaining({
            description:
              'No se pudo actualizar el perfil. Inténtalo nuevamente.',
          }),
        ),
      )
    })

    it('debe validar el nombre antes de enviar', async () => {
      const user = userEvent.setup()

      render(<ProfileForm />, { wrapper })

      await waitFor(() =>
        expect(screen.getByDisplayValue('Usuario Test')).toBeInTheDocument(),
      )

      const nameInput = screen.getByDisplayValue('Usuario Test')
      await user.clear(nameInput)
      await user.type(nameInput, 'A')
      await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

      await waitFor(() => expect(mutateAsync).not.toHaveBeenCalled())
    })
  })

  describe('ForgotPasswordForm', () => {
    beforeEach(() => {
      mockRequestReset.mockResolvedValue({ success: true })
    })

    it('debe renderizar el formulario con #email', () => {
      render(<ForgotPasswordForm />)

      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /enviar instrucciones/i }),
      ).toBeInTheDocument()
    })

    it('debe mostrar error de validación con email inválido', async () => {
      const user = userEvent.setup()

      render(<ForgotPasswordForm />)

      await user.type(
        screen.getByLabelText(/correo electrónico/i),
        'no-es-email',
      )
      await user.click(
        screen.getByRole('button', { name: /enviar instrucciones/i }),
      )

      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
      expect(mockRequestReset).not.toHaveBeenCalled()
    })

    it('debe enviar la petición y mostrar mensaje de estado', async () => {
      const user = userEvent.setup()

      render(<ForgotPasswordForm />)

      await user.type(
        screen.getByLabelText(/correo electrónico/i),
        'user@example.com',
      )
      await user.click(
        screen.getByRole('button', { name: /enviar instrucciones/i }),
      )

      await waitFor(() =>
        expect(mockRequestReset).toHaveBeenCalledWith({
          email: 'user@example.com',
        }),
      )
      await waitFor(() =>
        expect(screen.getByRole('status')).toBeInTheDocument(),
      )
    })

    it('debe mostrar error del servidor', async () => {
      mockRequestReset.mockRejectedValue(new Error('Usuario no encontrado'))
      const user = userEvent.setup()

      render(<ForgotPasswordForm />)

      await user.type(
        screen.getByLabelText(/correo electrónico/i),
        'user@example.com',
      )
      await user.click(
        screen.getByRole('button', { name: /enviar instrucciones/i }),
      )

      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    })
  })

  describe('ChangePasswordForm', () => {
    it('debe mostrar el aviso de funcionalidad deshabilitada', () => {
      render(<ChangePasswordForm />)

      expect(
        screen.getByText(/temporalmente deshabilitada/i),
      ).toBeInTheDocument()
    })
  })

  describe('SessionStatus', () => {
    it('debe mostrar "Cargando..." mientras la sesión carga', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'loading' })

      render(<SessionStatus />)

      expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })

    it('debe mostrar sesión activa con el nombre del usuario', () => {
      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated',
      })

      render(<SessionStatus />)

      expect(screen.getByText(/Sesión como/)).toBeInTheDocument()
      expect(screen.getByText('Usuario Test')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cerrar sesión/i }),
      ).toBeInTheDocument()
    })

    it('debe cerrar sesión al pulsar el botón', async () => {
      const user = userEvent.setup()
      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated',
      })

      render(<SessionStatus />)

      await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' })
    })

    it('debe mostrar sesión inactiva sin usuario', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })

      render(<SessionStatus />)

      expect(screen.getByText(/No has iniciado sesión/i)).toBeInTheDocument()
    })
  })
})

describe('ProfileForm y ForgotPasswordForm: ramas restantes', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  beforeEach(() => {
    queryClient = createTestQueryClient()
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    jest.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('ProfileForm: usuario sin nombre/email usa cadenas vacías', async () => {
    mockUseProfile.mockReturnValue({
      data: { id: 'u1', name: null, email: null, image: null },
      isLoading: false,
    })
    mockUseUpdateProfile.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    })

    render(<ProfileForm />, { wrapper })

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  it('ProfileForm: botón Cancelar resetea el formulario', async () => {
    const user = userEvent.setup()
    mockUseProfile.mockReturnValue({ data: mockUser, isLoading: false })
    mockUseUpdateProfile.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    })

    render(<ProfileForm />, { wrapper })

    await waitFor(() =>
      expect(screen.getByDisplayValue('Usuario Test')).toBeInTheDocument(),
    )

    const nameInput = screen.getByDisplayValue('Usuario Test')
    await user.clear(nameInput)
    await user.type(nameInput, 'Cambiado')

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    await waitFor(() =>
      expect(screen.getByDisplayValue('Usuario Test')).toBeInTheDocument(),
    )
  })
})

describe('ForgotPasswordForm: limpieza de errores al reescribir', () => {
  it('reescribir el email limpia el error previo', async () => {
    const user = userEvent.setup()

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    await user.type(emailInput, 'no-es-email')
    await user.click(
      screen.getByRole('button', { name: /enviar instrucciones/i }),
    )

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

    // Reescribir limpia el error (rama `previous[name]` existente)
    await user.type(emailInput, '@ok.com')

    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
    )
    expect(mockRequestReset).not.toHaveBeenCalled()
  })
})
