/**
 * Hooks de React Query para funcionalidades de IA
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../services/ai-service';
import type {
  CategorizeProductRequestDto,
  BulkCategorizeRequestDto,
  GenerateOccasionListRequestDto,
  PreviewOccasionListRequestDto,
  GetRecommendationsRequestDto,
} from '@/types/dtos/ai';

// ==================== Categorización Simple ====================

/**
 * Hook para categorizar un producto con IA
 * Retorna sugerencias de categorías con niveles de confianza
 */
export const useCategorizeProduct = () => {
  return useMutation({
    mutationFn: (data: CategorizeProductRequestDto) =>
      aiService.categorizeProduct(data),
    meta: {
      errorMessage: 'Error al categorizar el producto con IA',
    },
  });
};

/**
 * Hook para obtener sugerencias de categoría con cache
 * Útil para re-utilizar sugerencias de productos similares
 * 
 * @param productName - Nombre del producto
 * @param description - Descripción opcional del producto
 * @param enabled - Si la query debe ejecutarse automáticamente
 */
export const useCategorySuggestions = (
  productName: string,
  description?: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ['ai', 'categorize', productName, description],
    queryFn: () =>
      aiService.categorizeProduct({
        nombre: productName,
        descripcion: description,
      }),
    enabled: enabled && productName.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutos - las sugerencias no cambian frecuentemente
    gcTime: 1000 * 60 * 60, // 1 hora en cache
  });
};

// ==================== Categorización Masiva ====================

/**
 * Hook para categorizar múltiples productos en batch
 */
export const useBulkCategorize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCategorizeRequestDto) => aiService.bulkCategorize(data),
    onSuccess: () => {
      // Invalidar categorías para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    meta: {
      errorMessage: 'Error al categorizar productos en lote',
    },
  });
};

// ==================== Listas por Ocasión ====================

/**
 * Hook para obtener ocasiones disponibles
 */
export const useOccasions = () => {
  return useQuery({
    queryKey: ['occasions'],
    queryFn: () => aiService.getOccasions(),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (raramente cambian)
  });
};

/**
 * Hook para generar lista completa por ocasión
 */
export const useGenerateOccasionList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateOccasionListRequestDto) => 
      aiService.generateOccasionList(data),
    onSuccess: () => {
      // Invalidar listas para mostrar la nueva
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
    meta: {
      errorMessage: 'Error al generar lista por ocasión',
    },
  });
};

/**
 * Hook para previsualizar lista por ocasión sin crearla
 */
export const usePreviewOccasionList = () => {
  return useMutation({
    mutationFn: (data: PreviewOccasionListRequestDto) => 
      aiService.previewOccasionList(data),
    meta: {
      errorMessage: 'Error al previsualizar lista',
    },
  });
};

// ==================== Recomendaciones ====================

/**
 * Hook para obtener ejemplos de contexto (público)
 */
export const useContextExamples = () => {
  return useQuery({
    queryKey: ['context-examples'],
    queryFn: () => aiService.getContextExamples(),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
};

/**
 * Hook para obtener recomendaciones de una lista
 * @param listId - ID de la lista
 * @param params - Parámetros opcionales (contexto, limit)
 */
export const useRecommendations = (
  listId: string,
  params?: GetRecommendationsRequestDto,
  enabled = true
) => {
  return useQuery({
    queryKey: ['recommendations', listId, params],
    queryFn: () => aiService.getRecommendations(listId, params),
    enabled: enabled && !!listId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 10, // Auto-refetch cada 10 minutos
  });
};

/**
 * Hook para obtener recomendaciones de un producto específico
 * @param listId - ID de la lista
 * @param productId - ID del producto
 */
export const useProductRecommendations = (
  listId: string,
  productId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['product-recommendations', listId, productId],
    queryFn: () => aiService.getProductRecommendations(listId, productId),
    enabled: enabled && !!listId && !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
