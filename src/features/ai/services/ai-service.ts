/**
 * Servicio para funcionalidades de Inteligencia Artificial
 */

import { axiosInstance } from '@/lib/api/axios-instance';
import type {
  CategorizeProductRequestDto,
  CategorizeProductResponseDto,
} from '@/types/dtos/ai';

/**
 * Categoriza un producto usando IA
 * @param data - Datos del producto a categorizar
 * @returns Sugerencias de categorías con niveles de confianza
 */
export const categorizeProduct = async (
  data: CategorizeProductRequestDto
): Promise<CategorizeProductResponseDto> => {
  const response = await axiosInstance.post<CategorizeProductResponseDto>(
    '/ai/categorize',
    data
  );
  return response.data;
};

/**
 * Objeto con todas las funciones del servicio de IA
 */
export const aiService = {
  categorizeProduct,
};
