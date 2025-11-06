import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProfileForm } from '../profile-form';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../../hooks/use-profile', () => ({
  useProfile: () => ({
    data: { nombre: 'Test User', email: 'test@example.com' },
    isLoading: false,
    isError: false,
  }),
  useUpdateProfile: () => ({
    mutate: jest.fn(),
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <SessionProvider session={{
      expires: '1',
      user: { email: 'test@example.com', id: '1', nombre: 'Test User' },
    }}>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </SessionProvider>
  );
};

describe('ProfileForm', () => {
  const mockUser = {
    nombre: 'Test User',
    email: 'test@example.com',
  };

  it('should display validation messages when fields are invalid', async () => {
    renderWithProviders(<ProfileForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(await screen.findByText('El nombre es requerido.')).toBeInTheDocument();
    expect(await screen.findByText('Ingresa un correo electrónico válido.')).toBeInTheDocument();
  });

  it('should submit the form when fields are valid', async () => {
    // Mock the fetch function for a successful update
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Profile updated successfully' }),
      })
    ) as jest.Mock;

    renderWithProviders(<ProfileForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: 'New Name',
          email: 'new@example.com',
        }),
      });
    });

    expect(await screen.findByText('Perfil actualizado correctamente.')).toBeInTheDocument();
  });

  it('should display an error message when the update fails', async () => {
    // Mock the fetch function for a failed update
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' }),
      })
    ) as jest.Mock;

    renderWithProviders(<ProfileForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
  });
});
