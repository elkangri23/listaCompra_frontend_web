/**
 * Tests unitarios para use-notifications hook (SECUNDARIO - 80% coverage)
 * 
 * @jest-environment jsdom
 * 
 * Hook testeado:
 * - useNotifications (query paginado con markAsRead, delete, unread count)
 * 
 * Este hook combina queries y mutations en un solo custom hook para gestión completa
 * de notificaciones. Incluye paginación, conteo de no leídas, y acciones CRUD.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { notificationService } from '@/features/notifications/services/notification-service';

// Mock del notification service
jest.mock('@/features/notifications/services/notification-service', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  },
}));

const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('use-notifications (SECUNDARIO - 80% coverage)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0 },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useNotifications - Query de notificaciones', () => {
    it('debe obtener notificaciones paginadas (page 1, limit 10)', async () => {
      const mockResponse = {
        data: [
          {
            id: 'notif-1',
            titulo: 'Invitación a lista',
            mensaje: 'Has sido invitado a "Lista de Compra"',
            read: false,
            tipo: 'INVITACION',
            creadoEn: new Date().toISOString(),
          },
          {
            id: 'notif-2',
            titulo: 'Producto añadido',
            mensaje: 'Se añadió "Leche" a la lista',
            read: true,
            tipo: 'PRODUCTO_AGREGADO',
            creadoEn: new Date().toISOString(),
          },
        ],
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useNotifications(1, 10), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockNotificationService.getNotifications).toHaveBeenCalledWith(1, 10);
      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.pagination).toEqual(mockResponse.meta);
      expect(result.current.notifications[0].read).toBe(false);
    });

    it('debe manejar paginación correctamente (page 2)', async () => {
      const mockResponse = {
        data: [
          {
            id: 'notif-3',
            titulo: 'Tercera notificación',
            mensaje: 'Contenido página 2',
            read: false,
            tipo: 'INFO',
            creadoEn: new Date().toISOString(),
          },
        ],
        meta: { page: 2, limit: 10, total: 11, totalPages: 2 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useNotifications(2, 10), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockNotificationService.getNotifications).toHaveBeenCalledWith(2, 10);
      expect(result.current.pagination?.page).toBe(2);
      expect(result.current.pagination?.totalPages).toBe(2);
    });

    it('debe manejar error al obtener notificaciones', async () => {
      const mockError = new Error('Network error');
      mockNotificationService.getNotifications.mockRejectedValue(mockError);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.error).toBe(mockError));

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
    });

    it('debe obtener notificaciones vacías correctamente', async () => {
      const mockResponse = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.pagination?.total).toBe(0);
    });
  });

  describe('useNotifications - Conteo de no leídas', () => {
    it('debe calcular conteo de notificaciones no leídas', async () => {
      const mockNotifications = {
        data: [
          {
            id: 'notif-1',
            titulo: 'No leída 1',
            mensaje: 'Mensaje',
            read: false,
            tipo: 'INFO',
            creadoEn: new Date().toISOString(),
          },
          {
            id: 'notif-2',
            titulo: 'Leída',
            mensaje: 'Mensaje',
            read: true,
            tipo: 'INFO',
            creadoEn: new Date().toISOString(),
          },
          {
            id: 'notif-3',
            titulo: 'No leída 2',
            mensaje: 'Mensaje',
            read: false,
            tipo: 'INFO',
            creadoEn: new Date().toISOString(),
          },
        ],
        meta: { page: 1, limit: 1000, total: 3, totalPages: 1 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoadingUnreadCount).toBe(false));

      expect(result.current.unreadCount).toBe(2);
    });

    it('debe retornar 0 cuando todas las notificaciones están leídas', async () => {
      const mockNotifications = {
        data: [
          {
            id: 'notif-1',
            titulo: 'Leída 1',
            mensaje: 'Mensaje',
            read: true,
            tipo: 'INFO',
            creadoEn: new Date().toISOString(),
          },
          {
            id: 'notif-2',
            titulo: 'Leída 2',
            mensaje: 'Mensaje',
            read: true,
            tipo: 'INFO',
            creadoEn: new Date().toISOString(),
          },
        ],
        meta: { page: 1, limit: 1000, total: 2, totalPages: 1 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.unreadCount).toBe(0));
    });

    it('debe retornar 0 cuando no hay notificaciones', async () => {
      const mockNotifications = {
        data: [],
        meta: { page: 1, limit: 1000, total: 0, totalPages: 0 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.unreadCount).toBe(0));
    });
  });

  describe('useNotifications - markAsRead mutation', () => {
    it('debe marcar notificación como leída', async () => {
      const mockUpdatedNotification = {
        id: 'notif-1',
        titulo: 'Ahora leída',
        mensaje: 'Mensaje',
        read: true,
        tipo: 'INFO',
        creadoEn: new Date().toISOString(),
      };
      mockNotificationService.markAsRead.mockResolvedValue(mockUpdatedNotification);
      
      const mockNotifications = {
        data: [mockUpdatedNotification],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      result.current.markAsRead('notif-1');

      await waitFor(() => {
        expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('notif-1');
      });
    });

    it('debe invalidar cache de notificaciones y unreadCount después de markAsRead', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      
      mockNotificationService.markAsRead.mockResolvedValue({
        id: 'notif-1',
        titulo: 'Test',
        mensaje: 'Test',
        read: true,
        tipo: 'INFO',
        creadoEn: new Date().toISOString(),
      });
      
      const mockNotifications = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      result.current.markAsRead('notif-1');

      await waitFor(() => {
        expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['notifications'] });
        expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['unreadNotificationsCount'] });
      });
    });

    it('debe manejar error al marcar como leída', async () => {
      const mockError = new Error('Permission denied');
      mockNotificationService.markAsRead.mockRejectedValue(mockError);

      const mockNotifications = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      result.current.markAsRead('notif-999');

      await waitFor(() => {
        expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('notif-999');
      });
    });
  });

  describe('useNotifications - deleteNotification mutation', () => {
    it('debe eliminar notificación correctamente', async () => {
      mockNotificationService.deleteNotification.mockResolvedValue(undefined);

      const mockNotifications = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      result.current.deleteNotification('notif-1');

      await waitFor(() => {
        expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith('notif-1');
      });
    });

    it('debe invalidar cache después de eliminar', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      
      mockNotificationService.deleteNotification.mockResolvedValue(undefined);

      const mockNotifications = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      result.current.deleteNotification('notif-1');

      await waitFor(() => {
        expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['notifications'] });
        expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['unreadNotificationsCount'] });
      });
    });

    it('debe manejar error al eliminar notificación', async () => {
      const mockError = new Error('Not found');
      mockNotificationService.deleteNotification.mockRejectedValue(mockError);

      const mockNotifications = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      result.current.deleteNotification('notif-999');

      await waitFor(() => {
        expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith('notif-999');
      });
    });
  });

  describe('useNotifications - Edge cases y defaults', () => {
    it('debe usar defaults cuando no se proveen parámetros (page=1, limit=10)', async () => {
      const mockNotifications = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockNotificationService.getNotifications).toHaveBeenCalledWith(1, 10);
    });

    it('debe retornar array vacío mientras está cargando', () => {
      mockNotificationService.getNotifications.mockReturnValue(
        new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.pagination).toBeUndefined();
    });
  });
});
