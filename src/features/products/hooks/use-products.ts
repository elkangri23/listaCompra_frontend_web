import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/product-service';
import {
  AddProductDto,
  GetProductsDto,
  ProductoListDto,
  UpdateProductDto,
} from '@/types/dtos/products';
import { ProductFormValues } from '../components/product-form';

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  status?: 'all' | 'purchased' | 'pending';
  page?: number;
  limit?: number;
};

const sanitizeString = (value?: string | null) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const mapToCreateDto = (
  data: ProductFormValues
): Omit<AddProductDto, 'listaId'> => ({
  nombre: data.nombre,
  descripcion: sanitizeString(data.descripcion),
  cantidad: data.cantidad,
  unidad: sanitizeString(data.unidad),
  precio:
    typeof data.precio === 'number' && !Number.isNaN(data.precio)
      ? data.precio
      : undefined,
  urgente: data.urgente,
  categoriaId: sanitizeString(data.categoriaId),
});

const mapToUpdateDto = (
  data: Partial<ProductFormValues>
): UpdateProductDto => {
  const dto: UpdateProductDto = {};

  if (data.nombre !== undefined) {
    dto.nombre = sanitizeString(data.nombre);
  }

  if (data.descripcion !== undefined) {
    dto.descripcion = sanitizeString(data.descripcion);
  }

  if (data.cantidad !== undefined) {
    dto.cantidad = data.cantidad;
  }

  if (data.unidad !== undefined) {
    dto.unidad = sanitizeString(data.unidad);
  }

  if (data.precio !== undefined) {
    dto.precio =
      typeof data.precio === 'number' && !Number.isNaN(data.precio)
        ? data.precio
        : undefined;
  }

  if (data.urgente !== undefined) {
    dto.urgente = data.urgente;
  }

  if (data.categoriaId !== undefined) {
    dto.categoriaId = sanitizeString(data.categoriaId);
  }

  return dto;
};

const mapFiltersToDto = (
  listId: string,
  filters: ProductFilters
): GetProductsDto => {
  return {
    listaId: listId,
    busqueda: filters.search,
    categoriaId: filters.categoryId,
    comprado:
      filters.status === 'purchased'
        ? true
        : filters.status === 'pending'
        ? false
        : undefined,
    page: filters.page,
    limit: filters.limit,
  };
};

export const useProducts = (listId: string, filters: ProductFilters) => {
  return useQuery({
    queryKey: ['lists', listId, 'products', filters],
    queryFn: () => productService.getProducts(mapFiltersToDto(listId, filters)),
    enabled: Boolean(listId),
  });
};

export const useCreateProduct = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormValues) =>
      productService.createProduct(listId, mapToCreateDto(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'products'] });
    },
  });
};

export const useUpdateProduct = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Partial<ProductFormValues> }) =>
      productService.updateProduct(listId, productId, mapToUpdateDto(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'products'] });
    },
  });
};

export const useDeleteProduct = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productService.deleteProduct(listId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'products'] });
    },
  });
};

export const useToggleProductPurchased = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    // TEMPORAL: Desactivada llamada a API para evitar rate limiting
    // Solo actualiza estado local (UI) sin persistir en backend
    mutationFn: async ({
      productId,
      purchased,
    }: {
      productId: string;
      purchased: boolean;
    }) => {
      // Simulamos éxito sin llamar a la API
      return Promise.resolve({ id: productId, comprado: purchased });
      // COMENTADO: productService.togglePurchased(listId, productId, { comprado: purchased })
    },
    // Optimistic update for instant UI feedback (solo frontend)
    onMutate: async ({ productId, purchased }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['lists', listId, 'products'],
        exact: false 
      });
      
      // Snapshot all matching queries
      const previousQueries: any[] = [];
      queryClient.getQueriesData({ queryKey: ['lists', listId, 'products'] })
        .forEach(([key, data]) => {
          previousQueries.push({ key, data });
        });
      
      // Optimistically update all matching queries
      queryClient.setQueriesData(
        { queryKey: ['lists', listId, 'products'] },
        (old: any) => {
          if (!old) return old;
          
          // Handle nested structure
          const items = old?.data?.items || old?.items || [];
          const updatedItems = items.map((product: any) =>
            product.id === productId ? { ...product, comprado: purchased } : product
          );
          
          if (old?.data?.items) {
            return { ...old, data: { ...old.data, items: updatedItems } };
          }
          return { ...old, items: updatedItems };
        }
      );
      
      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ key, data }: any) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    // Don't invalidate on success - optimistic update is enough
    // This prevents excessive refetches that trigger rate limiting
    onSuccess: () => {
      // Silently succeed - optimistic update already applied
    },
  });
};

export const useAdjustQuantity = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, cantidad }: { productId: string; cantidad: number }) =>
      productService.updateProduct(listId, productId, { cantidad }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'products'] });
    },
  });
};

export const useReorderProducts = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      productService.reorderProducts(listId, {
        orden: orderedIds.map((productoId, index) => ({
          productoId,
          posicion: index + 1,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'products'] });
    },
  });
};

export const mapProductToFormValues = (
  product: ProductoListDto
): ProductFormValues => ({
  nombre: product.nombre,
  descripcion: product.descripcion,
  cantidad: product.cantidad,
  unidad: product.unidad,
  precio: product.precio,
  urgente: product.urgente,
  categoriaId: product.categoriaId,
});
