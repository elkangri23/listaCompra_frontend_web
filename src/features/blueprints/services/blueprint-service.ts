import { axiosInstance } from '@/lib/api/axios-instance';
import type {
  BlueprintDto,
  CreateBlueprintDto,
  UpdateBlueprintDto,
  CreateListFromBlueprintDto,
  CreateListFromBlueprintResponseDto,
  BlueprintFiltersDto,
  PaginatedBlueprintsDto,
} from '@/types/dtos/blueprint';

/**
 * Obtener todos los blueprints del usuario (con filtros opcionales)
 */
const getBlueprints = async (filters?: BlueprintFiltersDto): Promise<PaginatedBlueprintsDto> => {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.esPublico !== undefined) params.append('esPublico', String(filters.esPublico));
  if (filters?.etiqueta) params.append('etiqueta', filters.etiqueta);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const response = await axiosInstance.get<PaginatedBlueprintsDto>(
    `/blueprints?${params.toString()}`
  );
  return response.data;
};

/**
 * Obtener un blueprint por ID
 */
const getBlueprintById = async (id: string): Promise<BlueprintDto> => {
  const response = await axiosInstance.get<BlueprintDto>(`/blueprints/${id}`);
  return response.data;
};

/**
 * Crear un nuevo blueprint
 */
const createBlueprint = async (data: CreateBlueprintDto): Promise<BlueprintDto> => {
  const response = await axiosInstance.post<BlueprintDto>('/blueprints', data);
  return response.data;
};

/**
 * Actualizar un blueprint existente
 */
const updateBlueprint = async (id: string, data: UpdateBlueprintDto): Promise<BlueprintDto> => {
  const response = await axiosInstance.put<BlueprintDto>(`/blueprints/${id}`, data);
  return response.data;
};

/**
 * Eliminar un blueprint
 */
const deleteBlueprint = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/blueprints/${id}`);
};

/**
 * Crear una lista desde un blueprint
 */
const createListFromBlueprint = async (
  blueprintId: string,
  data?: CreateListFromBlueprintDto
): Promise<CreateListFromBlueprintResponseDto> => {
  const response = await axiosInstance.post<CreateListFromBlueprintResponseDto>(
    `/blueprints/${blueprintId}/create-list`,
    data || {}
  );
  return response.data;
};

/**
 * Crear un blueprint desde una lista existente
 */
const createBlueprintFromList = async (
  listId: string,
  blueprintData: Omit<CreateBlueprintDto, 'productos'>
): Promise<BlueprintDto> => {
  // Primero obtenemos los productos de la lista
  const productsResponse = await axiosInstance.get(`/lists/${listId}/products?limit=500`);
  const products = productsResponse.data.data?.items || productsResponse.data.items || [];

  // Transformamos los productos al formato blueprint
  const blueprintProducts = products.map((p: any) => ({
    nombre: p.nombre,
    descripcion: p.descripcion,
    cantidad: p.cantidad || 1,
    unidad: p.unidad,
    categoriaId: p.categoriaId,
    categoriaNombre: p.categoria?.nombre,
  }));

  // Creamos el blueprint con los productos
  return createBlueprint({
    ...blueprintData,
    productos: blueprintProducts,
  });
};

export const blueprintService = {
  getBlueprints,
  getBlueprintById,
  createBlueprint,
  updateBlueprint,
  deleteBlueprint,
  createListFromBlueprint,
  createBlueprintFromList,
};
