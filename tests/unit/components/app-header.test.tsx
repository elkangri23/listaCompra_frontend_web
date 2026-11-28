import { fireEvent, render, screen } from '@testing-library/react';
import { AppHeader } from '@/components/layout/app-header';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/lib/auth/sign-out', () => ({
  signOutViaForm: jest.fn(),
}));

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOutViaForm } from '@/lib/auth/sign-out';

describe('AppHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  it('muestra el logo de ListaCompra junto a la marca', () => {
    render(<AppHeader />);

    const logo = screen.getByAltText('ListaCompra');
    expect(logo).toHaveAttribute('src', '/logo.svg');
    expect(logo).toHaveAttribute('width', '32');
    expect(screen.getByRole('link', { name: /listacompra/i })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('marca como activo el enlace de la ruta actual', () => {
    render(<AppHeader />);

    expect(screen.getByRole('link', { name: /panel principal/i })).toBeInTheDocument();
  });

  it('cierra la sesión al pulsar el botón', async () => {
    render(<AppHeader />);

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(signOutViaForm).toHaveBeenCalledWith('/login');
  });

  it('no muestra el enlace de Administración sin sesión', () => {
    render(<AppHeader />);

    expect(
      screen.queryByRole('link', { name: /administración/i }),
    ).not.toBeInTheDocument();
  });

  it('no muestra el enlace de Administración a un usuario sin rol ADMIN', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'u1',
          email: 'usuario@ejemplo.com',
          roles: ['USUARIO'],
        },
      },
      status: 'authenticated',
    });

    render(<AppHeader />);

    expect(
      screen.queryByRole('link', { name: /administración/i }),
    ).not.toBeInTheDocument();
  });

  it('muestra el enlace de Administración a un usuario ADMIN', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'a1',
          email: 'admin@ejemplo.com',
          roles: ['ADMIN'],
        },
      },
      status: 'authenticated',
    });

    render(<AppHeader />);

    const link = screen.getByRole('link', { name: /administración/i });
    expect(link).toHaveAttribute('href', '/admin');
  });

  it('marca como activo el enlace de Administración en /admin', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin');
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'a1',
          email: 'admin@ejemplo.com',
          roles: ['ADMIN'],
        },
      },
      status: 'authenticated',
    });

    render(<AppHeader />);

    expect(
      screen.getByRole('link', { name: /administración/i }),
    ).toBeInTheDocument();
  });
});
