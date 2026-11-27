/**
 * Tests de servicios con coverage bajo:
 * category-service, notification-service
 */

import { axiosInstance } from '@/lib/api/axios-instance';

import { categoryService } from '@/features/categories/services/category-service';
import { notificationService } from '@/features/notifications/services/notification-service';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // El backend envuelve las respuestas en { success, message, data }.
  const envelope = <T>(data: T) => ({ data: { success: true, data } });

  describe('getCategories', () => {
    it('debe obtener categorías sin filtros', async () => {
      const list = { categorias: [], total: 0 };
      (axiosInstance.get as jest.Mock).mockResolvedValue(envelope(list));

      const result = await categoryService.getCategories();

      expect(axiosInstance.get).toHaveBeenCalledWith('/categories', { params: undefined });
      expect(result).toEqual(list);
    });

    it('debe obtener categorías con filtros', async () => {
      const list = { categorias: [], total: 0 };
      (axiosInstance.get as jest.Mock).mockResolvedValue(envelope(list));

      await categoryService.getCategories({ storeId: 'store-1', search: 'pan' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/categories', {
        params: { storeId: 'store-1', search: 'pan' },
      });
    });
  });

  describe('getCategoryById', () => {
    it('debe obtener una categoría por id', async () => {
      const category = { id: 'cat-1', nombre: 'Lácteos' };
      (axiosInstance.get as jest.Mock).mockResolvedValue(envelope(category));

      const result = await categoryService.getCategoryById('cat-1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/categories/cat-1');
      expect(result).toEqual(category);
    });
  });

  describe('createCategory', () => {
    it('debe crear una categoría', async () => {
      const created = { id: 'cat-2', nombre: 'Panadería' };
      (axiosInstance.post as jest.Mock).mockResolvedValue(envelope(created));

      const dto = { nombre: 'Panadería', storeId: 'store-1' };
      const result = await categoryService.createCategory(dto);

      expect(axiosInstance.post).toHaveBeenCalledWith('/categories', dto);
      expect(result).toEqual(created);
    });
  });

  describe('updateCategory', () => {
    it('debe actualizar separando el id del body', async () => {
      const updated = { id: 'cat-1', nombre: 'Nuevo nombre' };
      (axiosInstance.put as jest.Mock).mockResolvedValue(envelope(updated));

      const result = await categoryService.updateCategory({
        id: 'cat-1',
        nombre: 'Nuevo nombre',
      } as never);

      expect(axiosInstance.put).toHaveBeenCalledWith('/categories/cat-1', {
        nombre: 'Nuevo nombre',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteCategory', () => {
    it('debe eliminar la categoría por id', async () => {
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });

      await categoryService.deleteCategory({ id: 'cat-1' } as never);

      expect(axiosInstance.delete).toHaveBeenCalledWith('/categories/cat-1');
    });
  });

  describe('toggleCategoryStatus', () => {
    it('debe alternar el estado enviando el body sin el id', async () => {
      const toggled = { id: 'cat-1', activa: false };
      (axiosInstance.patch as jest.Mock).mockResolvedValue(envelope(toggled));

      const result = await categoryService.toggleCategoryStatus({
        id: 'cat-1',
        activa: false,
      } as never);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/categories/cat-1/toggle-status', {
        activa: false,
      });
      expect(result).toEqual(toggled);
    });
  });

  describe('moveCategoryToStore', () => {
    it('debe mover la categoría a otra tienda', async () => {
      const moved = { id: 'cat-1', storeId: 'store-2' };
      (axiosInstance.put as jest.Mock).mockResolvedValue(envelope(moved));

      const result = await categoryService.moveCategoryToStore({
        id: 'cat-1',
        storeId: 'store-2',
      } as never);

      expect(axiosInstance.put).toHaveBeenCalledWith('/categories/cat-1/move-to-store', {
        storeId: 'store-2',
      });
      expect(result).toEqual(moved);
    });
  });

  it('debe propagar errores del API', async () => {
    (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Server error'));

    await expect(categoryService.getCategories()).rejects.toThrow('Server error');
  });
});

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('debe obtener notificaciones con paginación por defecto', async () => {
      const paginated = { data: [], total: 0, page: 1, limit: 10 };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: paginated });

      const result = await notificationService.getNotifications();

      expect(axiosInstance.get).toHaveBeenCalledWith('/notifications', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(paginated);
    });

    it('debe aceptar página y límite personalizados', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });

      await notificationService.getNotifications(3, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith('/notifications', {
        params: { page: 3, limit: 20 },
      });
    });
  });

  describe('markAsRead', () => {
    it('debe marcar una notificación como leída', async () => {
      const notification = { id: 'notif-1', leido: true };
      (axiosInstance.patch as jest.Mock).mockResolvedValue({ data: notification });

      const result = await notificationService.markAsRead('notif-1');

      expect(axiosInstance.patch).toHaveBeenCalledWith('/notifications/notif-1/read');
      expect(result).toEqual(notification);
    });
  });

  describe('deleteNotification', () => {
    it('debe eliminar una notificación por id', async () => {
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });

      await notificationService.deleteNotification('notif-1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/notifications/notif-1');
    });
  });

  it('debe propagar errores del API', async () => {
    (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

    await expect(notificationService.getNotifications()).rejects.toThrow('Unauthorized');
  });
});
