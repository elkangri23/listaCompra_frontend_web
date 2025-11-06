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
    mutationFn: ({
      productId,
      purchased,
    }: {
      productId: string;
      purchased: boolean;
    }) => productService.togglePurchased(listId, productId, { comprado: purchased }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'products'] });
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
