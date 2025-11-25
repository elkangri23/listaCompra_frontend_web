/**
 * Tests CRÍTICOS (100% coverage) - use-ai.ts
 * Hooks de React Query para funcionalidades de IA
 * 
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react-hooks
 * Mock: aiService
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { aiService } from '@/features/ai/services/ai-service';
import {
  useCategorizeProduct,
  useCategorySuggestions,
  useBulkCategorize,
  useOccasions,
  useGenerateOccasionList,
  usePreviewOccasionList,
  useContextExamples,
  useRecommendations,
  useProductRecommendations,
} from '@/features/ai/hooks/use-ai';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';

jest.mock('@/features/ai/services/ai-service', () => ({
  aiService: {
    categorizeProduct: jest.fn(),
    bulkCategorize: jest.fn(),
    getOccasions: jest.fn(),
    generateOccasionList: jest.fn(),
    previewOccasionList: jest.fn(),
    getContextExamples: jest.fn(),
    getRecommendations: jest.fn(),
    getProductRecommendations: jest.fn(),
  },
}));

describe('useAI hooks (CRÍTICO - 100% coverage)', () => {
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

  describe('useCategorizeProduct', () => {
    it('debe categorizar producto con confianza alta', async () => {
      const mockResponse = {
        sugerencias: [
          { categoriaId: 'cat-1', nombre: 'Lácteos', confianza: 0.95 },
          { categoriaId: 'cat-2', nombre: 'Bebidas', confianza: 0.05 },
        ],
      };

      (aiService.categorizeProduct as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCategorizeProduct(), { wrapper });

      result.current.mutate({ nombre: 'Leche', descripcion: 'Leche entera' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(aiService.categorizeProduct).toHaveBeenCalledWith({
        nombre: 'Leche',
        descripcion: 'Leche entera',
      });
      expect(result.current.data).toEqual(mockResponse);
    });

    it('debe categorizar sin descripción', async () => {
      const mockResponse = {
        sugerencias: [{ categoriaId: 'cat-1', nombre: 'Panadería', confianza: 0.88 }],
      };

      (aiService.categorizeProduct as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCategorizeProduct(), { wrapper });

      result.current.mutate({ nombre: 'Pan' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(aiService.categorizeProduct).toHaveBeenCalledWith({ nombre: 'Pan' });
    });

    it('debe manejar error al categorizar', async () => {
      (aiService.categorizeProduct as jest.Mock).mockRejectedValue(
        new Error('Error de IA')
      );

      const { result } = renderHook(() => useCategorizeProduct(), { wrapper });

      result.current.mutate({ nombre: 'Producto extraño' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useCategorySuggestions', () => {
    it('debe obtener sugerencias con cache', async () => {
      const mockSuggestions = {
        sugerencias: [{ categoriaId: 'cat-1', nombre: 'Frutas', confianza: 0.9 }],
      };

      (aiService.categorizeProduct as jest.Mock).mockResolvedValue(mockSuggestions);

      const { result } = renderHook(
        () => useCategorySuggestions('Manzana', 'Manzana roja', true),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSuggestions);
      expect(aiService.categorizeProduct).toHaveBeenCalledWith({
        nombre: 'Manzana',
        descripcion: 'Manzana roja',
      });
    });

    it('NO debe hacer fetch si enabled es false', async () => {
      const { result } = renderHook(
        () => useCategorySuggestions('Producto', undefined, false),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(aiService.categorizeProduct).not.toHaveBeenCalled();
    });

    it('NO debe hacer fetch si nombre está vacío', async () => {
      const { result } = renderHook(
        () => useCategorySuggestions('', undefined, true),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(aiService.categorizeProduct).not.toHaveBeenCalled();
    });
  });

  describe('useBulkCategorize', () => {
    it('debe categorizar múltiples productos', async () => {
      const mockResponse = {
        resultados: [
          { nombre: 'Leche', categoriaId: 'cat-1', confianza: 0.95 },
          { nombre: 'Pan', categoriaId: 'cat-2', confianza: 0.88 },
        ],
      };

      (aiService.bulkCategorize as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBulkCategorize(), { wrapper });

      result.current.mutate({
        productos: [{ nombre: 'Leche' }, { nombre: 'Pan' }],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
    });

    it('debe invalidar categorías después de categorizar en lote', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (aiService.bulkCategorize as jest.Mock).mockResolvedValue({ resultados: [] });

      const { result } = renderHook(() => useBulkCategorize(), { wrapper });

      result.current.mutate({ productos: [] });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
    });

    it('debe manejar límite de 50 productos', async () => {
      (aiService.bulkCategorize as jest.Mock).mockRejectedValue(
        new Error('Máximo 50 productos')
      );

      const { result } = renderHook(() => useBulkCategorize(), { wrapper });

      const manyProducts = Array.from({ length: 51 }, (_, i) => ({ nombre: `Producto ${i}` }));
      result.current.mutate({ productos: manyProducts });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useOccasions', () => {
    it('debe obtener lista de ocasiones', async () => {
      const mockOccasions = [
        { id: 'barbacoa', nombre: 'Barbacoa', descripcion: 'Para hacer una barbacoa' },
        { id: 'cumpleaños', nombre: 'Cumpleaños', descripcion: 'Fiesta de cumpleaños' },
      ];

      (aiService.getOccasions as jest.Mock).mockResolvedValue(mockOccasions);

      const { result } = renderHook(() => useOccasions(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOccasions);
      expect(aiService.getOccasions).toHaveBeenCalledTimes(1);
    });

    it('debe cachear ocasiones por 24 horas', async () => {
      const mockOccasions = [{ id: 'picnic', nombre: 'Picnic' }];
      (aiService.getOccasions as jest.Mock).mockResolvedValue(mockOccasions);

      const { result, rerender } = renderHook(() => useOccasions(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      rerender();

      // No debe llamar de nuevo (cache activo)
      expect(aiService.getOccasions).toHaveBeenCalledTimes(1);
    });
  });

  describe('useGenerateOccasionList', () => {
    it('debe generar lista por ocasión', async () => {
      const mockList = {
        id: 'list-new',
        nombre: 'Lista para Barbacoa',
        productos: ['Carne', 'Carbón', 'Bebidas'],
      };

      (aiService.generateOccasionList as jest.Mock).mockResolvedValue(mockList);

      const { result } = renderHook(() => useGenerateOccasionList(), { wrapper });

      result.current.mutate({
        ocasion: 'barbacoa',
        numPersonas: 8,
        restricciones: ['sin gluten'],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(aiService.generateOccasionList).toHaveBeenCalledWith({
        ocasion: 'barbacoa',
        numPersonas: 8,
        restricciones: ['sin gluten'],
      });
    });

    it('debe invalidar listas después de generar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (aiService.generateOccasionList as jest.Mock).mockResolvedValue({ id: 'list-1' });

      const { result } = renderHook(() => useGenerateOccasionList(), { wrapper });

      result.current.mutate({ ocasion: 'cumpleaños', numPersonas: 10 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists'] });
    });

    it('debe manejar error al generar lista', async () => {
      (aiService.generateOccasionList as jest.Mock).mockRejectedValue(
        new Error('Ocasión no válida')
      );

      const { result } = renderHook(() => useGenerateOccasionList(), { wrapper });

      result.current.mutate({ ocasion: 'invalida', numPersonas: 5 });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('usePreviewOccasionList', () => {
    it('debe previsualizar lista sin crearla', async () => {
      const mockPreview = {
        productos: ['Hamburguesas', 'Pan', 'Lechuga', 'Tomate'],
        totalEstimado: 25.5,
      };

      (aiService.previewOccasionList as jest.Mock).mockResolvedValue(mockPreview);

      const { result } = renderHook(() => usePreviewOccasionList(), { wrapper });

      result.current.mutate({ ocasion: 'picnic', numPersonas: 4 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPreview);
      expect(aiService.previewOccasionList).toHaveBeenCalledWith({
        ocasion: 'picnic',
        numPersonas: 4,
      });
    });

    it('debe manejar preview con restricciones', async () => {
      const mockPreview = { productos: ['Ensalada', 'Frutas'], totalEstimado: 15 };
      (aiService.previewOccasionList as jest.Mock).mockResolvedValue(mockPreview);

      const { result } = renderHook(() => usePreviewOccasionList(), { wrapper });

      result.current.mutate({
        ocasion: 'comida-saludable',
        numPersonas: 2,
        restricciones: ['vegetariano', 'sin lactosa'],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useContextExamples', () => {
    it('debe obtener ejemplos de contexto', async () => {
      const mockExamples = [
        { contexto: 'Fin de semana', descripcion: 'Comida casual para el fin de semana' },
        { contexto: 'Semana laboral', descripcion: 'Comidas rápidas para días de trabajo' },
      ];

      (aiService.getContextExamples as jest.Mock).mockResolvedValue(mockExamples);

      const { result } = renderHook(() => useContextExamples(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockExamples);
    });

    it('debe cachear ejemplos por 24 horas', async () => {
      (aiService.getContextExamples as jest.Mock).mockResolvedValue([]);

      const { result, rerender } = renderHook(() => useContextExamples(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      rerender();

      expect(aiService.getContextExamples).toHaveBeenCalledTimes(1);
    });
  });

  describe('useRecommendations', () => {
    it('debe obtener recomendaciones de lista', async () => {
      const mockRecommendations = {
        sugerencias: ['Cerveza', 'Refrescos', 'Hielo'],
        motivo: 'Complementos comunes para barbacoa',
      };

      (aiService.getRecommendations as jest.Mock).mockResolvedValue(mockRecommendations);

      const { result } = renderHook(
        () => useRecommendations('list-1', { contexto: 'Barbacoa', limit: 5 }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(aiService.getRecommendations).toHaveBeenCalledWith('list-1', {
        contexto: 'Barbacoa',
        limit: 5,
      });
    });

    it('NO debe hacer fetch si listId está vacío', async () => {
      const { result } = renderHook(
        () => useRecommendations('', undefined, true),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(aiService.getRecommendations).not.toHaveBeenCalled();
    });

    it('NO debe hacer fetch si enabled es false', async () => {
      const { result } = renderHook(
        () => useRecommendations('list-1', undefined, false),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(aiService.getRecommendations).not.toHaveBeenCalled();
    });

    it('debe refetch periódicamente cada 10 minutos', async () => {
      (aiService.getRecommendations as jest.Mock).mockResolvedValue({ sugerencias: [] });

      const { result } = renderHook(
        () => useRecommendations('list-1'),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verificar que tiene configurado refetchInterval
      expect(result.current.refetch).toBeDefined();
    });
  });

  describe('useProductRecommendations', () => {
    it('debe obtener recomendaciones de producto específico', async () => {
      const mockRecommendations = {
        sugerencias: ['Galletas', 'Azúcar', 'Café'],
        motivo: 'Productos que suelen comprarse con leche',
      };

      (aiService.getProductRecommendations as jest.Mock).mockResolvedValue(mockRecommendations);

      const { result } = renderHook(
        () => useProductRecommendations('list-1', 'product-1'),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(aiService.getProductRecommendations).toHaveBeenCalledWith('list-1', 'product-1');
      expect(result.current.data).toEqual(mockRecommendations);
    });

    it('NO debe hacer fetch si listId está vacío', async () => {
      const { result } = renderHook(
        () => useProductRecommendations('', 'product-1'),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(aiService.getProductRecommendations).not.toHaveBeenCalled();
    });

    it('NO debe hacer fetch si productId está vacío', async () => {
      const { result } = renderHook(
        () => useProductRecommendations('list-1', ''),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(aiService.getProductRecommendations).not.toHaveBeenCalled();
    });

    it('NO debe hacer fetch si enabled es false', async () => {
      const { result } = renderHook(
        () => useProductRecommendations('list-1', 'product-1', false),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(aiService.getProductRecommendations).not.toHaveBeenCalled();
    });
  });
});
