/**
 * Tests unitarios para use-stores hook (SECUNDARIO - 80% coverage)
 * 
 * @jest-environment jsdom
 * 
 * Hooks testeados:
 * - useStores (query con filtros opcionales)
 * - useStore (query por ID con enabled)
 * - useCreateStore (mutation con cache invalidation)
 * - useUpdateStore (mutation con double invalidation)
 * - useDeleteStore (mutation)
 * - useToggleStoreStatus (mutation con double invalidation)
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useStores,
  useStore,
  useCreateStore,
  useUpdateStore,
  useDeleteStore,
  useToggleStoreStatus,
} from '@/features/stores/hooks/use-stores';
import { storeService } from '@/features/stores/services/store-service';

// Mock del store service
jest.mock('@/features/stores/services/store-service', () => ({
  storeService: {
    getStores: jest.fn(),
    getStoreById: jest.fn(),
    createStore: jest.fn(),
    updateStore: jest.fn(),
    deleteStore: jest.fn(),
    toggleStoreStatus: jest.fn(),
  },
}));

const mockStoreService = storeService as jest.Mocked<typeof storeService>;

describe('use-stores (SECUNDARIO - 80% coverage)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useStores', () => {
    it('debe obtener lista de tiendas sin filtros', async () => {
      const mockResponse = {
        data: [
          { id: 'store-1', nombre: 'Mercadona', ubicacion: 'Madrid', activo: true },
          { id: 'store-2', nombre: 'Carrefour', ubicacion: 'Barcelona', activo: true },
        ],
        total: 2,
      };
      mockStoreService.getStores.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useStores(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreService.getStores).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.data).toHaveLength(2);
    });

    it('debe obtener tiendas con filtros de búsqueda', async () => {
      const mockResponse = {
        data: [{ id: 'store-1', nombre: 'Mercadona', ubicacion: 'Madrid', activo: true }],
        total: 1,
      };
      mockStoreService.getStores.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useStores({ search: 'Mercadona', activo: true }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(1);
      expect(result.current.data?.data[0].nombre).toBe('Mercadona');
    });

    it('debe manejar error al obtener tiendas', async () => {
      const mockError = new Error('Network error');
      mockStoreService.getStores.mockRejectedValue(mockError);

      const { result } = renderHook(() => useStores(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useStore', () => {
    it('debe obtener tienda por ID', async () => {
      const mockResponse = {
        id: 'store-1',
        nombre: 'Mercadona',
        ubicacion: 'Madrid',
        activo: true,
      };
      mockStoreService.getStoreById.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useStore('store-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreService.getStoreById).toHaveBeenCalledWith('store-1');
      expect(result.current.data).toEqual(mockResponse);
    });

    it('no debe ejecutar query si ID está vacío', async () => {
      const { result } = renderHook(() => useStore(''), { wrapper });

      await waitFor(() => expect(result.current.status).toBe('pending'));

      expect(mockStoreService.getStoreById).not.toHaveBeenCalled();
    });

    it('debe manejar error al obtener tienda específica', async () => {
      const mockError = new Error('Tienda no encontrada');
      mockStoreService.getStoreById.mockRejectedValue(mockError);

      const { result } = renderHook(() => useStore('store-999'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useCreateStore', () => {
    it('debe crear nueva tienda', async () => {
      const newStore = { nombre: 'Lidl', ubicacion: 'Valencia' };
      const mockResponse = { id: 'store-3', ...newStore, activo: true };
      mockStoreService.createStore.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateStore(), { wrapper });

      result.current.mutate(newStore);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreService.createStore).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
    });

    it('debe invalidar cache de tiendas después de crear', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      const newStore = { nombre: 'Aldi', ubicacion: 'Sevilla' };
      const mockResponse = { id: 'store-4', ...newStore, activo: true };
      mockStoreService.createStore.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateStore(), { wrapper });

      result.current.mutate(newStore);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['stores'] });
    });

    it('debe manejar error al crear tienda', async () => {
      const mockError = new Error('Nombre duplicado');
      mockStoreService.createStore.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateStore(), { wrapper });

      result.current.mutate({ nombre: 'Mercadona', ubicacion: 'Madrid' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useUpdateStore', () => {
    it('debe actualizar tienda existente', async () => {
      const updateData = { id: 'store-1', nombre: 'Mercadona Centro', ubicacion: 'Madrid Centro' };
      const mockResponse = { ...updateData, activo: true };
      mockStoreService.updateStore.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateStore(), { wrapper });

      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreService.updateStore).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
    });

    it('debe invalidar cache general y específico después de actualizar', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      const updateData = { id: 'store-1', nombre: 'Actualizado' };
      const mockResponse = { ...updateData, ubicacion: 'Test', activo: true };
      mockStoreService.updateStore.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateStore(), { wrapper });

      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['stores'] });
      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['stores', 'store-1'] });
    });

    it('debe manejar error al actualizar', async () => {
      const mockError = new Error('Permisos insuficientes');
      mockStoreService.updateStore.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUpdateStore(), { wrapper });

      result.current.mutate({ id: 'store-1', nombre: 'Fail' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useDeleteStore', () => {
    it('debe eliminar tienda exitosamente', async () => {
      mockStoreService.deleteStore.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteStore(), { wrapper });

      result.current.mutate({ id: 'store-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreService.deleteStore).toHaveBeenCalled();
    });

    it('debe invalidar cache después de eliminar', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      mockStoreService.deleteStore.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteStore(), { wrapper });

      result.current.mutate({ id: 'store-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['stores'] });
    });

    it('debe manejar error con dependencias al eliminar', async () => {
      const mockError = new Error('No se puede eliminar: tiene categorías asociadas');
      mockStoreService.deleteStore.mockRejectedValue(mockError);

      const { result } = renderHook(() => useDeleteStore(), { wrapper });

      result.current.mutate({ id: 'store-1' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useToggleStoreStatus', () => {
    it('debe activar/desactivar tienda', async () => {
      const mockResponse = { id: 'store-1', nombre: 'Mercadona', ubicacion: 'Madrid', activo: false };
      mockStoreService.toggleStoreStatus.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useToggleStoreStatus(), { wrapper });

      result.current.mutate({ id: 'store-1', activo: false });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockStoreService.toggleStoreStatus).toHaveBeenCalled();
      expect(result.current.data?.activo).toBe(false);
    });

    it('debe invalidar cache general y específico después de toggle', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      const mockResponse = { id: 'store-1', nombre: 'Test', ubicacion: 'Test', activo: true };
      mockStoreService.toggleStoreStatus.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useToggleStoreStatus(), { wrapper });

      result.current.mutate({ id: 'store-1', activo: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['stores'] });
      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['stores', 'store-1'] });
    });

    it('debe manejar error de permisos al toggle', async () => {
      const mockError = new Error('Solo el propietario puede cambiar el estado');
      mockStoreService.toggleStoreStatus.mockRejectedValue(mockError);

      const { result } = renderHook(() => useToggleStoreStatus(), { wrapper });

      result.current.mutate({ id: 'store-1', activo: false });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });
});
