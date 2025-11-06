/**
 * DTOs para categorización de productos con IA
 */

/**
 * Request para categorizar un producto
 */
export interface CategorizeProductRequestDto {
  /**
   * Nombre del producto a categorizar
   */
  nombre: string;

  /**
   * Descripción opcional del producto para mejor contexto
   */
  descripcion?: string;
}

/**
 * Sugerencia de categoría generada por IA
 */
export interface CategorySuggestionDto {
  /**
   * ID de la categoría sugerida
   */
  categoriaId: string;

  /**
   * Nombre de la categoría
   */
  nombre: string;

  /**
   * Nivel de confianza de la sugerencia (0-1)
   */
  confianza: number;

  /**
   * Razón de la sugerencia (opcional)
   */
  razon?: string;
}

/**
 * Response del endpoint de categorización
 */
export interface CategorizeProductResponseDto {
  /**
   * Lista de sugerencias de categorías ordenadas por confianza
   */
  sugerencias: CategorySuggestionDto[];

  /**
   * Categoría recomendada (la de mayor confianza)
   */
  categoriaRecomendada: CategorySuggestionDto | null;

  /**
   * Tiempo de procesamiento en milisegundos
   */
  tiempoProcesamiento?: number;
}
