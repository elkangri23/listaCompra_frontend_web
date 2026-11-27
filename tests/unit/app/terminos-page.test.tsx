/**
 * Tests - Página de Términos de Servicio (/terminos)
 * Verifica que la página existe, se lee y enlaza con registro e inicio de sesión.
 */
import { render, screen } from '@testing-library/react';
import TerminosPage from '@/app/terminos/page';

describe('Página de Términos de Servicio', () => {
  it('muestra el título, la fecha de actualización y las secciones', () => {
    render(<TerminosPage />);

    expect(screen.getByRole('heading', { name: /términos de servicio/i })).toBeInTheDocument();
    expect(screen.getByText(/última actualización: 26 de noviembre de 2026/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /qué es listacompra/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tu cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /uso aceptable/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tus datos personales/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ley aplicable/i })).toBeInTheDocument();
  });

  it('enlaza con el registro y el inicio de sesión', () => {
    render(<TerminosPage />);

    expect(screen.getByRole('link', { name: /crear una cuenta/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /inicia sesión/i })).toHaveAttribute('href', '/login');
  });

  it('muestra el correo de contacto', () => {
    render(<TerminosPage />);

    const mailLinks = screen.getAllByRole('link', { name: /anthonymoles89@gmail.com/i });
    expect(mailLinks.length).toBeGreaterThan(0);
    expect(mailLinks[0]).toHaveAttribute('href', 'mailto:anthonymoles89@gmail.com');
  });

  it('muestra el logo de ListaCompra en la cabecera', () => {
    render(<TerminosPage />);

    expect(screen.getByAltText('ListaCompra')).toHaveAttribute('src', '/logo.svg');
  });
});
