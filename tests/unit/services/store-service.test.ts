/**
 * Tests CRÍTICOS - store-service.ts
 * Servicios CRUD de tiendas
 */

import { storeService } from '@/features/stores/services/store-service';
import { axiosInstance } from '@/lib/api/axios-instance';
import { StoreResponseDto, StoresListResponseDto } from '@/types/dtos/stores';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockStore: StoreResponseDto = {
  id: 'store-1',
  nombre: 'Supermercado',
  direccion: 'Calle Falsa 123',
  activa: true,
} as unknown as StoreResponseDto;

const mockStoresList = {
  tiendas: [mockStore],
  total: 1,
} as unknown as StoresListResponseDto;

// El backend envuelve las respuestas en { success, message, data }.
const envelope = <T>(data: T) => ({ data: { success: true, data } });

describe('storeService (CRÍTICO)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createStore', () => {
    it('debe crear una tienda', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue(envelope(mockStore));

      const dto = { nombre: 'Supermercado', direccion: 'Calle Falsa 123' };
      const result = await storeService.createStore(dto);

      expect(axiosInstance.post).toHaveBeenCalledWith('/stores', dto);
      expect(result).toEqual(mockStore);
    });

    it('debe propagar errores del API', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(new Error('Validation failed'));

      await expect(storeService.createStore({ nombre: '' })).rejects.toThrow('Validation failed');
    });
  });

  describe('getStores', () => {
    it('debe obtener tiendas sin filtros', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(envelope(mockStoresList));

      const result = await storeService.getStores();

      expect(axiosInstance.get).toHaveBeenCalledWith('/stores', { params: undefined });
      expect(result).toEqual(mockStoresList);
    });

    it('debe obtener tiendas con filtros', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(envelope(mockStoresList));

      await storeService.getStores({ activas: true, search: 'super' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/stores', {
        params: { activas: true, search: 'super' },
      });
    });
  });

  describe('getStoreById', () => {
    it('debe obtener una tienda por id', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(envelope(mockStore));

      const result = await storeService.getStoreById('store-1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/stores/store-1');
      expect(result).toEqual(mockStore);
    });
  });

  describe('updateStore', () => {
    it('debe actualizar la tienda separando el id del body', async () => {
      (axiosInstance.put as jest.Mock).mockResolvedValue(envelope(mockStore));

      const result = await storeService.updateStore({ id: 'store-1', nombre: 'Nuevo nombre' });

      expect(axiosInstance.put).toHaveBeenCalledWith('/stores/store-1', {
        nombre: 'Nuevo nombre',
      });
      expect(result).toEqual(mockStore);
    });
  });

  describe('deleteStore', () => {
    it('debe eliminar la tienda por id', async () => {
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });

      await storeService.deleteStore({ id: 'store-1' });

      expect(axiosInstance.delete).toHaveBeenCalledWith('/stores/store-1');
    });
  });

  describe('toggleStoreStatus', () => {
    it('debe alternar el estado enviando el body sin el id', async () => {
      const toggled = { ...mockStore, activa: false };
      (axiosInstance.patch as jest.Mock).mockResolvedValue(envelope(toggled));

      const result = await storeService.toggleStoreStatus({ id: 'store-1', activa: false });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/stores/store-1/toggle-status', {
        activa: false,
      });
      expect(result).toEqual(toggled);
    });
  });

  describe('getStoreCategories', () => {
    it('debe obtener las categorías de la tienda', async () => {
      const categories = { categorias: [], total: 0 };
      (axiosInstance.get as jest.Mock).mockResolvedValue(envelope(categories));

      const result = await storeService.getStoreCategories('store-1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/stores/store-1/categories');
      expect(result).toEqual(categories);
    });
  });
});
