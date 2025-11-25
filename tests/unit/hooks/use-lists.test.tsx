/**
 * Tests CRÍTICOS (100% coverage) - use-lists.ts
 * Hooks de React Query para gestión de listas
 * 
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react-hooks
 * Mock: listService
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { listService } from '@/features/lists/services/list-service';
import {
  useLists,
  useList,
  useCreateList,
  useDeleteList,
  useUpdateList,
  useListSummary,
} from '@/features/lists/hooks/use-lists';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';

// Mock del servicio
jest.mock('@/features/lists/services/list-service', () => ({
  listService: {
    getLists: jest.fn(),
    getListById: jest.fn(),
    createList: jest.fn(),
    deleteList: jest.fn(),
    updateList: jest.fn(),
    getListSummary: jest.fn(),
  },
}));

describe('useLists hooks (CRÍTICO - 100% coverage)', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useLists', () => {
    it('debe obtener listas correctamente', async () => {
      const mockLists = {
        items: [
          { id: 'list-1', nombre: 'Lista 1', tienda: 'Mercadona', productos: 5 },
          { id: 'list-2', nombre: 'Lista 2', tienda: 'Carrefour', productos: 3 },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (listService.getLists as jest.Mock).mockResolvedValue(mockLists);

      const { result } = renderHook(() => useLists(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockLists);
      expect(listService.getLists).toHaveBeenCalledWith(undefined, 1, 10);
    });

    it('debe pasar parámetros de búsqueda y paginación', async () => {
      const mockLists = {
        items: [{ id: 'list-1', nombre: 'Compra semanal', tienda: 'Mercadona', productos: 10 }],
        total: 1,
        page: 2,
        limit: 20,
        totalPages: 1,
      };

      (listService.getLists as jest.Mock).mockResolvedValue(mockLists);

      const { result } = renderHook(() => useLists('compra', 2, 20), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(listService.getLists).toHaveBeenCalledWith('compra', 2, 20);
      expect(result.current.data?.items).toHaveLength(1);
    });

    it('debe manejar error al obtener listas', async () => {
      (listService.getLists as jest.Mock).mockRejectedValue(new Error('Error del servidor'));

      const { result } = renderHook(() => useLists(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect((result.current.error as Error).message).toBe('Error del servidor');
    });

    it('debe refetch al cambiar parámetros', async () => {
      const mockLists1 = {
        items: [{ id: 'list-1', nombre: 'Lista 1', tienda: 'Mercadona', productos: 5 }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      const mockLists2 = {
        items: [{ id: 'list-2', nombre: 'Lista 2', tienda: 'Carrefour', productos: 3 }],
        total: 1,
        page: 2,
        limit: 10,
        totalPages: 1,
      };

      (listService.getLists as jest.Mock)
        .mockResolvedValueOnce(mockLists1)
        .mockResolvedValueOnce(mockLists2);

      const { result, rerender } = renderHook(
        ({ page }) => useLists(undefined, page, 10),
        { wrapper, initialProps: { page: 1 } }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockLists1);

      rerender({ page: 2 });

      await waitFor(() => expect(result.current.data).toEqual(mockLists2));
      expect(listService.getLists).toHaveBeenCalledTimes(2);
    });
  });

  describe('useList', () => {
    it('debe obtener lista por ID', async () => {
      const mockList = {
        id: 'list-1',
        nombre: 'Compra semanal',
        tienda: 'Mercadona',
        productos: [],
        creador: 'user-1',
      };

      (listService.getListById as jest.Mock).mockResolvedValue(mockList);

      const { result } = renderHook(() => useList('list-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockList);
      expect(listService.getListById).toHaveBeenCalledWith('list-1');
    });

    it('NO debe hacer fetch si ID está vacío', async () => {
      const { result } = renderHook(() => useList(''), { wrapper });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(listService.getListById).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });

    it('debe manejar error al obtener lista', async () => {
      (listService.getListById as jest.Mock).mockRejectedValue(new Error('Lista no encontrada'));

      const { result } = renderHook(() => useList('invalid-id'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useCreateList', () => {
    it('debe crear lista correctamente', async () => {
      const newList = {
        id: 'list-new',
        nombre: 'Nueva lista',
        tienda: 'Mercadona',
        productos: [],
        creador: 'user-1',
      };
      const createDto = { nombre: 'Nueva lista', tienda: 'Mercadona' };

      (listService.createList as jest.Mock).mockResolvedValue(newList);

      const { result } = renderHook(() => useCreateList(), { wrapper });

      result.current.mutate(createDto);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(listService.createList).toHaveBeenCalledWith(createDto);
      expect(result.current.data).toEqual(newList);
    });

    it('debe invalidar cache de listas después de crear', async () => {
      const newList = { id: 'list-new', nombre: 'Nueva lista', tienda: 'Mercadona', productos: [] };
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      (listService.createList as jest.Mock).mockResolvedValue(newList);

      const { result } = renderHook(() => useCreateList(), { wrapper });

      result.current.mutate({ nombre: 'Nueva lista', tienda: 'Mercadona' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists'] });
    });

    it('debe manejar error al crear lista', async () => {
      (listService.createList as jest.Mock).mockRejectedValue(new Error('Nombre requerido'));

      const { result } = renderHook(() => useCreateList(), { wrapper });

      result.current.mutate({ nombre: '', tienda: 'Mercadona' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useDeleteList', () => {
    it('debe eliminar lista correctamente', async () => {
      (listService.deleteList as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteList(), { wrapper });

      result.current.mutate('list-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(listService.deleteList).toHaveBeenCalledWith('list-1');
    });

    it('debe invalidar y eliminar queries después de borrar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = jest.spyOn(queryClient, 'removeQueries');

      (listService.deleteList as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteList(), { wrapper });

      result.current.mutate('list-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists'] });
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['lists', 'list-1'] });
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['products', 'list-1'] });
    });

    it('debe manejar error al eliminar lista', async () => {
      (listService.deleteList as jest.Mock).mockRejectedValue(new Error('Sin permisos'));

      const { result } = renderHook(() => useDeleteList(), { wrapper });

      result.current.mutate('list-1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('debe manejar lista no encontrada', async () => {
      (listService.deleteList as jest.Mock).mockRejectedValue(new Error('Lista no encontrada'));

      const { result } = renderHook(() => useDeleteList(), { wrapper });

      result.current.mutate('invalid-id');

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useUpdateList', () => {
    it('debe actualizar lista correctamente', async () => {
      const updatedList = {
        id: 'list-1',
        nombre: 'Lista actualizada',
        tienda: 'Carrefour',
        productos: [],
      };
      const updateDto = { nombre: 'Lista actualizada', tienda: 'Carrefour' };

      (listService.updateList as jest.Mock).mockResolvedValue(updatedList);

      const { result } = renderHook(() => useUpdateList(), { wrapper });

      result.current.mutate({ id: 'list-1', data: updateDto });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(listService.updateList).toHaveBeenCalledWith('list-1', updateDto);
      expect(result.current.data).toEqual(updatedList);
    });

    it('debe invalidar queries de lista y listas después de actualizar', async () => {
      const updatedList = { id: 'list-1', nombre: 'Actualizada', tienda: 'Mercadona', productos: [] };
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      (listService.updateList as jest.Mock).mockResolvedValue(updatedList);

      const { result } = renderHook(() => useUpdateList(), { wrapper });

      result.current.mutate({ id: 'list-1', data: { nombre: 'Actualizada' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists', 'list-1'] });
    });

    it('debe manejar error al actualizar lista', async () => {
      (listService.updateList as jest.Mock).mockRejectedValue(new Error('Datos inválidos'));

      const { result } = renderHook(() => useUpdateList(), { wrapper });

      result.current.mutate({ id: 'list-1', data: { nombre: '' } });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useListSummary', () => {
    it('debe obtener resumen de lista', async () => {
      const mockSummary = {
        totalProductos: 15,
        productosComprados: 8,
        productosPendientes: 7,
        porcentajeCompletado: 53.33,
      };

      (listService.getListSummary as jest.Mock).mockResolvedValue(mockSummary);

      const { result } = renderHook(() => useListSummary('list-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSummary);
      expect(listService.getListSummary).toHaveBeenCalledWith('list-1');
    });

    it('NO debe hacer fetch si ID está vacío', async () => {
      const { result } = renderHook(() => useListSummary(''), { wrapper });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(listService.getListSummary).not.toHaveBeenCalled();
    });

    it('debe manejar error al obtener resumen', async () => {
      (listService.getListSummary as jest.Mock).mockRejectedValue(new Error('Lista vacía'));

      const { result } = renderHook(() => useListSummary('list-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('debe manejar resumen con lista sin productos', async () => {
      const emptySummary = {
        totalProductos: 0,
        productosComprados: 0,
        productosPendientes: 0,
        porcentajeCompletado: 0,
      };

      (listService.getListSummary as jest.Mock).mockResolvedValue(emptySummary);

      const { result } = renderHook(() => useListSummary('list-empty'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.totalProductos).toBe(0);
      expect(result.current.data?.porcentajeCompletado).toBe(0);
    });
  });
});
