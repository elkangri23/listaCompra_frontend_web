/**
 * Tests - Banner de cookies
 * Verifica que se muestra solo sin consentimiento guardado y que aceptar lo oculta.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { CookieBanner } from '@/components/cookie-banner';

describe('CookieBanner', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('se muestra cuando no hay consentimiento guardado', () => {
    render(<CookieBanner />);

    expect(screen.getByRole('region', { name: /aviso de cookies/i })).toBeInTheDocument();
    expect(screen.getByText(/solo las cookies necesarias/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /más información/i })).toHaveAttribute(
      'href',
      '/privacidad'
    );
  });

  it('al aceptar, se oculta y guarda el consentimiento', () => {
    render(<CookieBanner />);

    fireEvent.click(screen.getByRole('button', { name: /entendido/i }));

    expect(screen.queryByRole('region', { name: /aviso de cookies/i })).not.toBeInTheDocument();
    expect(window.localStorage.getItem('listacompra-cookies-aceptadas')).toBe('1');
  });

  it('no se muestra si el consentimiento ya está guardado', () => {
    window.localStorage.setItem('listacompra-cookies-aceptadas', '1');
    render(<CookieBanner />);

    expect(screen.queryByRole('region', { name: /aviso de cookies/i })).not.toBeInTheDocument();
  });
});
