import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { AuditHistorySection } from '@/features/audit/components/audit-history-section';
import { auditService } from '@/features/audit/services/audit-service';

jest.mock('next-auth/react');
jest.mock('@/features/audit/services/audit-service', () => ({
  auditService: {
    getListAuditHistory: jest.fn(),
    getListCollaborators: jest.fn(),
  },
}));
jest.mock('@/components/layout', () => ({
  GeneralLoading: () => <div data-testid="general-loading">Cargando...</div>,
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockGetHistory = auditService.getListAuditHistory as jest.Mock;
const mockGetCollaborators = auditService.getListCollaborators as jest.Mock;

const historyPage1 = {
  entries: [
    {
      id: 'e1',
      entityType: 'Producto',
      entityId: 'p1',
      changeType: 'UPDATE',
      changedByUserId: 'u-me',
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
      changedByUserId: 'u2',
      timestamp: '2026-11-26T14:00:00.000Z',
      changedFields: ['nombre'],
      oldValue: { nombre: 'Compra' },
      newValue: { nombre: 'Compra semanal' },
    },
    {
      id: 'e3',
      entityType: 'Producto',
      entityId: 'p2',
      changeType: 'DELETE',
      changedByUserId: 'u-desconocido',
      timestamp: '2026-11-26T13:00:00.000Z',
      changedFields: [],
      oldValue: { nombre: 'Pan' },
      newValue: undefined,
    },
  ],
  total: 3,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

const collaborators = [
  { id: 'c1', userId: 'u-me', userName: 'Antonio', userEmail: 'a@test.es', role: 'OWNER', joinedAt: '2026-11-01' },
  { id: 'c2', userId: 'u2', userName: 'María', userEmail: 'm@test.es', role: 'editor', joinedAt: '2026-11-02' },
];

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuditHistorySection listId="l1" />
    </QueryClientProvider>,
  );
}

describe('AuditHistorySection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ data: { user: { id: 'u-me' } } } as any);
    mockGetHistory.mockResolvedValue(historyPage1);
    mockGetCollaborators.mockResolvedValue(collaborators);
  });

  it('muestra los cambios con actor, entidad y valores antes y después', async () => {
    renderSection();

    expect(await screen.findByText('Tú marcaste como comprado Leche')).toBeInTheDocument();
    expect(screen.getByText('María actualizó la lista')).toBeInTheDocument();
    expect(screen.getByText('Alguien eliminó Pan')).toBeInTheDocument();
    // fechaCompra se oculta del resumen; comprado sí se muestra
    expect(screen.getByText('comprado: no → sí')).toBeInTheDocument();
    expect(screen.getByText('nombre: Compra → Compra semanal')).toBeInTheDocument();
    expect(mockGetHistory).toHaveBeenCalledWith('l1', { page: 1, pageSize: 10 });
  });

  it('muestra el estado vacío cuando no hay entradas', async () => {
    mockGetHistory.mockResolvedValue({ entries: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
    renderSection();

    expect(await screen.findByText('Aún no hay cambios registrados en esta lista.')).toBeInTheDocument();
  });

  it('muestra el error cuando la carga falla', async () => {
    mockGetHistory.mockRejectedValue(new Error('boom'));
    renderSection();

    expect(await screen.findByText('Error al cargar el historial de cambios.')).toBeInTheDocument();
  });

  it('filtra por tipo de cambio y vuelve a la página 1', async () => {
    const page2 = { ...historyPage1, entries: [], total: 0, page: 2, totalPages: 2 };
    mockGetHistory.mockResolvedValueOnce(historyPage1).mockResolvedValueOnce(page2);
    renderSection();
    await screen.findByText('Tú marcaste como comprado Leche');

    fireEvent.change(screen.getByLabelText('Filtrar por tipo de cambio'), {
      target: { value: 'DELETE' },
    });

    await waitFor(() => {
      expect(mockGetHistory).toHaveBeenCalledWith('l1', { page: 1, pageSize: 10, changeType: 'DELETE' });
    });
  });

  it('pagina entre páginas cuando hay más de una', async () => {
    const page1of2 = { ...historyPage1, totalPages: 2 };
    const page2of2 = { entries: [], total: 3, page: 2, pageSize: 10, totalPages: 2 };
    mockGetHistory.mockResolvedValueOnce(page1of2).mockResolvedValueOnce(page2of2);
    renderSection();

    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Siguiente'));

    await waitFor(() => {
      expect(mockGetHistory).toHaveBeenCalledWith('l1', { page: 2, pageSize: 10 });
    });
    expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument();
  });
});
