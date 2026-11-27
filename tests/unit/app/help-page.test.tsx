/**
 * Tests - Página de Ayuda (/help)
 * Verifica que la página existe, se lee y enlaza con registro e inicio de sesión.
 */
import { render, screen } from '@testing-library/react';
import HelpPage from '@/app/help/page';

describe('Página de Ayuda', () => {
  it('muestra el título, la fecha de actualización y las secciones', () => {
    render(<HelpPage />);

    expect(screen.getByRole('heading', { name: /^ayuda$/i })).toBeInTheDocument();
    expect(screen.getByText(/última actualización: 27 de noviembre de 2026/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /empezar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /listas y productos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /compartir y colaborar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /qué hace la ia/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tus datos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /contacto/i })).toBeInTheDocument();
  });

  it('enlaza con el registro y el inicio de sesión', () => {
    render(<HelpPage />);

    expect(screen.getByRole('link', { name: /crear una cuenta/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login');
  });

  it('muestra el correo de contacto', () => {
    render(<HelpPage />);

    const mailLinks = screen.getAllByRole('link', { name: /anthonymoles89@gmail.com/i });
    expect(mailLinks.length).toBeGreaterThan(0);
    expect(mailLinks[0]).toHaveAttribute('href', 'mailto:anthonymoles89@gmail.com');
  });

  it('muestra el logo de ListaCompra en la cabecera', () => {
    render(<HelpPage />);

    expect(screen.getByAltText('ListaCompra')).toHaveAttribute('src', '/logo.svg');
  });
});
