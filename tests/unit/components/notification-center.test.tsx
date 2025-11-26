import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';

// Mock del hook useNotifications
jest.mock('@/features/notifications/hooks/use-notifications');

const mockUseNotifications = useNotifications as jest.MockedFunction<typeof useNotifications>;

// Mock de date-fns formatDistanceToNow
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  formatDistanceToNow: jest.fn(),
}));

const mockFormatDistanceToNow = formatDistanceToNow as jest.MockedFunction<typeof formatDistanceToNow>;

describe('NotificationCenter', () => {
  const mockMarkAsRead = jest.fn();
  const mockDeleteNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatDistanceToNow.mockImplementation((date) => 'hace 5 minutos');
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar el título "Notificaciones" con icono Bell', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        isLoading: false,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 0,
      });

      render(<NotificationCenter />);

      expect(screen.getByText('Notificaciones')).toBeInTheDocument();
      expect(screen.getByText('No tienes notificaciones nuevas.')).toBeInTheDocument();
    });

    it('debe mostrar "Cargando notificaciones..." durante loading', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        isLoading: true,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 0,
      });

      render(<NotificationCenter />);

      expect(screen.getByText('Cargando notificaciones...')).toBeInTheDocument();
    });

    it('debe mostrar "Error al cargar notificaciones." cuando hay error', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        isLoading: false,
        error: new Error('Network error'),
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 0,
      });

      render(<NotificationCenter />);

      expect(screen.getByText('Error al cargar notificaciones.')).toBeInTheDocument();
    });

    it('debe mostrar "No tienes notificaciones nuevas." cuando la lista está vacía', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [],
        isLoading: false,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 0,
      });

      render(<NotificationCenter />);

      expect(screen.getByText('No tienes notificaciones nuevas.')).toBeInTheDocument();
    });
  });

  describe('Renderizado de notificaciones', () => {
    it('debe renderizar la lista de notificaciones con mensajes', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [
          {
            id: 'notif1',
            message: 'Nueva lista compartida contigo',
            read: false,
            createdAt: new Date('2025-11-26T10:00:00Z').toISOString(),
            userId: 'user1',
            type: 'LISTA_COMPARTIDA',
          },
          {
            id: 'notif2',
            message: 'Producto añadido a lista',
            read: true,
            createdAt: new Date('2025-11-26T09:00:00Z').toISOString(),
            userId: 'user1',
            type: 'PRODUCTO_AGREGADO',
          },
        ],
        isLoading: false,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 1,
      });

      render(<NotificationCenter />);

      expect(screen.getByText('Nueva lista compartida contigo')).toBeInTheDocument();
      expect(screen.getByText('Producto añadido a lista')).toBeInTheDocument();
    });

    it('debe mostrar Badge "Nueva" solo en notificaciones no leídas', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [
          {
            id: 'notif1',
            message: 'Nueva lista compartida contigo',
            read: false,
            createdAt: new Date('2025-11-26T10:00:00Z').toISOString(),
            userId: 'user1',
            type: 'LISTA_COMPARTIDA',
          },
          {
            id: 'notif2',
            message: 'Producto añadido a lista',
            read: true,
            createdAt: new Date('2025-11-26T09:00:00Z').toISOString(),
            userId: 'user1',
            type: 'PRODUCTO_AGREGADO',
          },
        ],
        isLoading: false,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 1,
      });

      render(<NotificationCenter />);

      const badges = screen.getAllByText('Nueva');
      expect(badges).toHaveLength(1);
    });

    it('debe formatear las fechas con formatDistanceToNow en español', () => {
      const mockDate = new Date('2025-11-26T10:00:00Z').toISOString();
      mockFormatDistanceToNow.mockReturnValue('hace 2 horas');

      mockUseNotifications.mockReturnValue({
        notifications: [
          {
            id: 'notif1',
            message: 'Nueva lista compartida contigo',
            read: false,
            createdAt: mockDate,
            userId: 'user1',
            type: 'LISTA_COMPARTIDA',
          },
        ],
        isLoading: false,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 1,
      });

      render(<NotificationCenter />);

      expect(mockFormatDistanceToNow).toHaveBeenCalledWith(
        new Date(mockDate),
        expect.objectContaining({
          addSuffix: true,
          locale: es,
        })
      );
      expect(screen.getByText('hace 2 horas')).toBeInTheDocument();
    });
  });

  describe('Acciones de notificaciones', () => {
    const user = userEvent.setup();

    it('debe llamar a markAsRead al hacer clic en "Marcar como leído"', async () => {
      mockUseNotifications.mockReturnValue({
        notifications: [
          {
            id: 'notif1',
            message: 'Nueva lista compartida contigo',
            read: false,
            createdAt: new Date('2025-11-26T10:00:00Z').toISOString(),
            userId: 'user1',
            type: 'LISTA_COMPARTIDA',
          },
        ],
        isLoading: false,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 1,
      });

      render(<NotificationCenter />);

      const markButton = screen.getByText('Marcar como leído');
      await user.click(markButton);

      await waitFor(() => {
        expect(mockMarkAsRead).toHaveBeenCalledWith('notif1');
      });
    });

    it('debe llamar a deleteNotification al hacer clic en "Eliminar"', async () => {
      mockUseNotifications.mockReturnValue({
        notifications: [
          {
            id: 'notif2',
            message: 'Producto añadido a lista',
            read: true,
            createdAt: new Date('2025-11-26T09:00:00Z').toISOString(),
            userId: 'user1',
            type: 'PRODUCTO_AGREGADO',
          },
        ],
        isLoading: false,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 0,
      });

      render(<NotificationCenter />);

      const deleteButton = screen.getByText('Eliminar');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteNotification).toHaveBeenCalledWith('notif2');
      });
    });

    it('NO debe mostrar botón "Marcar como leído" en notificaciones ya leídas', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [
          {
            id: 'notif2',
            message: 'Producto añadido a lista',
            read: true,
            createdAt: new Date('2025-11-26T09:00:00Z').toISOString(),
            userId: 'user1',
            type: 'PRODUCTO_AGREGADO',
          },
        ],
        isLoading: false,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 0,
      });

      render(<NotificationCenter />);

      expect(screen.queryByText('Marcar como leído')).not.toBeInTheDocument();
      expect(screen.getByText('Eliminar')).toBeInTheDocument();
    });

    it('debe renderizar múltiples notificaciones con sus acciones independientes', () => {
      mockUseNotifications.mockReturnValue({
        notifications: [
          {
            id: 'notif1',
            message: 'Nueva lista compartida contigo',
            read: false,
            createdAt: new Date('2025-11-26T10:00:00Z').toISOString(),
            userId: 'user1',
            type: 'LISTA_COMPARTIDA',
          },
          {
            id: 'notif2',
            message: 'Producto añadido a lista',
            read: true,
            createdAt: new Date('2025-11-26T09:00:00Z').toISOString(),
            userId: 'user1',
            type: 'PRODUCTO_AGREGADO',
          },
          {
            id: 'notif3',
            message: 'Colaborador aceptó invitación',
            read: false,
            createdAt: new Date('2025-11-26T08:00:00Z').toISOString(),
            userId: 'user1',
            type: 'COLABORADOR_ACEPTADO',
          },
        ],
        isLoading: false,
        error: null,
        markAsRead: mockMarkAsRead,
        deleteNotification: mockDeleteNotification,
        unreadCount: 2,
      });

      render(<NotificationCenter />);

      expect(screen.getByText('Nueva lista compartida contigo')).toBeInTheDocument();
      expect(screen.getByText('Producto añadido a lista')).toBeInTheDocument();
      expect(screen.getByText('Colaborador aceptó invitación')).toBeInTheDocument();

      // 2 notificaciones no leídas → 2 botones "Marcar como leído"
      const markButtons = screen.getAllByText('Marcar como leído');
      expect(markButtons).toHaveLength(2);

      // 3 notificaciones → 3 botones "Eliminar"
      const deleteButtons = screen.getAllByText('Eliminar');
      expect(deleteButtons).toHaveLength(3);
    });
  });
});
