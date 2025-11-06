
import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { SessionStatus } from '../session-status'

jest.mock('next-auth/react')

const useSessionMock = useSession as jest.Mock

describe('SessionStatus', () => {
  it('muestra el estado de carga', () => {
    useSessionMock.mockReturnValue({ status: 'loading' })
    render(<SessionStatus />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra el estado de sesión inactiva', () => {
    useSessionMock.mockReturnValue({ status: 'unauthenticated' })
    render(<SessionStatus />)
    expect(screen.getByText('No has iniciado sesión.')).toBeInTheDocument()
    expect(screen.getByText('Inactiva')).toBeInTheDocument()
  })

  it('muestra el estado de sesión activa y el botón de cierre de sesión', () => {
    useSessionMock.mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Test User' } },
    })
    render(<SessionStatus />)
    expect(screen.getByText('Sesión como')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })
})
