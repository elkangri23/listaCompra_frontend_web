/**
 * Tests - AdminAuditSection: pestaña Auditoría del panel (/admin, fase 4).
 * Vista global de auditoría con filtros, entradas humanizadas, paginación,
 * skeletons y estado vacío honesto.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { AdminAuditSection } from '@/features/admin/components/admin-audit-section';
import { adminService } from '@/features/admin/services/admin-service';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';

jest.mock('@/features/admin/services/admin-service');
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockGetAuditLogs = adminService.getAuditLogs as jest.Mock;
const mockGetAdminUsers = adminService.getAdminUsers as jest.Mock;

const historyPage1 = {
  entries: [
    {
      id: 'e1',
      entityType: 'Producto',
      entityId: 'p1',
      changeType: 'UPDATE',
      changedByUserId: 'user-1',
      timestamp: '2026-11-26T15:27:21.148Z',
      changedFields: ['comprado', 'fechaCompra'],
      oldValue: { comprado: false, nombre: 'Leche' },
      newValue: { comprado: true, nombre: 'Leche' },
    },
    {
      id: 'e2',
      entityType: 'Lista',
      entityId: 'l1',
      changeType: 'UPDATE',
      changedByUserId: 'user-2',
      timestamp: '2026-11-26T14:00:00.000Z',
      changedFields: ['nombre'],
      oldValue: { nombre: 'Compra' },
      newValue: { nombre: 'Compra semanal' },
    },
  ],
  total: 3,
  page: 1,
  pageSize: 10,
  totalPages: 2,
};

const mockUsers = {
  usuarios: [
    {
      id: 'user-2',
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      rol: 'USUARIO',
      activo: true,
      emailVerificado: true,
      fechaCreacion: '2025-11-01T10:00:00.000Z',
      fechaActualizacion: '2025-11-20T10:00:00.000Z',
      listasCreadas: 3,
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const renderSection = () => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminAuditSection />, { wrapper });
};

describe('AdminAuditSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: 'user-1', name: 'Antonio', email: 'antonio@example.com' } },
      status: 'authenticated',
    } as any);
    mockGetAuditLogs.mockResolvedValue(historyPage1);
    mockGetAdminUsers.mockResolvedValue(mockUsers);
  });

  it('muestra skeletons mientras carga', () => {
    mockGetAuditLogs.mockReturnValue(new Promise(() => {}));
    renderSection();

    expect(screen.getByRole('status', { name: /cargando auditoría/i })).toBeInTheDocument();
  });

  it('muestra la tabla con las entradas humanizadas y el actor resuelto', async () => {
    renderSection();

    expect(await screen.findByText('Cambios en la aplicación')).toBeInTheDocument();
    expect(screen.getByText('Tú marcaste como comprado Leche')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez actualizó la lista')).toBeInTheDocument();
    expect(screen.getByText('nombre: Compra → Compra semanal')).toBeInTheDocument();
    expect(screen.getByText('3 cambios en total')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Cuándo' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Quién' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Qué' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Detalle' })).toBeInTheDocument();
  });

  it('muestra el estado vacío honesto cuando no hay cambios', async () => {
    mockGetAuditLogs.mockResolvedValue({
      entries: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });
    renderSection();

    expect(await screen.findByText('No hay cambios con estos filtros.')).toBeInTheDocument();
  });

  it('muestra error si falla la carga', async () => {
    mockGetAuditLogs.mockRejectedValue(new Error('fallo de red'));
    renderSection();

    expect(await screen.findByText('Error al cargar la auditoría.')).toBeInTheDocument();
  });

  it('filtra por tipo de entidad y reinicia la página', async () => {
    renderSection();

    await screen.findByText('Cambios en la aplicación');
    expect(mockGetAuditLogs).toHaveBeenCalledWith({}, 1, 10);

    fireEvent.change(screen.getByLabelText('Filtrar por tipo de entidad'), {
      target: { value: 'Producto' },
    });

    await waitFor(() =>
      expect(mockGetAuditLogs).toHaveBeenCalledWith({ entityType: 'Producto' }, 1, 10)
    );
  });

  it('filtra por tipo de cambio', async () => {
    renderSection();

    await screen.findByText('Cambios en la aplicación');

    fireEvent.change(screen.getByLabelText('Filtrar por tipo de cambio'), {
      target: { value: 'DELETE' },
    });

    await waitFor(() =>
      expect(mockGetAuditLogs).toHaveBeenCalledWith({ changeType: 'DELETE' }, 1, 10)
    );
  });

  it('pagina a la siguiente página', async () => {
    renderSection();

    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => expect(mockGetAuditLogs).toHaveBeenCalledWith({}, 2, 10));
  });

  it('muestra el id recortado cuando el usuario no se resuelve', async () => {
    mockGetAuditLogs.mockResolvedValue({
      entries: [
        {
          id: 'e3',
          entityType: 'Producto',
          entityId: 'p2',
          changeType: 'DELETE',
          changedByUserId: 'desconocido-12345678',
          timestamp: '2026-11-26T13:00:00.000Z',
          changedFields: [],
          oldValue: { nombre: 'Pan' },
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    renderSection();

    expect(await screen.findByText('Usuario desconoc')).toBeInTheDocument();
    expect(screen.getByText('Usuario desconoc eliminó Pan')).toBeInTheDocument();
  });
});
