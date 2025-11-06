'use client';

import { useMemo, useState } from 'react';
import { Heading, Text, Input } from '@/components/ui';
import { useList } from '@/features/lists/hooks/use-lists';
import { useParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useReorderProducts,
  useToggleProductPurchased,
  useUpdateProduct,
} from '@/features/products/hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { CreateProductDialog } from '@/features/products/components/create-product-dialog';
import { ProductsTable } from '@/features/products/components/products-table';
import { ProductFormValues } from '@/features/products/components/product-form';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 10;

export default function ListDetailPage() {
  const params = useParams();
  const { id } = params;
  const listId = id as string;
  const { data: list, isLoading, isError } = useList(listId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'purchased' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 400);

  const productsQuery = useProducts(listId, {
    search: debouncedSearch,
    status: statusFilter,
    categoryId: categoryFilter || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const categoriesQuery = useCategories({ activas: true });

  const categories = useMemo(
    () => categoriesQuery.data?.categorias ?? [],
    [categoriesQuery.data?.categorias]
  );
  const categoriesMap = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.nombre;
      return acc;
    }, {});
  }, [categories]);

  const createProductMutation = useCreateProduct(listId);
  const updateProductMutation = useUpdateProduct(listId);
  const deleteProductMutation = useDeleteProduct(listId);
  const toggleProductMutation = useToggleProductPurchased(listId);
  const reorderProductsMutation = useReorderProducts(listId);

  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const handleCreateProduct = async (values: ProductFormValues) => {
    await createProductMutation.mutateAsync(values);
  };

  const handleEditProduct = async (productId: string, values: ProductFormValues) => {
    setActiveProductId(productId);
    try {
      await updateProductMutation.mutateAsync({ productId, data: values });
    } finally {
      setActiveProductId(null);
    }
  };

  const handleAdjustQuantity = async (productId: string, quantity: number) => {
    setActiveProductId(productId);
    try {
      await updateProductMutation.mutateAsync({
        productId,
        data: { cantidad: quantity },
      });
    } finally {
      setActiveProductId(null);
    }
  };

  const handleTogglePurchased = async (productId: string, purchased: boolean) => {
    setActiveProductId(productId);
    try {
      await toggleProductMutation.mutateAsync({ productId, purchased });
    } finally {
      setActiveProductId(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setActiveProductId(productId);
    try {
      await deleteProductMutation.mutateAsync(productId);
    } finally {
      setActiveProductId(null);
    }
  };

  const handleReorderProducts = async (orderedIds: string[]) => {
    try {
      await reorderProductsMutation.mutateAsync(orderedIds);
    } finally {
      setActiveProductId(null);
    }
  };

  const products = productsQuery.data?.items ?? [];
  const resumen = productsQuery.data?.resumen;
  const totalPages = productsQuery.data?.totalPages ?? 0;

  const isLoadingProducts = productsQuery.isLoading || productsQuery.isFetching;
  const hasProductsError = productsQuery.isError;
  const isMutatingProduct =
    updateProductMutation.isPending ||
    deleteProductMutation.isPending ||
    toggleProductMutation.isPending;

  const resetPagination = () => {
    setPage(1);
  };

  return (
    <section className="p-4 md:p-6">
      {isLoading && <p>Cargando lista...</p>}
      {isError && <p>Error al cargar la lista.</p>}
      {list && (
        <header className="mb-6 space-y-2">
          <Heading level={1}>{list.nombre}</Heading>
          {list.descripcion && (
            <Text variant="muted">{list.descripcion}</Text>
          )}
        </header>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              resetPagination();
            }}
            className="w-64"
            aria-label="Buscar productos"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as typeof statusFilter);
              resetPagination();
            }}
            className="flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="purchased">Comprados</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              resetPagination();
            }}
            className="flex h-10 w-52 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>
        <CreateProductDialog
          categories={categories}
          onSubmit={handleCreateProduct}
          isSubmitting={createProductMutation.isPending}
        />
      </div>

      {resumen && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <Text variant="small" className="mb-1 uppercase tracking-wide">
              Productos comprados
            </Text>
            <Heading level={3}>{resumen.comprados}</Heading>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Text variant="small" className="mb-1 uppercase tracking-wide">
              Productos pendientes
            </Text>
            <Heading level={3}>{resumen.pendientes}</Heading>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Text variant="small" className="mb-1 uppercase tracking-wide">
              Urgentes
            </Text>
            <Heading level={3}>{resumen.urgentes}</Heading>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Text variant="small" className="mb-1 uppercase tracking-wide">
              Valor total estimado
            </Text>
            <Heading level={3}>
              {resumen.valorTotal !== undefined && resumen.valorTotal !== null
                ? `${resumen.valorTotal.toFixed(2)} €`
                : '-'}
            </Heading>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {isLoadingProducts && <p>Cargando productos...</p>}
        {hasProductsError && !isLoadingProducts && (
          <p>Error al cargar los productos de la lista.</p>
        )}
        {!isLoadingProducts && !hasProductsError && (
          <ProductsTable
            products={products}
            categories={categories}
            categoriesMap={categoriesMap}
            onTogglePurchased={handleTogglePurchased}
            onDelete={handleDeleteProduct}
            onEdit={handleEditProduct}
            onAdjustQuantity={handleAdjustQuantity}
            onReorder={handleReorderProducts}
            pendingProductId={activeProductId}
            isActionPending={isMutatingProduct}
            isReordering={reorderProductsMutation.isPending}
          />
        )}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (page === 1) return;
                  setPage((prev) => Math.max(prev - 1, 1));
                }}
                isDisabled={page === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(index + 1);
                  }}
                  isActive={page === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (page === totalPages) return;
                  setPage((prev) => Math.min(prev + 1, totalPages));
                }}
                isDisabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  );
}
