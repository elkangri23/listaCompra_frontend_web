import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RegisterForm } from '../register-form';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('should display validation messages when fields are invalid', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(await screen.findByText('El nombre es requerido.')).toBeInTheDocument();
    expect(await screen.findByText('Ingresa un correo electrónico válido.')).toBeInTheDocument();
    expect(await screen.findByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument();
  });

  it('should submit the form when fields are valid', async () => {
    // Mock the fetch function for a successful registration
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'User registered successfully' }),
      })
    ) as jest.Mock;

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });
    });

    expect(pushMock).toHaveBeenCalledWith('/auth/login');
  });

  it('should display an error message when registration fails', async () => {
    // Mock the fetch function for a failed registration
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' }),
      })
    ) as jest.Mock;

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
