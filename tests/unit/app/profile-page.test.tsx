/**
 * Tests - Página de perfil (/profile): pestañas, incluida la nueva pestaña
 * «Privacidad» con la sección «Mis datos» (GDPR, item 15).
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ProfilePage from '@/app/(auth)/profile/page';

jest.mock('@/features/settings/components/totp-security-section', () => ({
  TotpSecuritySection: () => <div data-testid="totp-section" />,
}));

jest.mock('@/features/settings/components/passkey-list', () => ({
  PasskeyList: () => <div data-testid="passkey-list" />,
}));

jest.mock('@/features/gdpr/components/gdpr-section', () => ({
  GdprSection: () => <div data-testid="gdpr-section" />,
}));

jest.mock('@/features/auth/components/profile-form', () => ({
  ProfileForm: () => (
    <div data-testid="profile-form">
      <label>
        Nombre Completo
        <input />
      </label>
    </div>
  ),
}));

jest.mock('@/features/auth/components/change-password-form', () => ({
  ChangePasswordForm: () => <div data-testid="change-password-form" />,
}));

describe('Página de perfil', () => {
  it('muestra la pestaña Perfil por defecto', () => {
    render(<ProfilePage />);

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.queryByTestId('gdpr-section')).not.toBeInTheDocument();
  });

  it('muestra la sección «Mis datos» al abrir la pestaña Privacidad', () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /privacidad/i }));

    expect(screen.getByText(/mis datos/i)).toBeInTheDocument();
    expect(screen.getByTestId('gdpr-section')).toBeInTheDocument();
  });

  it('muestra la pestaña Seguridad con TOTP y passkeys', () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /seguridad/i }));

    expect(screen.getByTestId('totp-section')).toBeInTheDocument();
    expect(screen.getByTestId('passkey-list')).toBeInTheDocument();
    expect(screen.getByTestId('change-password-form')).toBeInTheDocument();
  });

  it('muestra la pestaña Preferencias', () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /preferencias/i }));

    expect(screen.getByText('Notificaciones por correo electrónico')).toBeInTheDocument();
  });
});
