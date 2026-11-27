/**
 * Tests - ChangePasswordForm (lote perfil): formulario real de cambio de
 * contraseña con el hook useChangePassword (PATCH /auth/me/password).
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { AuthApiError } from '@/features/auth/services/auth-service';
import { toast } from 'sonner';

const mutateAsyncMock = jest.fn();

jest.mock('@/features/auth/hooks/use-profile', () => ({
  useChangePassword: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/contraseña actual/i), {
    target: { value: 'Actual123' },
  });
  fireEvent.change(screen.getByLabelText(/^contraseña nueva$/i), {
    target: { value: 'Nueva456' },
  });
  fireEvent.change(screen.getByLabelText(/confirmar contraseña nueva/i), {
    target: { value: 'Nueva456' },
  });
};

describe('ChangePasswordForm (lote perfil)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsyncMock.mockResolvedValue(undefined);
  });

  it('renderiza los tres campos y el botón de cambiar', () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña nueva$/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/confirmar contraseña nueva/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cambiar contraseña/i })
    ).toBeInTheDocument();
  });

  it('cambia la contraseña con valores válidos y vacía el formulario', async () => {
    render(<ChangePasswordForm />);

    fillValidForm();
    fireEvent.click(
      screen.getByRole('button', { name: /cambiar contraseña/i })
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        currentPassword: 'Actual123',
        newPassword: 'Nueva456',
        confirmPassword: 'Nueva456',
      });
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Contraseña actualizada',
      expect.anything()
    );
    expect(screen.getByLabelText(/contraseña actual/i)).toHaveValue('');
  });

  it('rechaza la confirmación que no coincide sin llamar al servicio', async () => {
    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), {
      target: { value: 'Actual123' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña nueva$/i), {
      target: { value: 'Nueva456' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña nueva/i), {
      target: { value: 'Otra789' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /cambiar contraseña/i })
    );

    expect(
      await screen.findByText('Las contraseñas no coinciden')
    ).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('rechaza una contraseña nueva demasiado corta', async () => {
    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), {
      target: { value: 'Actual123' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña nueva$/i), {
      target: { value: 'Corta1' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña nueva/i), {
      target: { value: 'Corta1' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /cambiar contraseña/i })
    );

    expect(
      await screen.findByText('La contraseña debe tener al menos 8 caracteres')
    ).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor cuando el cambio falla', async () => {
    mutateAsyncMock.mockRejectedValue(
      new AuthApiError('La contraseña actual no es correcta.')
    );
    render(<ChangePasswordForm />);

    fillValidForm();
    fireEvent.click(
      screen.getByRole('button', { name: /cambiar contraseña/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Error al cambiar la contraseña',
        { description: 'La contraseña actual no es correcta.' }
      );
    });
  });
});
