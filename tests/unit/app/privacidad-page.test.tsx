/**
 * Tests - Página de Política de Privacidad (/privacidad)
 * Verifica que la página existe, se lee y enlaza con los términos y el registro.
 */
import { render, screen } from '@testing-library/react';
import PrivacidadPage from '@/app/privacidad/page';

describe('Página de Política de Privacidad', () => {
  it('muestra el título, la fecha de actualización y las secciones', () => {
    render(<PrivacidadPage />);

    expect(screen.getByRole('heading', { name: /política de privacidad/i })).toBeInTheDocument();
    expect(screen.getByText(/última actualización: 26 de noviembre de 2026/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /quién es el responsable/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /qué datos recogemos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /tus derechos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cuánto tiempo guardamos tus datos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cookies/i })).toBeInTheDocument();
  });

  it('enlaza con los términos y el registro', () => {
    render(<PrivacidadPage />);

    expect(screen.getByRole('link', { name: /términos de servicio/i })).toHaveAttribute('href', '/terminos');
    expect(screen.getByRole('link', { name: /crear una cuenta/i })).toHaveAttribute('href', '/register');
  });

  it('muestra el correo de contacto', () => {
    render(<PrivacidadPage />);

    const mailLinks = screen.getAllByRole('link', { name: /anthonymoles89@gmail.com/i });
    expect(mailLinks.length).toBeGreaterThan(0);
    expect(mailLinks[0]).toHaveAttribute('href', 'mailto:anthonymoles89@gmail.com');
  });

  it('muestra el logo de ListaCompra en la cabecera', () => {
    render(<PrivacidadPage />);

    expect(screen.getByAltText('ListaCompra')).toHaveAttribute('src', '/logo.svg');
  });
});
