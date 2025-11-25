/**
 * Tests CRÍTICOS (100% coverage) - product-service.ts
 * Servicios de gestión de productos en listas
 * 
 * Patrón: Arrange-Act-Assert
 * Mock: axios-instance
 */

import { productService } from '@/features/products/services/product-service';
import { axiosInstance } from '@/lib/api/axios-instance';
import { createMockAxiosResponse, createMockAxiosError } from '../../utils/test-utils';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('productService (CRÍTICO - 100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('debe obtener productos de una lista', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'prod-1',
            nombre: 'Leche',
            cantidad: 2,
            categoriaId: 'cat-1',
            comprado: false,
          },
          {
            id: 'prod-2',
            nombre: 'Pan',
            cantidad: 1,
            categoriaId: 'cat-2',
            comprado: false,
          },
        ],
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await productService.getProducts({ listaId: 'list-1' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/lists/list-1/products', {
        params: {},
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].nombre).toBe('Leche');
    });

    it('debe obtener productos con filtros', async () => {
      const mockResponse = {
        success: true,
        data: [],
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      await productService.getProducts({
        listaId: 'list-1',
        categoriaId: 'cat-1',
        comprado: false,
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/lists/list-1/products', {
        params: { categoriaId: 'cat-1', comprado: false },
      });
    });

    it('debe manejar error al obtener productos', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error al obtener productos', 500)
      );

      await expect(
        productService.getProducts({ listaId: 'list-1' })
      ).rejects.toMatchObject({
        message: 'Error al obtener productos',
      });
    });
  });

  describe('createProduct', () => {
    it('debe crear un producto en la lista', async () => {
      const newProduct = {
        nombre: 'Queso',
        cantidad: 1,
        categoriaId: 'cat-3',
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'prod-3',
          ...newProduct,
          listaId: 'list-1',
          comprado: false,
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await productService.createProduct('list-1', newProduct);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/lists/list-1/products',
        {
          ...newProduct,
          listaId: 'list-1',
        }
      );
      expect(result.data.nombre).toBe('Queso');
      expect(result.data.id).toBe('prod-3');
    });

    it('debe rechazar producto con nombre vacío', async () => {
      const invalidProduct = {
        nombre: '',
        cantidad: 1,
        categoriaId: 'cat-1',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Nombre requerido', 400)
      );

      await expect(
        productService.createProduct('list-1', invalidProduct)
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });

    it('debe rechazar cantidad inválida', async () => {
      const invalidProduct = {
        nombre: 'Producto',
        cantidad: -1,
        categoriaId: 'cat-1',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Cantidad debe ser mayor a 0', 400)
      );

      await expect(
        productService.createProduct('list-1', invalidProduct)
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('updateProduct', () => {
    it('debe actualizar un producto', async () => {
      const updateData = {
        nombre: 'Leche Desnatada',
        cantidad: 3,
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'prod-1',
          ...updateData,
          listaId: 'list-1',
          categoriaId: 'cat-1',
          comprado: false,
        },
      };

      (axiosInstance.put as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await productService.updateProduct(
        'list-1',
        'prod-1',
        updateData
      );

      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/lists/list-1/products/prod-1',
        updateData
      );
      expect(result.data.nombre).toBe('Leche Desnatada');
      expect(result.data.cantidad).toBe(3);
    });

    it('debe manejar producto no encontrado', async () => {
      (axiosInstance.put as jest.Mock).mockRejectedValue(
        createMockAxiosError('Producto no encontrado', 404)
      );

      await expect(
        productService.updateProduct('list-1', 'invalid-id', { nombre: 'Test' })
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe rechazar actualización sin datos', async () => {
      (axiosInstance.put as jest.Mock).mockRejectedValue(
        createMockAxiosError('Datos requeridos', 400)
      );

      await expect(
        productService.updateProduct('list-1', 'prod-1', {})
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('deleteProduct', () => {
    it('debe eliminar un producto', async () => {
      const mockResponse = {
        success: true,
        message: 'Producto eliminado',
      };

      (axiosInstance.delete as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      await productService.deleteProduct('list-1', 'prod-1');

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        '/lists/list-1/products/prod-1',
        { data: undefined }
      );
    });

    it('debe eliminar producto con motivo', async () => {
      const mockResponse = {
        success: true,
        message: 'Producto eliminado',
      };

      (axiosInstance.delete as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      await productService.deleteProduct('list-1', 'prod-1', {
        motivo: 'Ya no lo necesito',
      });

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        '/lists/list-1/products/prod-1',
        { data: { motivo: 'Ya no lo necesito' } }
      );
    });

    it('debe manejar producto no encontrado al eliminar', async () => {
      (axiosInstance.delete as jest.Mock).mockRejectedValue(
        createMockAxiosError('Producto no encontrado', 404)
      );

      await expect(
        productService.deleteProduct('list-1', 'invalid-id')
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe manejar permisos insuficientes', async () => {
      (axiosInstance.delete as jest.Mock).mockRejectedValue(
        createMockAxiosError('No autorizado', 403)
      );

      await expect(
        productService.deleteProduct('list-1', 'prod-1')
      ).rejects.toMatchObject({
        response: { status: 403 },
      });
    });
  });

  describe('togglePurchased', () => {
    it('debe marcar producto como comprado', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'prod-1',
          nombre: 'Leche',
          comprado: true,
          fechaCompra: new Date().toISOString(),
        },
      };

      (axiosInstance.patch as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await productService.togglePurchased('list-1', 'prod-1', {
        comprado: true,
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/lists/list-1/products/prod-1/purchase',
        { comprado: true }
      );
      expect(result.data.comprado).toBe(true);
    });

    it('debe desmarcar producto como comprado', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'prod-1',
          nombre: 'Leche',
          comprado: false,
          fechaCompra: null,
        },
      };

      (axiosInstance.patch as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await productService.togglePurchased('list-1', 'prod-1', {
        comprado: false,
      });

      expect(result.data.comprado).toBe(false);
    });

    it('debe manejar error al cambiar estado', async () => {
      (axiosInstance.patch as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error al actualizar', 500)
      );

      await expect(
        productService.togglePurchased('list-1', 'prod-1', { comprado: true })
      ).rejects.toMatchObject({
        message: 'Error al actualizar',
      });
    });
  });

  describe('reorderProducts', () => {
    it('debe reordenar productos en la lista', async () => {
      const reorderData = {
        productIds: ['prod-3', 'prod-1', 'prod-2'],
      };

      const mockResponse = {
        success: true,
        message: 'Productos reordenados',
      };

      (axiosInstance.patch as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      await productService.reorderProducts('list-1', reorderData);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/lists/list-1/products/reorder',
        reorderData
      );
    });

    it('debe rechazar orden vacío', async () => {
      (axiosInstance.patch as jest.Mock).mockRejectedValue(
        createMockAxiosError('Lista de productos vacía', 400)
      );

      await expect(
        productService.reorderProducts('list-1', { productIds: [] })
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });

    it('debe rechazar IDs duplicados', async () => {
      (axiosInstance.patch as jest.Mock).mockRejectedValue(
        createMockAxiosError('IDs duplicados', 400)
      );

      await expect(
        productService.reorderProducts('list-1', {
          productIds: ['prod-1', 'prod-1', 'prod-2'],
        })
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });

    it('debe manejar error del servidor al reordenar', async () => {
      (axiosInstance.patch as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error interno', 500)
      );

      await expect(
        productService.reorderProducts('list-1', {
          productIds: ['prod-1', 'prod-2'],
        })
      ).rejects.toMatchObject({
        response: { status: 500 },
      });
    });
  });
});
