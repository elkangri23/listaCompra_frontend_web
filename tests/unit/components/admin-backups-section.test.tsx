/**
 * Tests - AdminBackupsSection: pestaña Copias del panel (/admin, fase 6).
 * Última copia, historial con descarga y restauración, crear copia manual,
 * diálogo de restauración con confirmación literal, skeletons y estados
 * vacíos honestos.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AdminBackupsSection, formatBackupSize } from '@/features/admin/components/admin-backups-section';
import { adminService } from '@/features/admin/services/admin-service';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';
import { toast } from 'sonner';

jest.mock('@/features/admin/services/admin-service');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockGetBackups = adminService.getBackups as jest.Mock;
const mockCreateBackup = adminService.createBackup as jest.Mock;
const mockDownloadBackup = adminService.downloadBackup as jest.Mock;
const mockRestoreBackup = adminService.restoreBackup as jest.Mock;

const createdBackup = {
  id: 'bk-1',
  filename: 'backup-2026-11-28-040000.sql.gz',
  sizeBytes: 4404019,
  status: 'CREATED',
  source: 'SCHEDULED',
  createdAt: '2026-11-28T04:00:00.000Z',
  createdByUserId: null,
  restoreReason: null,
  restoredAt: null,
};

const restoredBackup = {
  id: 'bk-0',
  filename: 'backup-2026-11-27-040000.sql.gz',
  sizeBytes: 4194304,
  status: 'RESTORED',
  source: 'SCHEDULED',
  createdAt: '2026-11-27T04:00:00.000Z',
  createdByUserId: null,
  restoreReason: 'Datos corruptos tras la migración',
  restoredAt: '2026-11-27T10:00:00.000Z',
};

const backupsPage = {
  backups: [createdBackup, restoredBackup],
  total: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

const renderSection = () => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminBackupsSection />, { wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
  // jsdom no implementa URL.createObjectURL/revokeObjectURL: se definen
  // aquí para poder verificar la descarga autenticada del Blob.
  (URL as unknown as Record<string, unknown>).createObjectURL = jest
    .fn()
    .mockReturnValue('blob:fake-url');
  (URL as unknown as Record<string, unknown>).revokeObjectURL = jest.fn();
});

afterEach(() => {
  delete (URL as unknown as Record<string, unknown>).createObjectURL;
  delete (URL as unknown as Record<string, unknown>).revokeObjectURL;
});

describe('formatBackupSize', () => {
  it('formatea bytes, KB y MB en español', () => {
    expect(formatBackupSize(512)).toBe('512 B');
    expect(formatBackupSize(1536)).toBe('1,5 KB');
    expect(formatBackupSize(4404019)).toBe('4,2 MB');
  });

  it('sin tamaño aún → «—»', () => {
    expect(formatBackupSize(null)).toBe('—');
  });
});

describe('AdminBackupsSection', () => {
  it('muestra la última copia y el historial con estados en español', async () => {
    mockGetBackups.mockResolvedValue(backupsPage);
    renderSection();

    await waitFor(() =>
      expect(
        screen.getAllByText('backup-2026-11-28-040000.sql.gz')
      ).toHaveLength(2)
    );
    expect(screen.getAllByText('4,2 MB')).toHaveLength(2);
    expect(screen.getAllByText('Programada')).toHaveLength(3);
    expect(screen.getAllByText('Creada')).toHaveLength(2);
    expect(screen.getByText('Restaurada')).toBeInTheDocument();
    expect(screen.getByText('7 días')).toBeInTheDocument();
    expect(screen.getByText('2 copias en total')).toBeInTheDocument();
    expect(screen.getByText('backup-2026-11-27-040000.sql.gz')).toBeInTheDocument();
  });

  it('la última copia restaurada muestra cuándo y por qué se restauró', async () => {
    mockGetBackups.mockResolvedValue({
      backups: [restoredBackup],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    renderSection();

    await waitFor(() =>
      expect(screen.getAllByText('Restaurada')).toHaveLength(2)
    );
    expect(screen.getByText(/Restaurada el:/)).toBeInTheDocument();
    expect(screen.getByText(/Datos corruptos tras la migración/)).toBeInTheDocument();
  });

  it('sin copias → estado vacío honesto y botón para crear la primera', async () => {
    mockGetBackups.mockResolvedValue({
      backups: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });
    renderSection();

    await waitFor(() =>
      expect(screen.getAllByText('Sin copias aún')).toHaveLength(2)
    );
    expect(screen.getByText('Crear copia ahora')).toBeEnabled();
    expect(screen.queryByText('Descargar')).not.toBeInTheDocument();
    expect(screen.queryByText('Restaurar')).not.toBeInTheDocument();
  });

  it('con una copia PENDING el botón crear queda deshabilitado y avisa', async () => {
    const pendingBackup = {
      ...createdBackup,
      id: 'bk-2',
      filename: 'backup-2026-11-28-113000.sql.gz',
      sizeBytes: null,
      status: 'PENDING',
      source: 'MANUAL',
      createdAt: '2026-11-28T11:30:00.000Z',
      createdByUserId: 'admin-1',
    };
    mockGetBackups.mockResolvedValue({
      backups: [pendingBackup],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    renderSection();

    await waitFor(() =>
      expect(screen.getAllByText('Pendiente')).toHaveLength(2)
    );
    expect(screen.getByText('Crear copia ahora')).toBeDisabled();
    expect(
      screen.getByText('Copia solicitada: se está creando, actualiza en unos minutos')
    ).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getAllByText('Manual')).toHaveLength(2);
  });

  it('crear una copia llama al servicio y avisa', async () => {
    mockGetBackups.mockResolvedValue(backupsPage);
    mockCreateBackup.mockResolvedValue({
      backup: { ...createdBackup, id: 'bk-3', status: 'PENDING', source: 'MANUAL' },
    });
    renderSection();

    await waitFor(() =>
      expect(
        screen.getAllByText('backup-2026-11-28-040000.sql.gz')
      ).toHaveLength(2)
    );
    fireEvent.click(screen.getByText('Crear copia ahora'));

    await waitFor(() => expect(mockCreateBackup).toHaveBeenCalledWith());
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Copia solicitada: se está creando, actualiza en unos minutos'
      )
    );
  });

  it('una copia fallida no ofrece Descargar ni Restaurar', async () => {
    const failedBackup = {
      ...createdBackup,
      status: 'FAILED',
      sizeBytes: null,
    };
    const failedRestoring = {
      ...createdBackup,
      id: 'bk-4',
      status: 'RESTORE_FAILED',
      sizeBytes: 1234,
    };
    mockGetBackups.mockResolvedValue({
      backups: [failedBackup, failedRestoring],
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    renderSection();

    await waitFor(() =>
      expect(screen.getAllByText('Fallida')).toHaveLength(2)
    );
    expect(screen.getAllByText('Restauración fallida')).toHaveLength(1);
    expect(screen.queryByText('Descargar')).not.toBeInTheDocument();
    expect(screen.queryByText('Restaurar')).not.toBeInTheDocument();
  });

  it('una copia RESTORING muestra el aviso de restauración en curso', async () => {
    const restoringBackup = { ...createdBackup, status: 'RESTORING' };
    mockGetBackups.mockResolvedValue({
      backups: [restoringBackup],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    renderSection();

    await waitFor(() =>
      expect(screen.getAllByText('Restaurando')).toHaveLength(2)
    );
    expect(
      screen.getByText('Hay una restauración en curso: la lista se actualiza sola')
    ).toBeInTheDocument();
  });

  it('descargar una copia pide el Blob con el token y dispara la descarga', async () => {
    const blob = new Blob(['contenido'], { type: 'application/gzip' });
    mockGetBackups.mockResolvedValue(backupsPage);
    mockDownloadBackup.mockResolvedValue(blob);
    const createAnchorSpy = jest.spyOn(document, 'createElement');
    renderSection();

    await waitFor(() =>
      expect(screen.getAllByText('backup-2026-11-28-040000.sql.gz')).toHaveLength(2)
    );
    fireEvent.click(screen.getAllByText('Descargar')[0]);

    await waitFor(() => expect(mockDownloadBackup).toHaveBeenCalledWith('bk-1'));
    await waitFor(() =>
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
    const anchor = createAnchorSpy.mock.results
      .map((r) => r.value as HTMLAnchorElement)
      .find((el) => el.tagName === 'A');
    expect(anchor?.download).toBe('backup-2026-11-28-040000.sql.gz');
    createAnchorSpy.mockRestore();
  });

  it('el diálogo de restauración explica el ensayo y la parada, y bloquea la confirmación incorrecta', async () => {
    mockGetBackups.mockResolvedValue(backupsPage);
    renderSection();

    await waitFor(() =>
      expect(screen.getAllByText('backup-2026-11-28-040000.sql.gz')).toHaveLength(2)
    );
    fireEvent.click(screen.getAllByText('Restaurar')[0]);

    await waitFor(() =>
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    );
    expect(
      screen.getByText(/se ensaya en una base aislada/)
    ).toBeInTheDocument();
    expect(screen.getByText(/la app se detiene unos instantes/)).toBeInTheDocument();

    const submit = screen.getByRole('button', { name: 'Restaurar copia' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Para confirmar, escribe RESTAURAR'), {
      target: { value: 'restaurar' },
    });
    expect(submit).toBeDisabled();
    expect(
      screen.getByText('La confirmación debe ser exactamente RESTAURAR')
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Para confirmar, escribe RESTAURAR'), {
      target: { value: 'RESTAURAR' },
    });
    // Con la confirmación bien pero sin motivo, sigue bloqueado.
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Motivo de la restauración'), {
      target: { value: 'Datos corruptos tras la migración' },
    });
    expect(submit).toBeEnabled();
  });

  it('restaurar con RESTAURAR y motivo llama al servicio y cierra el diálogo', async () => {
    mockGetBackups.mockResolvedValue(backupsPage);
    mockRestoreBackup.mockResolvedValue({
      backup: { ...createdBackup, status: 'RESTORING' },
    });
    renderSection();

    await waitFor(() =>
      expect(screen.getAllByText('backup-2026-11-28-040000.sql.gz')).toHaveLength(2)
    );
    fireEvent.click(screen.getAllByText('Restaurar')[2]);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Para confirmar, escribe RESTAURAR'), {
      target: { value: 'RESTAURAR' },
    });
    fireEvent.change(screen.getByLabelText('Motivo de la restauración'), {
      target: { value: 'Datos corruptos tras la migración' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar copia' }));

    await waitFor(() =>
      expect(mockRestoreBackup).toHaveBeenCalledWith('bk-0', {
        confirmacion: 'RESTAURAR',
        motivo: 'Datos corruptos tras la migración',
      })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Restauración iniciada: la copia se está restaurando'
      )
    );
  });

  it('cancelar el diálogo lo cierra sin restaurar', async () => {
    mockGetBackups.mockResolvedValue(backupsPage);
    renderSection();

    await waitFor(() =>
      expect(screen.getAllByText('backup-2026-11-28-040000.sql.gz')).toHaveLength(2)
    );
    fireEvent.click(screen.getAllByText('Restaurar')[0]);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(mockRestoreBackup).not.toHaveBeenCalled();
  });

  it('pagina el historial cuando hay más de una página', async () => {
    mockGetBackups.mockResolvedValue({ ...backupsPage, totalPages: 2 });
    renderSection();

    await waitFor(() => expect(screen.getByText('Página 1 de 2')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Siguiente'));

    await waitFor(() => expect(mockGetBackups).toHaveBeenCalledWith(2, 10));
    await waitFor(() => expect(screen.getByText('Página 2 de 2')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Anterior'));

    await waitFor(() => expect(mockGetBackups).toHaveBeenCalledWith(1, 10));
  });

  it('muestra skeletons mientras carga', async () => {
    mockGetBackups.mockImplementation(() => new Promise(() => {}));
    renderSection();

    expect(screen.getByLabelText('Cargando última copia…')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargando historial de copias…')).toBeInTheDocument();
  });

  it('muestra el error si no se pueden cargar las copias', async () => {
    mockGetBackups.mockRejectedValue(new Error('No autorizado'));
    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('Error al cargar las copias de seguridad.')
      ).toBeInTheDocument()
    );
  });
});
