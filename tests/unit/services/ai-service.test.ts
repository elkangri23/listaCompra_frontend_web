/**
 * Tests CRÍTICOS (100% coverage) - ai-service.ts
 * Servicios de Inteligencia Artificial para categorización y recomendaciones
 * 
 * Patrón: Arrange-Act-Assert
 * Mock: axios-instance
 * Funciones: Categorización, listas por ocasión, recomendaciones
 */

import {
  categorizeProduct,
  bulkCategorize,
  getOccasions,
  generateOccasionList,
  previewOccasionList,
  getContextExamples,
  getRecommendations,
  getProductRecommendations,
} from '@/features/ai/services/ai-service';
import { axiosInstance } from '@/lib/api/axios-instance';
import { createMockAxiosResponse, createMockAxiosError } from '../../utils/test-utils';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('aiService (CRÍTICO - 100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('categorizeProduct', () => {
    it('debe categorizar un producto con alta confianza', async () => {
      const request = {
        nombre: 'Leche entera',
        descripcion: 'Leche de vaca',
      };

      const mockResponse = {
        success: true,
        data: {
          categorias: [
            { id: 'cat-1', nombre: 'Lácteos', confianza: 0.95 },
            { id: 'cat-2', nombre: 'Bebidas', confianza: 0.75 },
          ],
          categoriaSugerida: { id: 'cat-1', nombre: 'Lácteos', confianza: 0.95 },
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await categorizeProduct(request);

      expect(axiosInstance.post).toHaveBeenCalledWith('/ai/categorize', request);
      expect(result.data.categoriaSugerida.nombre).toBe('Lácteos');
      expect(result.data.categoriaSugerida.confianza).toBe(0.95);
    });

    it('debe categorizar producto sin descripción', async () => {
      const request = {
        nombre: 'Pan',
      };

      const mockResponse = {
        success: true,
        data: {
          categorias: [{ id: 'cat-3', nombre: 'Panadería', confianza: 0.88 }],
          categoriaSugerida: { id: 'cat-3', nombre: 'Panadería', confianza: 0.88 },
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await categorizeProduct(request);

      expect(result.data.categorias).toHaveLength(1);
    });

    it('debe manejar producto sin categoría clara', async () => {
      const request = {
        nombre: 'Producto desconocido',
      };

      const mockResponse = {
        success: true,
        data: {
          categorias: [],
          categoriaSugerida: null,
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await categorizeProduct(request);

      expect(result.data.categorias).toHaveLength(0);
      expect(result.data.categoriaSugerida).toBeNull();
    });

    it('debe manejar error del servicio de IA', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error de IA', 500)
      );

      await expect(
        categorizeProduct({ nombre: 'Test' })
      ).rejects.toMatchObject({
        message: 'Error de IA',
      });
    });
  });

  describe('bulkCategorize', () => {
    it('debe categorizar múltiples productos', async () => {
      const request = {
        productos: [
          { nombre: 'Leche' },
          { nombre: 'Pan' },
          { nombre: 'Manzanas' },
        ],
      };

      const mockResponse = {
        success: true,
        data: {
          productos: [
            {
              nombre: 'Leche',
              categoriaSugerida: { id: 'cat-1', nombre: 'Lácteos', confianza: 0.95 },
            },
            {
              nombre: 'Pan',
              categoriaSugerida: { id: 'cat-2', nombre: 'Panadería', confianza: 0.90 },
            },
            {
              nombre: 'Manzanas',
              categoriaSugerida: { id: 'cat-3', nombre: 'Frutas', confianza: 0.98 },
            },
          ],
          stats: {
            total: 3,
            categorizados: 3,
            sinCategorizar: 0,
          },
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await bulkCategorize(request);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/ai/bulk-categorize',
        request
      );
      expect(result.data.productos).toHaveLength(3);
      expect(result.data.stats.categorizados).toBe(3);
    });

    it('debe manejar productos parcialmente categorizados', async () => {
      const request = {
        productos: [
          { nombre: 'Leche' },
          { nombre: 'Producto raro' },
        ],
      };

      const mockResponse = {
        success: true,
        data: {
          productos: [
            {
              nombre: 'Leche',
              categoriaSugerida: { id: 'cat-1', nombre: 'Lácteos', confianza: 0.95 },
            },
            {
              nombre: 'Producto raro',
              categoriaSugerida: null,
            },
          ],
          stats: {
            total: 2,
            categorizados: 1,
            sinCategorizar: 1,
          },
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await bulkCategorize(request);

      expect(result.data.stats.sinCategorizar).toBe(1);
    });

    it('debe rechazar más de 50 productos', async () => {
      const request = {
        productos: Array(51)
          .fill(null)
          .map((_, i) => ({ nombre: `Producto ${i}` })),
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Máximo 50 productos', 400)
      );

      await expect(bulkCategorize(request)).rejects.toMatchObject({
        response: { status: 400 },
      });
    });

    it('debe rechazar array vacío', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Lista vacía', 400)
      );

      await expect(
        bulkCategorize({ productos: [] })
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('getOccasions', () => {
    it('debe obtener lista de ocasiones disponibles', async () => {
      const mockResponse = {
        success: true,
        data: {
          occasions: [
            { id: 'bbq', nombre: 'Barbacoa', descripcion: 'Comida al aire libre' },
            { id: 'dinner', nombre: 'Cena romántica', descripcion: 'Cena para dos' },
            { id: 'party', nombre: 'Fiesta', descripcion: 'Reunión con amigos' },
          ],
        },
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await getOccasions();

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/occasion-lists/occasions'
      );
      expect(result.data.occasions).toHaveLength(3);
      expect(result.data.occasions[0].nombre).toBe('Barbacoa');
    });

    it('debe manejar error al obtener ocasiones', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      await expect(getOccasions()).rejects.toMatchObject({
        message: 'Error del servidor',
      });
    });
  });

  describe('generateOccasionList', () => {
    it('debe generar lista para ocasión específica', async () => {
      const request = {
        ocasion: 'bbq',
        numeroPersonas: 8,
        contexto: 'Barbacoa de verano',
      };

      const mockResponse = {
        success: true,
        data: {
          listaId: 'list-new',
          nombre: 'Lista: Barbacoa',
          productos: [
            { nombre: 'Carne de res', cantidad: 2, categoriaId: 'cat-1' },
            { nombre: 'Carbón', cantidad: 1, categoriaId: 'cat-2' },
            { nombre: 'Pan para hamburguesas', cantidad: 16, categoriaId: 'cat-3' },
          ],
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await generateOccasionList(request);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/occasion-lists/generate',
        request
      );
      expect(result.data.productos).toHaveLength(3);
      expect(result.data.listaId).toBe('list-new');
    });

    it('debe generar lista sin contexto adicional', async () => {
      const request = {
        ocasion: 'dinner',
        numeroPersonas: 2,
      };

      const mockResponse = {
        success: true,
        data: {
          listaId: 'list-new-2',
          nombre: 'Lista: Cena romántica',
          productos: [
            { nombre: 'Vino tinto', cantidad: 1, categoriaId: 'cat-1' },
            { nombre: 'Velas', cantidad: 4, categoriaId: 'cat-2' },
          ],
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await generateOccasionList(request);

      expect(result.data.productos).toHaveLength(2);
    });

    it('debe rechazar ocasión inválida', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Ocasión no encontrada', 404)
      );

      await expect(
        generateOccasionList({
          ocasion: 'invalid',
          numeroPersonas: 4,
        })
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe rechazar número de personas inválido', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Número de personas inválido', 400)
      );

      await expect(
        generateOccasionList({
          ocasion: 'bbq',
          numeroPersonas: 0,
        })
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('previewOccasionList', () => {
    it('debe previsualizar lista sin crearla', async () => {
      const request = {
        ocasion: 'party',
        numeroPersonas: 15,
        contexto: 'Fiesta de cumpleaños',
      };

      const mockResponse = {
        success: true,
        data: {
          productos: [
            { nombre: 'Refrescos', cantidad: 10, categoriaId: 'cat-1' },
            { nombre: 'Snacks', cantidad: 5, categoriaId: 'cat-2' },
            { nombre: 'Vasos desechables', cantidad: 30, categoriaId: 'cat-3' },
          ],
          presupuestoEstimado: 85.5,
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await previewOccasionList(request);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/occasion-lists/preview',
        request
      );
      expect(result.data.productos).toHaveLength(3);
      expect(result.data.presupuestoEstimado).toBe(85.5);
    });

    it('debe previsualizar con presupuesto cero', async () => {
      const mockResponse = {
        success: true,
        data: {
          productos: [{ nombre: 'Producto', cantidad: 1, categoriaId: 'cat-1' }],
          presupuestoEstimado: 0,
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await previewOccasionList({
        ocasion: 'dinner',
        numeroPersonas: 2,
      });

      expect(result.data.presupuestoEstimado).toBe(0);
    });
  });

  describe('getContextExamples', () => {
    it('debe obtener ejemplos de contexto', async () => {
      const mockResponse = {
        success: true,
        data: {
          examples: [
            { contexto: 'Receta de paella', efecto: 'Sugiere arroz, azafrán, mariscos' },
            { contexto: 'Dieta vegana', efecto: 'Excluye productos de origen animal' },
            { contexto: 'Sin gluten', efecto: 'Evita productos con gluten' },
          ],
        },
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await getContextExamples();

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/recommendations/context-examples'
      );
      expect(result.data.examples).toHaveLength(3);
    });
  });

  describe('getRecommendations', () => {
    it('debe obtener recomendaciones para una lista', async () => {
      const mockResponse = {
        success: true,
        data: {
          recommendations: [
            { nombre: 'Aceite de oliva', razon: 'Complementa tus ensaladas', confianza: 0.85 },
            { nombre: 'Sal', razon: 'Condimento esencial', confianza: 0.90 },
          ],
        },
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await getRecommendations('list-1');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/recommendations/list-1',
        { params: undefined }
      );
      expect(result.data.recommendations).toHaveLength(2);
    });

    it('debe obtener recomendaciones con contexto', async () => {
      const mockResponse = {
        success: true,
        data: {
          recommendations: [
            { nombre: 'Tofu', razon: 'Proteína vegetal', confianza: 0.92 },
          ],
        },
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await getRecommendations('list-1', {
        contexto: 'Dieta vegana',
        limit: 5,
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/recommendations/list-1',
        { params: { contexto: 'Dieta vegana', limit: 5 } }
      );
    });

    it('debe manejar lista sin recomendaciones', async () => {
      const mockResponse = {
        success: true,
        data: {
          recommendations: [],
        },
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await getRecommendations('list-empty');

      expect(result.data.recommendations).toHaveLength(0);
    });
  });

  describe('getProductRecommendations', () => {
    it('debe obtener recomendaciones para un producto específico', async () => {
      const mockResponse = {
        success: true,
        data: {
          producto: { id: 'prod-1', nombre: 'Pasta' },
          recommendations: [
            { nombre: 'Salsa de tomate', razon: 'Combina con pasta', confianza: 0.95 },
            { nombre: 'Queso rallado', razon: 'Condimento ideal', confianza: 0.88 },
          ],
        },
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await getProductRecommendations('list-1', 'prod-1');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/recommendations/list-1/for-product/prod-1'
      );
      expect(result.data.recommendations).toHaveLength(2);
      expect(result.data.producto.nombre).toBe('Pasta');
    });

    it('debe manejar producto sin recomendaciones', async () => {
      const mockResponse = {
        success: true,
        data: {
          producto: { id: 'prod-2', nombre: 'Sal' },
          recommendations: [],
        },
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await getProductRecommendations('list-1', 'prod-2');

      expect(result.data.recommendations).toHaveLength(0);
    });

    it('debe manejar producto no encontrado', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Producto no encontrado', 404)
      );

      await expect(
        getProductRecommendations('list-1', 'invalid-prod')
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });
});
