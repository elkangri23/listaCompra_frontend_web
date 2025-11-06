import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '../forgot-password-form';

describe('ForgotPasswordForm', () => {
  it('should display a validation message when the email is invalid', async () => {
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    expect(await screen.findByText('Ingresa un correo electrónico válido.')).toBeInTheDocument();
  });

  it('should submit the form when the email is valid', async () => {
    // Mock the fetch function for a successful request
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Password reset link sent' }),
      })
    ) as jest.Mock;

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
    });

    expect(await screen.findByText('Se ha enviado un enlace a tu correo electrónico.')).toBeInTheDocument();
  });

  it('should display an error message when the request fails', async () => {
    // Mock the fetch function for a failed request
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'User not found' }),
      })
    ) as jest.Mock;

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    expect(await screen.findByText('User not found')).toBeInTheDocument();
  });
});
