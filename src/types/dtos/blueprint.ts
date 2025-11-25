/**
 * DTOs para Blueprints (Plantillas de Listas)
 * Endpoint: /api/v1/blueprints
 */

export interface BlueprintProductDto {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad?: string;
  categoriaId?: string;
  categoriaNombre?: string;
}

export interface CreateBlueprintDto {
  nombre: string;
  descripcion?: string;
  productos: BlueprintProductDto[];
  esPublico?: boolean;
  etiquetas?: string[];
}

export interface BlueprintDto {
  id: string;
  nombre: string;
  descripcion?: string;
  productos: BlueprintProductDto[];
  esPublico: boolean;
  etiquetas: string[];
  propietarioId: string;
  propietarioEmail?: string;
  usosCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBlueprintDto {
  nombre?: string;
  descripcion?: string;
  productos?: BlueprintProductDto[];
  esPublico?: boolean;
  etiquetas?: string[];
}

export interface CreateListFromBlueprintDto {
  nombre?: string;
  descripcion?: string;
}

export interface CreateListFromBlueprintResponseDto {
  listaId: string;
  nombre: string;
  productosCreados: number;
}

export interface BlueprintFiltersDto {
  search?: string;
  esPublico?: boolean;
  etiqueta?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBlueprintsDto {
  items: BlueprintDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
