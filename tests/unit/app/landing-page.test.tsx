/**
 * Tests - Landing (/)
 * Verifica la nueva landing (item 2): marca, secciones, FAQ, ayuda y banner de cookies.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Landing', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('muestra la marca ListaCompra y no la de la plantilla', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /listacompra/i })).toBeInTheDocument();
    expect(screen.queryByText(/grocerymate/i)).not.toBeInTheDocument();
    expect(screen.getByText(/© 2026 ListaCompra/i)).toBeInTheDocument();
  });

  it('muestra el héroe, los pasos, para quién y las características', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /la lista de la compra, por fin en común/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cómo funciona/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /crea tu cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /comprad y tachad/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /para quién/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /familias/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /todo lo que trae/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /sugerencias con ia/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /historial de cambios/i })).toBeInTheDocument();
  });

  it('muestra las preguntas frecuentes', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /preguntas frecuentes/i })).toBeInTheDocument();
    expect(screen.getByText(/¿es gratis\?/i)).toBeInTheDocument();
    expect(screen.getByText(/¿cómo comparto una lista\?/i)).toBeInTheDocument();
    expect(screen.getByText(/¿puedo exportar mis datos o borrar mi cuenta\?/i)).toBeInTheDocument();
  });

  it('enlaza con registro, login, ayuda y páginas legales', () => {
    render(<Home />);

    const registerLinks = screen.getAllByRole('link', { name: /crear tu cuenta gratis|registrarse/i });
    expect(registerLinks.length).toBeGreaterThan(0);
    expect(registerLinks[0]).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /ir a la ayuda/i })).toHaveAttribute('href', '/help');
    expect(screen.getByRole('link', { name: /política de privacidad/i })).toHaveAttribute(
      'href',
      '/privacidad'
    );
    expect(screen.getByRole('link', { name: /términos de servicio/i })).toHaveAttribute(
      'href',
      '/terminos'
    );
    expect(screen.getByRole('link', { name: /^cómo funciona$/i })).toHaveAttribute(
      'href',
      '#como-funciona'
    );
  });

  it('muestra el banner de cookies y se oculta al aceptar', () => {
    render(<Home />);

    expect(screen.getByRole('region', { name: /aviso de cookies/i })).toBeInTheDocument();
    expect(screen.getByText(/solo las cookies necesarias/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /entendido/i }));

    expect(screen.queryByRole('region', { name: /aviso de cookies/i })).not.toBeInTheDocument();
    expect(window.localStorage.getItem('listacompra-cookies-aceptadas')).toBe('1');
  });

  it('no muestra el banner si las cookies ya se aceptaron', () => {
    window.localStorage.setItem('listacompra-cookies-aceptadas', '1');
    render(<Home />);

    expect(screen.queryByRole('region', { name: /aviso de cookies/i })).not.toBeInTheDocument();
  });
});
