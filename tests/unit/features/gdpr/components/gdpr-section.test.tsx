import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GdprSection } from '@/features/gdpr/components/gdpr-section';
import { exportMyData, requestAccountDeletion } from '@/features/gdpr/services/gdpr-service';
import { signOut } from 'next-auth/react';

jest.mock('@/features/gdpr/services/gdpr-service', () => ({
  exportMyData: jest.fn(),
  requestAccountDeletion: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

const mockedExport = exportMyData as jest.Mock;
const mockedDelete = requestAccountDeletion as jest.Mock;
const mockedSignOut = signOut as jest.Mock;

describe('GdprSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:fake-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('exporta los datos y dispara la descarga del archivo', async () => {
    const blob = new Blob(['{}'], { type: 'application/json' });
    mockedExport.mockResolvedValue({ blob, filename: 'mis-datos-lista-compra-2026-11-26.json' });

    render(<GdprSection />);

    fireEvent.click(screen.getByRole('button', { name: /exportar mis datos/i }));

    await waitFor(() => {
      expect(mockedExport).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
    });
  });

  it('muestra un error si la exportación falla', async () => {
    mockedExport.mockRejectedValue(new Error('No se pudieron exportar tus datos.'));

    render(<GdprSection />);

    fireEvent.click(screen.getByRole('button', { name: /exportar mis datos/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron exportar tus datos.');
    });
  });

  it('pide confirmar y elimina la cuenta con la contraseña', async () => {
    mockedDelete.mockResolvedValue({
      mensaje: 'Tu cuenta ha sido desactivada.',
      eliminacionSolicitadaEn: '2026-11-26T00:00:00.000Z',
      eliminacionDefinitivaEn: '2026-12-26T00:00:00.000Z',
    });

    render(<GdprSection />);

    const passwordInput = screen.getByLabelText(/confirma con tu contraseña actual/i);
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /^eliminar mi cuenta$/i }));

    expect(screen.getByRole('button', { name: /sí, eliminar mi cuenta/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sí, eliminar mi cuenta/i }));

    await waitFor(() => {
      expect(mockedDelete).toHaveBeenCalledWith('SecurePass123!');
      expect(screen.getByText(/cuenta desactivada/i)).toBeInTheDocument();
      expect(screen.getByText(/26 de diciembre de 2026/i)).toBeInTheDocument();
    });
  });

  it('cierra la sesión tras eliminar la cuenta', async () => {
    mockedDelete.mockResolvedValue({
      mensaje: 'Tu cuenta ha sido desactivada.',
      eliminacionSolicitadaEn: '2026-11-26T00:00:00.000Z',
      eliminacionDefinitivaEn: '2026-12-26T00:00:00.000Z',
    });

    render(<GdprSection />);

    fireEvent.change(screen.getByLabelText(/confirma con tu contraseña actual/i), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^eliminar mi cuenta$/i }));
    fireEvent.click(screen.getByRole('button', { name: /sí, eliminar mi cuenta/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entendido, cerrar sesión/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /entendido, cerrar sesión/i }));

    expect(mockedSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });

  it('permite cancelar la confirmación sin eliminar nada', async () => {
    render(<GdprSection />);

    fireEvent.change(screen.getByLabelText(/confirma con tu contraseña actual/i), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^eliminar mi cuenta$/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(mockedDelete).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /^eliminar mi cuenta$/i })).toBeInTheDocument();
  });

  it('deshabilita eliminar sin contraseña', () => {
    render(<GdprSection />);

    expect(screen.getByRole('button', { name: /^eliminar mi cuenta$/i })).toBeDisabled();
  });

  it('muestra un error si la contraseña es incorrecta', async () => {
    mockedDelete.mockRejectedValue(new Error('La contraseña actual no es correcta'));

    render(<GdprSection />);

    fireEvent.change(screen.getByLabelText(/confirma con tu contraseña actual/i), {
      target: { value: 'ClaveMala123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^eliminar mi cuenta$/i }));
    fireEvent.click(screen.getByRole('button', { name: /sí, eliminar mi cuenta/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('La contraseña actual no es correcta');
    });
  });
});

describe('GdprSection (errores sin Error)', () => {
  it('muestra el mensaje por defecto si la exportación falla sin un Error', async () => {
    mockedExport.mockRejectedValue('boom');

    render(<GdprSection />);

    fireEvent.click(screen.getByRole('button', { name: /exportar mis datos/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudieron exportar tus datos. Inténtalo nuevamente.',
      );
    });
  });

  it('muestra el mensaje por defecto si la eliminación falla sin un Error', async () => {
    mockedDelete.mockRejectedValue('boom');

    render(<GdprSection />);

    fireEvent.change(screen.getByLabelText(/confirma con tu contraseña actual/i), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^eliminar mi cuenta$/i }));
    fireEvent.click(screen.getByRole('button', { name: /sí, eliminar mi cuenta/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudo solicitar la eliminación. Verifica tu contraseña.',
      );
    });
  });
});
