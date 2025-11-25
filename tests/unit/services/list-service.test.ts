/**
 * Tests CRÍTICOS (100% coverage) - list-service.ts
 * Servicios de gestión de listas de compra
 * 
 * Patrón: Arrange-Act-Assert
 * Mock: axios-instance
 */

import { listService } from '@/features/lists/services/list-service';
import { axiosInstance } from '@/lib/api/axios-instance';
import { Lista } from '@/types/Lista.types';
import { PaginatedResponse } from '@/types/PaginatedResponse.types';
import { createMockAxiosResponse, createMockAxiosError } from '../../utils/test-utils';

// Mock del módulo axios-instance
jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('listService (CRÍTICO - 100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLists', () => {
    it('debe obtener listas con paginación por defecto', async () => {
      // Arrange
      const mockLists: PaginatedResponse<Lista> = {
        items: [
          {
            id: '1',
            nombre: 'Lista Supermercado',
            descripcion: 'Compra semanal',
            tiendaId: 'store-1',
            propietarioId: 'user-1',
            fechaCreacion: new Date('2025-01-01'),
            fechaActualizacion: new Date('2025-01-01'),
            estadoPreferencia: 'EnProgreso',
          },
          {
            id: '2',
            nombre: 'Lista Farmacia',
            descripcion: 'Medicinas',
            tiendaId: 'store-2',
            propietarioId: 'user-1',
            fechaCreacion: new Date('2025-01-02'),
            fechaActualizacion: new Date('2025-01-02'),
            estadoPreferencia: 'EnProgreso',
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockLists)
      );

      // Act
      const result = await listService.getLists();

      // Assert
      expect(axiosInstance.get).toHaveBeenCalledWith('/lists', {
        params: { q: undefined, page: 1, limit: 10 },
      });
      expect(result.items).toHaveLength(2);
      expect(result.items[0].nombre).toBe('Lista Supermercado');
      expect(result.total).toBe(2);
    });

    it('debe obtener listas con query de búsqueda', async () => {
      // Arrange
      const mockLists: PaginatedResponse<Lista> = {
        items: [
          {
            id: '1',
            nombre: 'Lista Farmacia',
            descripcion: 'Medicinas',
            tiendaId: 'store-1',
            propietarioId: 'user-1',
            fechaCreacion: new Date('2025-01-01'),
            fechaActualizacion: new Date('2025-01-01'),
            estadoPreferencia: 'EnProgreso',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockLists)
      );

      // Act
      const result = await listService.getLists('Farmacia', 1, 10);

      // Assert
      expect(axiosInstance.get).toHaveBeenCalledWith('/lists', {
        params: { q: 'Farmacia', page: 1, limit: 10 },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].nombre).toBe('Lista Farmacia');
    });

    it('debe manejar error de red', async () => {
      // Arrange
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Network error', 503)
      );

      // Act & Assert
      await expect(listService.getLists()).rejects.toMatchObject({
        message: 'Network error',
      });
    });

    it('debe manejar respuesta vacía', async () => {
      // Arrange
      const emptyResponse: PaginatedResponse<Lista> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(emptyResponse)
      );

      // Act
      const result = await listService.getLists('NoExiste');

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getListById', () => {
    it('debe obtener una lista por ID', async () => {
      // Arrange
      const mockList: Lista = {
        id: '1',
        nombre: 'Lista Test',
        descripcion: 'Descripción test',
        tiendaId: 'store-1',
        propietarioId: 'user-1',
        fechaCreacion: new Date('2025-01-01'),
        fechaActualizacion: new Date('2025-01-01'),
        estadoPreferencia: 'EnProgreso',
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockList })
      );

      // Act
      const result = await listService.getListById('1');

      // Assert
      expect(axiosInstance.get).toHaveBeenCalledWith('/lists/1');
      expect(result.id).toBe('1');
      expect(result.nombre).toBe('Lista Test');
    });

    it('debe manejar lista no encontrada', async () => {
      // Arrange
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Lista no encontrada', 404)
      );

      // Act & Assert
      await expect(listService.getListById('999')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe manejar ID inválido', async () => {
      // Arrange
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('ID inválido', 400)
      );

      // Act & Assert
      await expect(listService.getListById('invalid')).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('createList', () => {
    it('debe crear una nueva lista', async () => {
      // Arrange
      const newList = {
        nombre: 'Nueva Lista',
        descripcion: 'Descripción',
        tiendaId: 'store-1',
      };

      const createdList: Lista = {
        id: 'new-id',
        ...newList,
        propietarioId: 'user-1',
        fechaCreacion: new Date('2025-01-15'),
        fechaActualizacion: new Date('2025-01-15'),
        estadoPreferencia: 'EnProgreso',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: createdList })
      );

      // Act
      const result = await listService.createList(newList);

      // Assert
      expect(axiosInstance.post).toHaveBeenCalledWith('/lists', newList);
      expect(result.id).toBe('new-id');
      expect(result.nombre).toBe('Nueva Lista');
    });

    it('debe rechazar nombre vacío', async () => {
      // Arrange
      const invalidList = {
        nombre: '',
        descripcion: 'Test',
        tiendaId: 'store-1',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Nombre requerido', 400)
      );

      // Act & Assert
      await expect(listService.createList(invalidList)).rejects.toMatchObject({
        response: { status: 400 },
      });
    });

    it('debe rechazar tienda inválida', async () => {
      // Arrange
      const invalidList = {
        nombre: 'Test',
        descripcion: 'Test',
        tiendaId: 'invalid-store',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Tienda no encontrada', 404)
      );

      // Act & Assert
      await expect(listService.createList(invalidList)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('updateList', () => {
    it('debe actualizar una lista existente', async () => {
      // Arrange
      const updateData = {
        nombre: 'Lista Actualizada',
        descripcion: 'Nueva descripción',
      };

      const updatedList: Lista = {
        id: '1',
        ...updateData,
        tiendaId: 'store-1',
        propietarioId: 'user-1',
        fechaCreacion: new Date('2025-01-01'),
        fechaActualizacion: new Date('2025-01-15'),
        estadoPreferencia: 'EnProgreso',
      };

      (axiosInstance.put as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: updatedList })
      );

      // Act
      const result = await listService.updateList('1', updateData);

      // Assert
      expect(axiosInstance.put).toHaveBeenCalledWith('/lists/1', updateData);
      expect(result.nombre).toBe('Lista Actualizada');
      expect(result.descripcion).toBe('Nueva descripción');
    });

    it('debe manejar lista no encontrada al actualizar', async () => {
      // Arrange
      (axiosInstance.put as jest.Mock).mockRejectedValue(
        createMockAxiosError('Lista no encontrada', 404)
      );

      // Act & Assert
      await expect(
        listService.updateList('999', { nombre: 'Test' })
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe rechazar datos inválidos', async () => {
      // Arrange
      (axiosInstance.put as jest.Mock).mockRejectedValue(
        createMockAxiosError('Datos inválidos', 400)
      );

      // Act & Assert
      await expect(
        listService.updateList('1', { nombre: '' })
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('deleteList', () => {
    it('debe eliminar una lista', async () => {
      // Arrange
      (axiosInstance.delete as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true })
      );

      // Act
      await listService.deleteList('1');

      // Assert
      expect(axiosInstance.delete).toHaveBeenCalledWith('/lists/1');
    });

    it('debe manejar lista no encontrada al eliminar', async () => {
      // Arrange
      (axiosInstance.delete as jest.Mock).mockRejectedValue(
        createMockAxiosError('Lista no encontrada', 404)
      );

      // Act & Assert
      await expect(listService.deleteList('999')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe manejar permisos insuficientes', async () => {
      // Arrange
      (axiosInstance.delete as jest.Mock).mockRejectedValue(
        createMockAxiosError('No autorizado', 403)
      );

      // Act & Assert
      await expect(listService.deleteList('1')).rejects.toMatchObject({
        response: { status: 403 },
      });
    });
  });

  describe('getListSummary', () => {
    it('debe obtener resumen de una lista', async () => {
      // Arrange
      const mockSummary = {
        id: '1',
        nombre: 'Lista Test',
        totalProductos: 10,
        productosComprados: 5,
        presupuestoEstimado: 150.0,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockSummary)
      );

      // Act
      const result = await listService.getListSummary('1');

      // Assert
      expect(axiosInstance.get).toHaveBeenCalledWith('/lists/1/summary');
      expect(result.totalProductos).toBe(10);
      expect(result.productosComprados).toBe(5);
    });

    it('debe manejar lista sin productos', async () => {
      // Arrange
      const emptyListSummary = {
        id: '1',
        nombre: 'Lista Vacía',
        totalProductos: 0,
        productosComprados: 0,
        presupuestoEstimado: 0,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(emptyListSummary)
      );

      // Act
      const result = await listService.getListSummary('1');

      // Assert
      expect(result.totalProductos).toBe(0);
      expect(result.productosComprados).toBe(0);
    });

    it('debe manejar error al obtener resumen', async () => {
      // Arrange
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      // Act & Assert
      await expect(listService.getListSummary('1')).rejects.toMatchObject({
        response: { status: 500 },
      });
    });
  });
});
