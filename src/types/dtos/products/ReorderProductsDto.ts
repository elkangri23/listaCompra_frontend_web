/**
 * DTOs para el caso de uso ReorderProducts
 */

export interface ReorderProductsDto {
  /**
   * Orden final de los productos.
   * La posición comienza en 1 para mantener consistencia con el backend.
   */
  orden: Array<{
    /** ID del producto a reordenar */
    productoId: string;
    /** Nueva posición (1-indexada) */
    posicion: number;
  }>;
}

export interface ReorderProductsResponseDto {
  /** ID de la lista afectada */
  listaId: string;
  /**
   * Lista de productos confirmados por el backend con su nueva posición.
   */
  productos: Array<{
    id: string;
    posicion: number;
  }>;
  /** Mensaje informativo devuelto por el backend */
  mensaje: string;
}
