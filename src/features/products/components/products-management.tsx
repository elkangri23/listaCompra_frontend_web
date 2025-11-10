'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import type { ProductsTableProps } from '@/features/products/components/products-table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useToggleProductPurchased, useAdjustQuantity, useReorderProducts } from '@/features/products/hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useListSummary } from '@/features/lists/hooks/use-lists';
import { ProductFormValues } from '@/features/products/components/product-form';
import { Search, Filter, ArrowUpDown, X, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

const ProductsTable = dynamic<ProductsTableProps>(
  () => import('@/features/products/components/products-table').then((mod) => mod.ProductsTable),
  {
    loading: () => (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Cargando productos...
      </div>
    ),
  }
);

const CreateProductDialog = dynamic(
  () => import('@/features/products/components/create-product-dialog').then((mod) => mod.CreateProductDialog),
  {
    loading: () => null,
  }
);

const ProductSuggestions = dynamic(
  () => import('@/features/products/components/product-suggestions').then((mod) => mod.ProductSuggestions),
  {
    loading: () => null,
  }
);

interface ProductsManagementProps {
  listId: string;
}

export function ProductsManagement({ listId }: ProductsManagementProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'purchased'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'category' | 'status'>('name-asc');
  const [page, setPage] = useState(1);
  const [isReordering, setIsReordering] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useProducts(listId, {
    search: debouncedSearchTerm,
    categoryId: categoryFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 10,
  });

  const { data: categoriesData } = useCategories();
  const { data: listSummary } = useListSummary(listId);

  const createProductMutation = useCreateProduct(listId);
  const updateProductMutation = useUpdateProduct(listId);
  const deleteProductMutation = useDeleteProduct(listId);
  const togglePurchasedMutation = useToggleProductPurchased(listId);
  const adjustQuantityMutation = useAdjustQuantity(listId);
  const reorderProductsMutation = useReorderProducts(listId);

  const isActionPending = useMemo(() => {
    return (
      createProductMutation.isPending ||
      updateProductMutation.isPending ||
      deleteProductMutation.isPending ||
      togglePurchasedMutation.isPending ||
      adjustQuantityMutation.isPending ||
      reorderProductsMutation.isPending
    );
  }, [
    createProductMutation.isPending,
    updateProductMutation.isPending,
    deleteProductMutation.isPending,
    togglePurchasedMutation.isPending,
    adjustQuantityMutation.isPending,
    reorderProductsMutation.isPending,
  ]);

  const categoriesMap = useMemo(() => {
    return (categoriesData?.categorias || []).reduce((acc, category) => {
      acc[category.id] = category.nombre;
      return acc;
    }, {} as Record<string, string>);
  }, [categoriesData]);

  // Ordenar productos localmente
  const sortedProducts = useMemo(() => {
    if (!productsData?.items) return [];
    
    const products = [...productsData.items];
    
    switch (sortBy) {
      case 'name-asc':
        return products.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'name-desc':
        return products.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'date-asc':
        return products.sort((a, b) => new Date(a.fechaCreacion || 0).getTime() - new Date(b.fechaCreacion || 0).getTime());
      case 'date-desc':
        return products.sort((a, b) => new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime());
      case 'category':
        return products.sort((a, b) => {
          const catA = a.categoriaId ? categoriesMap[a.categoriaId] || '' : '';
          const catB = b.categoriaId ? categoriesMap[b.categoriaId] || '' : '';
          return catA.localeCompare(catB);
        });
      case 'status':
        return products.sort((a, b) => {
          if (a.comprado === b.comprado) return 0;
          return a.comprado ? 1 : -1; // Pendientes primero
        });
      default:
        return products;
    }
  }, [productsData?.items, sortBy, categoriesMap]);

  const handleCreateProduct = async (values: ProductFormValues) => {
    await createProductMutation.mutateAsync(values);
    refetchProducts();
  };

  const handleEditProduct = async (productId: string, values: ProductFormValues) => {
    await updateProductMutation.mutateAsync({ productId, data: values });
    refetchProducts();
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProductMutation.mutateAsync(productId);
    refetchProducts();
  };

  const handleTogglePurchased = async (productId: string, purchased: boolean) => {
    await togglePurchasedMutation.mutateAsync({ productId, purchased });
    refetchProducts();
  };

  const handleAdjustQuantity = async (productId: string, cantidad: number) => {
    await adjustQuantityMutation.mutateAsync({ productId, cantidad });
    refetchProducts();
  };

  const handleReorderProducts = async (orderedIds: string[]) => {
    await reorderProductsMutation.mutateAsync(orderedIds);
    refetchProducts();
  };

  const resetPagination = () => setPage(1);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('');
    setSortBy('name-asc');
    resetPagination();
  };

  useEffect(() => {
    resetPagination();
  }, [debouncedSearchTerm, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {listSummary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Productos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listSummary.totalProductos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Comprados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{listSummary.productosComprados}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{listSummary.productosPendientes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Valor Estimado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listSummary.valorTotalEstimado.toFixed(2)} €</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Productos</CardTitle>
              <CardDescription>Busca, filtra y ordena tus productos</CardDescription>
            </div>
            <CreateProductDialog
              categories={categoriesData?.categorias || []}
              onSubmit={handleCreateProduct}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              className="pl-9"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:flex-1">
              <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'purchased') => setStatusFilter(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="purchased">Comprados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {(categoriesData?.categorias || []).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                  <SelectItem value="date-desc">Más recientes</SelectItem>
                  <SelectItem value="date-asc">Más antiguos</SelectItem>
                  <SelectItem value="category">Por categoría</SelectItem>
                  <SelectItem value="status">Por estado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/lists/${listId}/history`)}
                title="Ver historial de compras"
              >
                <History className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={clearFilters} className="w-full md:w-auto">
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          </div>

          {/* Active Filters Badges */}
          {(searchTerm || statusFilter !== 'all' || categoryFilter || sortBy !== 'name-asc') && (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Filtros activos:</span>
              {searchTerm && <span className="rounded-md bg-muted px-2 py-1">Búsqueda: &quot;{searchTerm}&quot;</span>}
              {statusFilter !== 'all' && <span className="rounded-md bg-muted px-2 py-1">Estado: {statusFilter === 'pending' ? 'Pendientes' : 'Comprados'}</span>}
              {categoryFilter && <span className="rounded-md bg-muted px-2 py-1">Categoría: {categoriesMap[categoryFilter]}</span>}
              {sortBy !== 'name-asc' && <span className="rounded-md bg-muted px-2 py-1">Orden: {sortBy}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Suggestions */}
      <ProductSuggestions listId={listId} />

      {/* Products Table */}
      {isLoadingProducts ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Cargando productos...</p>
          </CardContent>
        </Card>
      ) : sortedProducts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No se encontraron productos con los filtros aplicados.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ProductsTable
            products={sortedProducts}
            categories={categoriesData?.categorias || []}
            categoriesMap={categoriesMap}
            onTogglePurchased={handleTogglePurchased}
            onDelete={handleDeleteProduct}
            onEdit={handleEditProduct}
            onAdjustQuantity={handleAdjustQuantity}
            onReorder={handleReorderProducts}
            isActionPending={isActionPending}
            isReordering={isReordering}
          />

          {productsData && productsData.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(1, page - 1))}
                    aria-disabled={page === 1}
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: productsData.totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    // Mostrar solo las páginas cercanas
                    return p === 1 || p === productsData.totalPages || Math.abs(p - page) <= 1;
                  })
                  .map((p, i, arr) => {
                    // Agregar ellipsis si hay saltos
                    const prev = arr[i - 1];
                    const items = [];
                    if (prev && p - prev > 1) {
                      items.push(
                        <PaginationItem key={`ellipsis-${p}`}>
                          <span className="px-4">...</span>
                        </PaginationItem>
                      );
                    }
                    items.push(
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => setPage(p)}
                          isActive={p === page}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                    return items;
                  })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(Math.min(productsData.totalPages, page + 1))}
                    aria-disabled={page === productsData.totalPages}
                    className={page === productsData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
