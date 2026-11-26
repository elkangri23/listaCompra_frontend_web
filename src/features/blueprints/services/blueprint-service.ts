import { axiosInstance } from '@/lib/api/axios-instance';
import type {
  BlueprintDto,
  CreateBlueprintDto,
  UpdateBlueprintDto,
  CreateListFromBlueprintDto,
  CreateListFromBlueprintResponseDto,
  BlueprintFiltersDto,
  PaginatedBlueprintsDto,
  BlueprintSearchResponseDto,
} from '@/types/dtos/blueprint';

/**
 * Buscar plantillas por nombre o descripción (GET /blueprints/buscar).
 * A diferencia del filtro `search` de la lista, busca en nombre Y
 * descripción, en las plantillas propias Y en las públicas a la vez.
 * El backend responde con campos en español (`blueprints`, `pagina`...):
 * se mapean al DTO del frontend.
 */
interface BackendBlueprintSearchResponse {
  blueprints: {
    id: string;
    nombre: string;
    descripcion?: string;
    publico: boolean;
    productosCount: number;
    fechaCreacion: string;
    fechaActualizacion: string;
    creadoPorId: string;
  }[];
  termino: string;
  pagina: number;
  limite: number;
  total: number;
  totalPages: number;
}

const searchBlueprints = async (
  termino: string,
  page = 1,
  limit = 20,
): Promise<BlueprintSearchResponseDto> => {
  const response = await axiosInstance.get<BackendBlueprintSearchResponse>(
    `/blueprints/buscar?q=${encodeURIComponent(termino)}&pagina=${page}&limite=${limit}`,
  );
  const data = response.data;
  return {
    results: data.blueprints.map(b => ({
      id: b.id,
      nombre: b.nombre,
      descripcion: b.descripcion,
      esPublico: b.publico,
      productosCount: b.productosCount,
      fechaCreacion: b.fechaCreacion,
      creadoPorId: b.creadoPorId,
    })),
    termino: data.termino,
    total: data.total,
    page: data.pagina,
    limit: data.limite,
    totalPages: data.totalPages,
  };
};

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
/**
 * Respuesta real del backend (POST /blueprints/:id/crear-lista):
 * { lista: { id, nombre }, productos, blueprint, resumen: { productosCreados } }
 * Se mapea al DTO del frontend { listaId, nombre, productosCreados }.
 */
interface BackendCreateListResponse {
  lista: { id: string; nombre: string };
  resumen: { productosCreados: number };
}

const createListFromBlueprint = async (
  blueprintId: string,
  data?: CreateListFromBlueprintDto
): Promise<CreateListFromBlueprintResponseDto> => {
  // El backend exige nombreLista (y acepta descripcionLista)
  const body: Record<string, unknown> = {};
  if (data?.nombre) body.nombreLista = data.nombre;
  if (data?.descripcion) body.descripcionLista = data.descripcion;
  const response = await axiosInstance.post<BackendCreateListResponse>(
    `/blueprints/${blueprintId}/crear-lista`,
    body
  );
  return {
    listaId: response.data.lista.id,
    nombre: response.data.lista.nombre,
    productosCreados: response.data.resumen.productosCreados,
  };
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
  searchBlueprints,
};
