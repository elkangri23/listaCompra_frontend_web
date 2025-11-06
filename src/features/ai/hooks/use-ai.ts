/**
 * Hooks de React Query para funcionalidades de IA
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../services/ai-service';
import type { CategorizeProductRequestDto } from '@/types/dtos/ai';

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
