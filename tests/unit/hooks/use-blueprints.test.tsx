/**
 * Tests CRÍTICOS (100% coverage) - use-blueprints.ts
 * Hooks de React Query para gestión de plantillas (blueprints)
 * 
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react-hooks
 * Mock: blueprintService, toast
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { blueprintService } from '@/features/blueprints/services/blueprint-service';
import {
  useBlueprints,
  useBlueprintById,
  useCreateBlueprint,
  useUpdateBlueprint,
  useDeleteBlueprint,
  useCreateListFromBlueprint,
  useCreateBlueprintFromList,
} from '@/features/blueprints/hooks/use-blueprints';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';
import { toast } from 'sonner';

jest.mock('@/features/blueprints/services/blueprint-service');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useBlueprints hooks (CRÍTICO - 100% coverage)', () => {
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

  describe('useBlueprints', () => {
    it('debe obtener todos los blueprints', async () => {
      const mockBlueprints = [
        { id: 'bp-1', nombre: 'Compra semanal', categoria: 'Alimentación', productos: 15 },
        { id: 'bp-2', nombre: 'Barbacoa', categoria: 'Eventos', productos: 20 },
      ];

      (blueprintService.getBlueprints as jest.Mock).mockResolvedValue(mockBlueprints);

      const { result } = renderHook(() => useBlueprints(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockBlueprints);
      expect(blueprintService.getBlueprints).toHaveBeenCalledWith(undefined);
    });

    it('debe filtrar blueprints por categoría', async () => {
      const mockBlueprints = [
        { id: 'bp-1', nombre: 'Compra semanal', categoria: 'Alimentación', productos: 15 },
      ];

      (blueprintService.getBlueprints as jest.Mock).mockResolvedValue(mockBlueprints);

      const { result } = renderHook(
        () => useBlueprints({ categoria: 'Alimentación' }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(blueprintService.getBlueprints).toHaveBeenCalledWith({ categoria: 'Alimentación' });
    });

    it('debe buscar blueprints por query', async () => {
      const mockBlueprints = [
        { id: 'bp-1', nombre: 'Compra semanal', categoria: 'Alimentación', productos: 15 },
      ];

      (blueprintService.getBlueprints as jest.Mock).mockResolvedValue(mockBlueprints);

      const { result } = renderHook(
        () => useBlueprints({ busqueda: 'semanal' }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(blueprintService.getBlueprints).toHaveBeenCalledWith({ busqueda: 'semanal' });
    });

    it('debe manejar error al obtener blueprints', async () => {
      (blueprintService.getBlueprints as jest.Mock).mockRejectedValue(
        new Error('Error del servidor')
      );

      const { result } = renderHook(() => useBlueprints(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useBlueprintById', () => {
    it('debe obtener blueprint por ID', async () => {
      const mockBlueprint = {
        id: 'bp-1',
        nombre: 'Compra semanal',
        descripcion: 'Lista de compra básica',
        categoria: 'Alimentación',
        productos: [
          { nombre: 'Leche', cantidad: 2 },
          { nombre: 'Pan', cantidad: 1 },
        ],
      };

      (blueprintService.getBlueprintById as jest.Mock).mockResolvedValue(mockBlueprint);

      const { result } = renderHook(() => useBlueprintById('bp-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockBlueprint);
      expect(blueprintService.getBlueprintById).toHaveBeenCalledWith('bp-1');
    });

    it('NO debe hacer fetch si ID está vacío', async () => {
      const { result } = renderHook(() => useBlueprintById(''), { wrapper });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(blueprintService.getBlueprintById).not.toHaveBeenCalled();
    });

    it('debe manejar blueprint no encontrado', async () => {
      (blueprintService.getBlueprintById as jest.Mock).mockRejectedValue(
        new Error('Blueprint no encontrado')
      );

      const { result } = renderHook(() => useBlueprintById('invalid-id'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useCreateBlueprint', () => {
    it('debe crear blueprint correctamente', async () => {
      const newBlueprint = {
        id: 'bp-new',
        nombre: 'Nueva plantilla',
        categoria: 'Personal',
      };
      const createData = {
        nombre: 'Nueva plantilla',
        descripcion: 'Plantilla personalizada',
        categoria: 'Personal',
        productos: [],
      };

      (blueprintService.createBlueprint as jest.Mock).mockResolvedValue(newBlueprint);

      const { result } = renderHook(() => useCreateBlueprint(), { wrapper });

      result.current.mutate(createData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(blueprintService.createBlueprint).toHaveBeenCalledWith(createData);
      expect(toast.success).toHaveBeenCalledWith('Plantilla creada correctamente');
    });

    it('debe invalidar cache después de crear', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (blueprintService.createBlueprint as jest.Mock).mockResolvedValue({ id: 'bp-1' });

      const { result } = renderHook(() => useCreateBlueprint(), { wrapper });

      result.current.mutate({ nombre: 'Test', categoria: 'Test', productos: [] });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['blueprints'] });
    });

    it('debe manejar error al crear', async () => {
      (blueprintService.createBlueprint as jest.Mock).mockRejectedValue(
        new Error('Nombre duplicado')
      );

      const { result } = renderHook(() => useCreateBlueprint(), { wrapper });

      result.current.mutate({ nombre: 'Duplicado', categoria: 'Test', productos: [] });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al crear la plantilla');
    });
  });

  describe('useUpdateBlueprint', () => {
    it('debe actualizar blueprint correctamente', async () => {
      const updated = { id: 'bp-1', nombre: 'Actualizado' };
      (blueprintService.updateBlueprint as jest.Mock).mockResolvedValue(updated);

      const { result } = renderHook(() => useUpdateBlueprint(), { wrapper });

      result.current.mutate({ id: 'bp-1', data: { nombre: 'Actualizado' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(blueprintService.updateBlueprint).toHaveBeenCalledWith('bp-1', {
        nombre: 'Actualizado',
      });
      expect(toast.success).toHaveBeenCalledWith('Plantilla actualizada correctamente');
    });

    it('debe invalidar múltiples caches después de actualizar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (blueprintService.updateBlueprint as jest.Mock).mockResolvedValue({ id: 'bp-1' });

      const { result } = renderHook(() => useUpdateBlueprint(), { wrapper });

      result.current.mutate({ id: 'bp-1', data: { descripcion: 'Nueva desc' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['blueprints'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['blueprints', 'bp-1'] });
    });

    it('debe manejar error al actualizar', async () => {
      (blueprintService.updateBlueprint as jest.Mock).mockRejectedValue(
        new Error('No autorizado')
      );

      const { result } = renderHook(() => useUpdateBlueprint(), { wrapper });

      result.current.mutate({ id: 'bp-1', data: { nombre: 'Test' } });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al actualizar la plantilla');
    });
  });

  describe('useDeleteBlueprint', () => {
    it('debe eliminar blueprint correctamente', async () => {
      (blueprintService.deleteBlueprint as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteBlueprint(), { wrapper });

      result.current.mutate('bp-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(blueprintService.deleteBlueprint).toHaveBeenCalledWith('bp-1');
      expect(toast.success).toHaveBeenCalledWith('Plantilla eliminada correctamente');
    });

    it('debe invalidar cache después de eliminar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (blueprintService.deleteBlueprint as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteBlueprint(), { wrapper });

      result.current.mutate('bp-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['blueprints'] });
    });

    it('debe manejar error al eliminar', async () => {
      (blueprintService.deleteBlueprint as jest.Mock).mockRejectedValue(
        new Error('Blueprint no encontrado')
      );

      const { result } = renderHook(() => useDeleteBlueprint(), { wrapper });

      result.current.mutate('invalid-id');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al eliminar la plantilla');
    });
  });

  describe('useCreateListFromBlueprint', () => {
    it('debe crear lista desde blueprint', async () => {
      const mockResponse = {
        id: 'list-new',
        nombre: 'Mi compra semanal',
        productosCreados: 15,
      };

      (blueprintService.createListFromBlueprint as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateListFromBlueprint(), { wrapper });

      result.current.mutate({ blueprintId: 'bp-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(blueprintService.createListFromBlueprint).toHaveBeenCalledWith('bp-1', undefined);
      expect(toast.success).toHaveBeenCalledWith(
        'Lista "Mi compra semanal" creada con 15 productos'
      );
    });

    it('debe crear lista con datos personalizados', async () => {
      const mockResponse = {
        id: 'list-new',
        nombre: 'Compra para fiesta',
        productosCreados: 20,
      };

      (blueprintService.createListFromBlueprint as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateListFromBlueprint(), { wrapper });

      result.current.mutate({
        blueprintId: 'bp-1',
        data: { nombre: 'Compra para fiesta', tienda: 'Mercadona' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(blueprintService.createListFromBlueprint).toHaveBeenCalledWith('bp-1', {
        nombre: 'Compra para fiesta',
        tienda: 'Mercadona',
      });
    });

    it('debe invalidar listas después de crear', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (blueprintService.createListFromBlueprint as jest.Mock).mockResolvedValue({
        id: 'list-1',
        nombre: 'Test',
        productosCreados: 5,
      });

      const { result } = renderHook(() => useCreateListFromBlueprint(), { wrapper });

      result.current.mutate({ blueprintId: 'bp-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists'] });
    });

    it('debe manejar error al crear lista', async () => {
      (blueprintService.createListFromBlueprint as jest.Mock).mockRejectedValue(
        new Error('Blueprint no encontrado')
      );

      const { result } = renderHook(() => useCreateListFromBlueprint(), { wrapper });

      result.current.mutate({ blueprintId: 'invalid-bp' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al crear lista desde plantilla');
    });
  });

  describe('useCreateBlueprintFromList', () => {
    it('debe crear blueprint desde lista existente', async () => {
      const mockResponse = {
        id: 'bp-new',
        nombre: 'Plantilla desde lista',
        productos: 10,
      };

      (blueprintService.createBlueprintFromList as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateBlueprintFromList(), { wrapper });

      result.current.mutate({
        listId: 'list-1',
        blueprintData: {
          nombre: 'Plantilla desde lista',
          categoria: 'Personal',
        },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(blueprintService.createBlueprintFromList).toHaveBeenCalledWith('list-1', {
        nombre: 'Plantilla desde lista',
        categoria: 'Personal',
      });
      expect(toast.success).toHaveBeenCalledWith('Plantilla creada desde lista correctamente');
    });

    it('debe invalidar blueprints después de crear', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (blueprintService.createBlueprintFromList as jest.Mock).mockResolvedValue({ id: 'bp-1' });

      const { result } = renderHook(() => useCreateBlueprintFromList(), { wrapper });

      result.current.mutate({
        listId: 'list-1',
        blueprintData: { nombre: 'Test', categoria: 'Test' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['blueprints'] });
    });

    it('debe manejar error al crear desde lista', async () => {
      (blueprintService.createBlueprintFromList as jest.Mock).mockRejectedValue(
        new Error('Lista vacía')
      );

      const { result } = renderHook(() => useCreateBlueprintFromList(), { wrapper });

      result.current.mutate({
        listId: 'empty-list',
        blueprintData: { nombre: 'Test', categoria: 'Test' },
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al crear plantilla desde lista');
    });
  });
});
