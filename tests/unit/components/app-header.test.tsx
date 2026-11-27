import { fireEvent, render, screen } from '@testing-library/react';
import { AppHeader } from '@/components/layout/app-header';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/lib/auth/sign-out', () => ({
  signOutViaForm: jest.fn(),
}));

import { usePathname } from 'next/navigation';
import { signOutViaForm } from '@/lib/auth/sign-out';

describe('AppHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
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
});
