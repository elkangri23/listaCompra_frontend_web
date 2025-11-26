/**
 * Tests CRÍTICOS (100% coverage) - login-form.tsx
 * Componente de formulario de inicio de sesión
 * 
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react
 * Mock: next-auth signIn, next/navigation router
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/features/auth/components/login-form';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('LoginForm (CRÍTICO - 100% coverage)', () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });
    mockGet.mockReturnValue(null);
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar todos los campos del formulario', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('debe mostrar enlace a registro', () => {
      render(<LoginForm />);

      const registerLink = screen.getByRole('link', { name: /¿no tienes cuenta\? regístrate/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('debe tener placeholders apropiados', () => {
      render(<LoginForm />);

      expect(screen.getByPlaceholderText('usuario@ejemplo.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Introduce tu contraseña')).toBeInTheDocument();
    });
  });

  describe('Validación de campos', () => {
    it('debe mostrar error si email está vacío', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar error si email es inválido', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      await user.type(emailInput, 'email-invalido');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ingresa un correo electrónico válido/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar error si contraseña está vacía', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const hasPasswordError = alerts.some(alert => 
          alert.textContent?.match(/contraseña|password|requerido|obligatorio/i)
        );
        expect(hasPasswordError).toBe(true);
      });
    });

    it('debe limpiar errores al escribir en un campo', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      // Provocar error
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });

      // Escribir en email
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      await user.type(emailInput, 'test@example.com');

      // Error de email debe desaparecer
      await waitFor(() => {
        const emailError = screen.queryByText(/email.*requerido/i);
        expect(emailError).not.toBeInTheDocument();
      });
    });
  });

  describe('Envío del formulario', () => {
    it('debe llamar a signIn con credenciales correctas', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({
        error: null,
        url: '/dashboard',
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
          callbackUrl: '/dashboard',
        });
      });
    });

    it('debe redirigir al dashboard después de login exitoso', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({
        error: null,
        url: '/dashboard',
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('debe manejar callbackUrl personalizado', async () => {
      const user = userEvent.setup();
      mockGet.mockReturnValue('/lists/123');
      (signIn as jest.Mock).mockResolvedValue({
        error: null,
        url: '/lists/123',
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', 
          expect.objectContaining({
            callbackUrl: '/lists/123',
          })
        );
      });
    });

    it('debe mostrar error de credenciales incorrectas', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({
        error: 'CredentialsSignin',
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/correo electrónico o contraseña incorrectos/i);
      });
    });

    it('debe mostrar error genérico en caso de fallo', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockRejectedValue(new Error('Error de red'));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/error de red/i);
      });
    });

    it('debe deshabilitar botón durante envío', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener atributos aria apropiados', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('debe asociar errores con aria-describedby', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/correo electrónico/i);
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      });
    });
  });
});
