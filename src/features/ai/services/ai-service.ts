/**
 * Servicio para funcionalidades de Inteligencia Artificial
 */

import { axiosInstance } from '@/lib/api/axios-instance';
import type {
  CategorizeProductRequestDto,
  CategorizeProductResponseDto,
  BulkCategorizeRequestDto,
  BulkCategorizeResponseDto,
  GetOccasionsResponseDto,
  GenerateOccasionListRequestDto,
  GenerateOccasionListResponseDto,
  PreviewOccasionListRequestDto,
  PreviewOccasionListResponseDto,
  GetContextExamplesResponseDto,
  GetRecommendationsRequestDto,
  GetRecommendationsResponseDto,
  GetProductRecommendationsResponseDto,
} from '@/types/dtos/ai';

// ==================== Categorización Simple ====================

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

// ==================== Categorización Masiva ====================

/**
 * Categoriza múltiples productos en un solo request usando IA
 * @param data - Lista de productos a categorizar (máximo 50)
 * @returns Productos categorizados con estadísticas del batch
 */
export const bulkCategorize = async (
  data: BulkCategorizeRequestDto
): Promise<BulkCategorizeResponseDto> => {
  const response = await axiosInstance.post<BulkCategorizeResponseDto>(
    '/ai/bulk-categorize',
    data
  );
  return response.data;
};

// ==================== Listas por Ocasión ====================

/**
 * Obtiene la lista de ocasiones disponibles para generar listas
 * @returns Lista de ocasiones predefinidas (barbacoa, cena romántica, etc.)
 */
export const getOccasions = async (): Promise<GetOccasionsResponseDto> => {
  const response = await axiosInstance.get<GetOccasionsResponseDto>(
    '/occasion-lists/occasions'
  );
  return response.data;
};

/**
 * Genera una lista completa basada en una ocasión usando IA
 * @param data - Ocasión, número de personas y contexto adicional
 * @returns Lista creada con productos generados por IA
 */
export const generateOccasionList = async (
  data: GenerateOccasionListRequestDto
): Promise<GenerateOccasionListResponseDto> => {
  const response = await axiosInstance.post<GenerateOccasionListResponseDto>(
    '/occasion-lists/generate',
    data
  );
  return response.data;
};

/**
 * Previsualiza una lista por ocasión sin crearla en BD
 * @param data - Ocasión, número de personas y contexto adicional
 * @returns Preview de productos sin crear lista
 */
export const previewOccasionList = async (
  data: PreviewOccasionListRequestDto
): Promise<PreviewOccasionListResponseDto> => {
  const response = await axiosInstance.post<PreviewOccasionListResponseDto>(
    '/occasion-lists/preview',
    data
  );
  return response.data;
};

// ==================== Recomendaciones ====================

/**
 * Obtiene ejemplos de contexto para recomendaciones (público)
 * @returns Ejemplos de cómo usar el contexto
 */
export const getContextExamples = async (): Promise<GetContextExamplesResponseDto> => {
  const response = await axiosInstance.get<GetContextExamplesResponseDto>(
    '/recommendations/context-examples'
  );
  return response.data;
};

/**
 * Obtiene recomendaciones de productos para una lista
 * @param listId - ID de la lista
 * @param params - Parámetros opcionales (contexto, limit)
 * @returns Recomendaciones basadas en productos existentes
 */
export const getRecommendations = async (
  listId: string,
  params?: GetRecommendationsRequestDto
): Promise<GetRecommendationsResponseDto> => {
  const response = await axiosInstance.get<GetRecommendationsResponseDto>(
    `/recommendations/${listId}`,
    { params }
  );
  return response.data;
};

/**
 * Obtiene recomendaciones específicas para un producto
 * @param listId - ID de la lista
 * @param productId - ID del producto
 * @returns Recomendaciones relacionadas con el producto
 */
export const getProductRecommendations = async (
  listId: string,
  productId: string
): Promise<GetProductRecommendationsResponseDto> => {
  const response = await axiosInstance.get<GetProductRecommendationsResponseDto>(
    `/recommendations/${listId}/for-product/${productId}`
  );
  return response.data;
};

/**
 * Objeto con todas las funciones del servicio de IA
 */
export const aiService = {
  categorizeProduct,
  bulkCategorize,
  getOccasions,
  generateOccasionList,
  previewOccasionList,
  getContextExamples,
  getRecommendations,
  getProductRecommendations,
};
