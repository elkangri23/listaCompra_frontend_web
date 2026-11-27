/**
 * Tests - ProfileForm (lote perfil): el email es de solo lectura y el
 * nombre se guarda con el botón «Guardar cambios».
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ProfileForm } from '@/features/auth/components/profile-form';
import { toast } from 'sonner';

const mutateAsyncMock = jest.fn();

// OJO: los mocks deben devolver referencias estables: ProfileForm tiene un
// useEffect con `user` en las dependencias y un objeto nuevo en cada render
// provocaría un bucle infinito de form.reset().
const mockProfileResult = {
  data: {
    id: '1',
    name: 'Antonio Moles',
    email: 'antonio@example.com',
    roles: ['user'],
  },
  isLoading: false,
  isError: false,
};
const mockUpdateProfileResult = {
  mutateAsync: mutateAsyncMock,
  isPending: false,
};

jest.mock('@/features/auth/hooks/use-profile', () => ({
  useProfile: () => mockProfileResult,
  useUpdateProfile: () => mockUpdateProfileResult,
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe('ProfileForm (lote perfil)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsyncMock.mockResolvedValue({
      id: '1',
      name: 'Antonio Nuevo',
      email: 'antonio@example.com',
      roles: ['user'],
    });
  });

  it('muestra el nombre y el email cargados, con el email de solo lectura', async () => {
    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/nombre completo/i)).toHaveValue(
        'Antonio Moles'
      );
    });

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput).toHaveValue('antonio@example.com');
    expect(emailInput).toHaveAttribute('readonly');
    expect(
      screen.getByText('Este correo no se puede cambiar.')
    ).toBeInTheDocument();
  });

  it('guarda el nombre con el email cargado sin cambios', async () => {
    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/nombre completo/i)).toHaveValue(
        'Antonio Moles'
      );
    });

    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'Antonio Nuevo' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /guardar cambios/i })
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        nombre: 'Antonio Nuevo',
        email: 'antonio@example.com',
        bio: '',
      });
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Perfil actualizado',
      expect.anything()
    );
  });

  it('muestra el error de validación con un nombre demasiado corto', async () => {
    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/nombre completo/i)).toHaveValue(
        'Antonio Moles'
      );
    });

    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'A' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /guardar cambios/i })
    );

    expect(
      await screen.findByText('El nombre debe tener al menos 2 caracteres')
    ).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });
});
