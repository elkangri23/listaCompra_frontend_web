/**
 * Tests - AdminUsersSection: gestión de usuarios del panel (/admin, fase 2).
 * Buscador, tabla, paginación, Impersonar y Desactivar con confirmación.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { AdminUsersSection } from '@/features/admin/components/admin-users-section';
import { adminService } from '@/features/admin/services/admin-service';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';

jest.mock('@/features/admin/services/admin-service');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const userJuan = {
  id: 'user-1',
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  rol: 'USUARIO',
  activo: true,
  emailVerificado: true,
  fechaCreacion: '2025-11-01T10:00:00.000Z',
  fechaActualizacion: '2025-11-20T10:00:00.000Z',
  listasCreadas: 3,
  productosAgregados: 12,
};

const userMaria = {
  id: 'user-2',
  nombre: 'María García',
  email: 'maria@example.com',
  rol: 'ADMIN',
  activo: false,
  emailVerificado: true,
  fechaCreacion: '2025-11-02T10:00:00.000Z',
  fechaActualizacion: '2025-11-20T10:00:00.000Z',
};

const mockUsersPage1 = {
  usuarios: [userJuan, userMaria],
  total: 4,
  page: 1,
  limit: 20,
  totalPages: 2,
};

const renderSection = () => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminUsersSection />, { wrapper });
};

describe('AdminUsersSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    (adminService.getAdminUsers as jest.Mock).mockResolvedValue(mockUsersPage1);
    (adminService.updateUserStatus as jest.Mock).mockResolvedValue(undefined);
    (adminService.impersonateUser as jest.Mock).mockResolvedValue({
      impersonationToken: 'token-123',
      impersonatedUser: { id: 'user-1', email: 'juan@example.com', nombre: 'Juan Pérez' },
      adminUser: { id: 'admin-1', email: 'admin@example.com', nombre: 'Admin' },
      expiresAt: '2025-11-28T11:00:00.000Z',
      startedAt: '2025-11-28T10:00:00.000Z',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('muestra skeletons mientras cargan los usuarios', () => {
    (adminService.getAdminUsers as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    renderSection();

    expect(screen.getByLabelText('Cargando usuarios…')).toBeInTheDocument();
  });

  it('muestra la tabla con rol, estado, listas y registro', async () => {
    renderSection();

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText('USUARIO')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    // Listas: 3 para Juan; «—» para María, sin dato
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Listas')).toBeInTheDocument();
  });

  it('NO muestra la columna Última conexión si el backend no la devuelve', async () => {
    renderSection();

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('Última conexión')).not.toBeInTheDocument();
  });

  it('muestra la columna Última conexión solo cuando el dato viene', async () => {
    (adminService.getAdminUsers as jest.Mock).mockResolvedValue({
      ...mockUsersPage1,
      usuarios: [{ ...userJuan, ultimaConexion: '2025-11-27T09:00:00.000Z' }, userMaria],
    });

    renderSection();

    expect(await screen.findByText('Última conexión')).toBeInTheDocument();
    expect(screen.getByText('27/11/2025')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay usuarios', async () => {
    (adminService.getAdminUsers as jest.Mock).mockResolvedValue({
      usuarios: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    renderSection();

    expect(await screen.findByText('No se encontraron usuarios')).toBeInTheDocument();
  });

  it('busca usuarios al escribir y vuelve a la página 1', async () => {
    const user = userEvent.setup();
    renderSection();

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();

    await user.type(
      screen.getByLabelText('Buscar usuarios por nombre o email'),
      'juan'
    );

    await waitFor(() =>
      expect(adminService.getAdminUsers).toHaveBeenCalledWith('juan', 1, 20)
    );
  });

  it('limpia la búsqueda con el botón Limpiar', async () => {
    const user = userEvent.setup();
    renderSection();

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();

    await user.type(
      screen.getByLabelText('Buscar usuarios por nombre o email'),
      'juan'
    );
    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(
      screen.getByLabelText('Buscar usuarios por nombre o email')
    ).toHaveValue('');
    await waitFor(() =>
      expect(adminService.getAdminUsers).toHaveBeenCalledWith('', 1, 20)
    );
  });

  it('pagina con Anterior y Siguiente', async () => {
    const user = userEvent.setup();
    renderSection();

    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() =>
      expect(adminService.getAdminUsers).toHaveBeenCalledWith('', 2, 20)
    );
  });

  it('impersona tras confirmar en el menú de acciones', async () => {
    const user = userEvent.setup();
    renderSection();

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Acciones de Juan Pérez' }));
    await user.click(await screen.findByText('👤 Impersonar usuario'));

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('¿Impersonar a Juan Pérez?')
    );
    await waitFor(() =>
      expect(adminService.impersonateUser).toHaveBeenCalledWith('user-1')
    );
  });

  it('NO impersona si se cancela la confirmación', async () => {
    const user = userEvent.setup();
    (window.confirm as jest.Mock).mockReturnValue(false);
    renderSection();

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Acciones de Juan Pérez' }));
    await user.click(await screen.findByText('👤 Impersonar usuario'));

    expect(adminService.impersonateUser).not.toHaveBeenCalled();
  });

  it('desactiva un usuario activo tras confirmar', async () => {
    const user = userEvent.setup();
    renderSection();

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Acciones de Juan Pérez' }));
    await user.click(await screen.findByText('🔴 Desactivar'));

    expect(window.confirm).toHaveBeenCalledWith('¿Confirmar desactivar usuario?');
    await waitFor(() =>
      expect(adminService.updateUserStatus).toHaveBeenCalledWith('user-1', false)
    );
  });

  it('activa un usuario inactivo tras confirmar', async () => {
    const user = userEvent.setup();
    renderSection();

    expect(await screen.findByText('María García')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Acciones de María García' }));
    await user.click(await screen.findByText('🟢 Activar'));

    await waitFor(() =>
      expect(adminService.updateUserStatus).toHaveBeenCalledWith('user-2', true)
    );
  });
});
