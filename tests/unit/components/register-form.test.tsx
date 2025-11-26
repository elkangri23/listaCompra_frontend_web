/**
 * Tests CRÍTICOS (100% coverage) - register-form.tsx
 * Componente de formulario de registro
 * 
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react
 * Mock: auth-service, next/navigation router
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/features/auth/components/register-form';
import { registerUser } from '@/features/auth/services/auth-service';

jest.mock('@/features/auth/services/auth-service', () => ({
  registerUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('RegisterForm (CRÍTICO - 100% coverage)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar todos los campos del formulario', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apellidos/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /acepto los términos/i })).toBeInTheDocument();
    });

    it('debe mostrar enlace a login', () => {
      render(<RegisterForm />);

      const loginLink = screen.getByRole('link', { name: /¿ya tienes cuenta\? inicia sesión/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('debe tener botón deshabilitado sin aceptar términos', () => {
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      expect(submitButton).toBeDisabled();
    });

    it('debe mostrar hint de contraseña', () => {
      render(<RegisterForm />);

      expect(screen.getByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
    });
  });

  describe('Validación de campos', () => {
    it('debe mostrar error si nombre está vacío', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RegisterForm />);

      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('debe mostrar error si email es inválido', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      await user.type(emailInput, 'email-invalido');

      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const hasEmailError = alerts.some(alert => alert.textContent?.match(/email|correo/i));
        expect(hasEmailError).toBe(true);
      });
    });

    it('debe mostrar error si contraseña es muy corta', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      await user.type(passwordInput, '123');

      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const hasPasswordError = alerts.some(alert => 
          alert.textContent?.match(/contraseña|password|8 caracteres/i)
        );
        expect(hasPasswordError).toBe(true);
      });
    });

    it('debe mostrar error si contraseñas no coinciden', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^contraseña$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different123');

      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const hasMatchError = alerts.some(alert => 
          alert.textContent?.match(/coincidir|coinciden|diferentes/i)
        );
        expect(hasMatchError).toBe(true);
      });
    });

    it('debe limpiar errores al escribir en un campo', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RegisterForm />);

      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      // Provocar error
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });

      // Escribir en nombre
      const nombreInput = screen.getByLabelText(/nombre/i);
      await user.type(nombreInput, 'Juan');

      // Error debe reducirse
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const hasNombreError = alerts.some(alert => 
          alert.id === 'nombre-error'
        );
        expect(hasNombreError).toBe(false);
      });
    });
  });

  describe('Envío del formulario', () => {
    it('debe llamar a registerUser con datos correctos', async () => {
      const user = userEvent.setup({ delay: null });
      (registerUser as jest.Mock).mockResolvedValue({ success: true });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nombre/i), 'Juan');
      await user.type(screen.getByLabelText(/apellidos/i), 'García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'juan@example.com');
      await user.type(screen.getByLabelText(/^contraseña$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(registerUser).toHaveBeenCalledWith({
          nombre: 'Juan',
          apellidos: 'García',
          email: 'juan@example.com',
          password: 'password123',
        });
      });
    });

    it('debe mostrar mensaje de éxito después de registro', async () => {
      const user = userEvent.setup({ delay: null });
      (registerUser as jest.Mock).mockResolvedValue({ success: true });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nombre/i), 'Juan');
      await user.type(screen.getByLabelText(/apellidos/i), 'García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'juan@example.com');
      await user.type(screen.getByLabelText(/^contraseña$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/registro completado/i);
      });
    });

    it('debe redirigir al login después de registro exitoso', async () => {
      const user = userEvent.setup({ delay: null });
      (registerUser as jest.Mock).mockResolvedValue({ success: true });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nombre/i), 'Juan');
      await user.type(screen.getByLabelText(/apellidos/i), 'García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'juan@example.com');
      await user.type(screen.getByLabelText(/^contraseña$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      // Avanzar timeout de 2 segundos
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('debe mostrar error del servidor', async () => {
      const user = userEvent.setup({ delay: null });
      (registerUser as jest.Mock).mockRejectedValue(new Error('Email ya registrado'));

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nombre/i), 'Juan');
      await user.type(screen.getByLabelText(/apellidos/i), 'García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'existente@example.com');
      await user.type(screen.getByLabelText(/^contraseña$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/email ya registrado/i);
      });
    });

    it('debe limpiar formulario después de registro exitoso', async () => {
      const user = userEvent.setup({ delay: null });
      (registerUser as jest.Mock).mockResolvedValue({ success: true });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nombre/i), 'Juan');
      await user.type(screen.getByLabelText(/apellidos/i), 'García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'juan@example.com');
      await user.type(screen.getByLabelText(/^contraseña$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        const nombreInput = screen.getByLabelText(/nombre/i) as HTMLInputElement;
        expect(nombreInput.value).toBe('');
      });
    });

    it('debe deshabilitar botón durante envío', async () => {
      const user = userEvent.setup({ delay: null });
      (registerUser as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/nombre/i), 'Juan');
      await user.type(screen.getByLabelText(/apellidos/i), 'García');
      await user.type(screen.getByLabelText(/correo electrónico/i), 'juan@example.com');
      await user.type(screen.getByLabelText(/^contraseña$/i), 'password123');
      await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123');
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/creando cuenta/i)).toBeInTheDocument();
    });
  });

  describe('Checkbox de términos', () => {
    it('debe habilitar botón al aceptar términos', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      expect(submitButton).toBeDisabled();

      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      expect(submitButton).not.toBeDisabled();
    });

    it('debe deshabilitar botón al desmarcar términos', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RegisterForm />);

      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      expect(submitButton).not.toBeDisabled();

      await user.click(termsCheckbox);
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener atributos aria apropiados', () => {
      render(<RegisterForm />);

      const nombreInput = screen.getByLabelText(/nombre/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);

      expect(nombreInput).toHaveAttribute('aria-invalid', 'false');
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('debe asociar errores con aria-describedby', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RegisterForm />);

      const termsCheckbox = screen.getByRole('checkbox', { name: /acepto los términos/i });
      await user.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);

      await waitFor(() => {
        const nombreInput = screen.getByLabelText(/nombre/i);
        expect(nombreInput).toHaveAttribute('aria-invalid', 'true');
        expect(nombreInput).toHaveAttribute('aria-describedby', 'nombre-error');
      });
    });
  });
});
