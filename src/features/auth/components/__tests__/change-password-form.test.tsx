import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChangePasswordForm } from '../change-password-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('ChangePasswordForm', () => {
  it('should display validation messages when fields are invalid', async () => {
    renderWithProviders(<ChangePasswordForm />);

    fireEvent.change(screen.getByPlaceholderText(/ingresa tu contraseña actual/i), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText(/ingresa tu nueva contraseña/i), { target: { value: '456' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    expect(await screen.findByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument();
  });

  it('should submit the form when fields are valid', async () => {
    // Mock the fetch function for a successful password change
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Password changed successfully' }),
      })
    ) as jest.Mock;

    renderWithProviders(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: 'oldPassword123' } });
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: 'newPassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: 'oldPassword123',
          newPassword: 'newPassword123',
        }),
      });
    });

    expect(await screen.findByText('Contraseña actualizada correctamente.')).toBeInTheDocument();
  });

  it('should display an error message when the password change fails', async () => {
    // Mock the fetch function for a failed password change
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Incorrect current password' }),
      })
    ) as jest.Mock;

    renderWithProviders(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: 'oldPassword123' } });
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: 'newPassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    expect(await screen.findByText('Incorrect current password')).toBeInTheDocument();
  });
});
