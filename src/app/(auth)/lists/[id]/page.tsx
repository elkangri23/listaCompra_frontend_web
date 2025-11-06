'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heading, Text, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { useList } from '@/features/lists/hooks/use-lists';
import { useParams } from 'next/navigation';
import { InviteUserDialog } from '@/features/invitations/components/invite-user-dialog';
import { useInviteUser } from '@/features/invitations/hooks/use-invitations';
import { InviteUserFormValues } from '@/features/invitations/components/invite-user-form';
import { ProductsTable } from '@/features/products/components/products-table';
import { useProducts } from '@/features/products/hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { CreateProductDialog } from '@/features/products/components/create-product-dialog';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { ProductFormValues } from '@/features/products/components/product-form';
import { PlusCircle, Search, Filter, ListFilter, GripVertical } from 'lucide-react';

export default function ListDetailPage() {
  const params = useParams();
  const listId = params.id as string;

  const { data: list, isLoading: isLoadingList, isError: isErrorList } = useList(listId);
  const inviteUserMutation = useInviteUser(listId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'purchased'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isReordering, setIsReordering] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    refetch: refetchProducts,
  } = useProducts(listId, {
    search: debouncedSearchTerm,
    category: categoryFilter,
    status: statusFilter,
    page,
  });

  const createProductMutation = useCreateProduct(listId);
  const togglePurchasedMutation = useToggleProductPurchased(listId);
  const deleteProductMutation = useDeleteProduct(listId);
  const editProductMutation = useUpdateProduct(listId);
  const adjustQuantityMutation = useAdjustQuantity(listId);
  const reorderProductsMutation = useReorderProducts(listId);

  const isActionPending = useMemo(() => {
    return (
      createProductMutation.isPending ||
      togglePurchasedMutation.isPending ||
      deleteProductMutation.isPending ||
      editProductMutation.isPending ||
      adjustQuantityMutation.isPending ||
      reorderProductsMutation.isPending
    );
  }, [
    createProductMutation.isPending,
    togglePurchasedMutation.isPending,
    deleteProductMutation.isPending,
    editProductMutation.isPending,
    adjustQuantityMutation.isPending,
    reorderProductsMutation.isPending,
  ]);

  const pendingProductId = useMemo(() => {
    if (createProductMutation.isPending) return 'new'; // Special ID for new product creation
    if (togglePurchasedMutation.isPending) return togglePurchasedMutation.variables?.productId;
    if (deleteProductMutation.isPending) return deleteProductMutation.variables;
    if (editProductMutation.isPending) return editProductMutation.variables?.productId;
    if (adjustQuantityMutation.isPending) return adjustQuantityMutation.variables?.productId;
    // reorderProductsMutation doesn't have a single pending product ID
    return null;
  }, [
    createProductMutation.isPending,
    togglePurchasedMutation.isPending,
    deleteProductMutation.isPending,
    editProductMutation.isPending,
    adjustQuantityMutation.isPending,
    togglePurchasedMutation.variables?.productId,
    deleteProductMutation.variables,
    editProductMutation.variables?.productId,
    adjustQuantityMutation.variables?.productId,
  ]);

  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const { data: listSummary, isLoading: isLoadingListSummary } = useListSummary(listId);

  const categoriesMap = useMemo(() => {
    return (categoriesData?.data || []).reduce((acc, category) => {
      acc[category.id] = category.nombre;
      return acc;
    }, {} as Record<string, string>);
  }, [categoriesData]);

  const handleInviteUser = (data: InviteUserFormValues) => {
    inviteUserMutation.mutate(data);
  };

  const handleCreateProduct = async (values: ProductFormValues) => {
    await createProductMutation.mutateAsync({ listId, ...values });
    refetchProducts();
  };

  const handleTogglePurchased = async (productId: string, purchased: boolean) => {
    await togglePurchasedMutation.mutateAsync({ listId, productId, purchased });
    refetchProducts();
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProductMutation.mutateAsync({ listId, productId });
    refetchProducts();
  };

  const handleEditProduct = async (productId: string, values: ProductFormValues) => {
    await editProductMutation.mutateAsync({ listId, productId, ...values });
    refetchProducts();
  };

  const handleAdjustQuantity = async (productId: string, nextQuantity: number) => {
    await adjustQuantityMutation.mutateAsync({ listId, productId, cantidad: nextQuantity });
    refetchProducts();
  };

  const handleReorderProducts = async (orderedIds: string[]) => {
    await reorderProductsMutation.mutateAsync({ listId, orderedProductIds: orderedIds });
    refetchProducts();
  };

  const resetPagination = () => setPage(1);

  useEffect(() => {
    resetPagination();
  }, [searchTerm, statusFilter, categoryFilter]);

  if (isLoadingList || isLoadingProducts || isLoadingCategories || isLoadingListSummary) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text>Cargando lista...</Text>
      </div>
    );
  }

  if (isErrorList || isErrorProducts) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <Text className="text-destructive">Error al cargar la lista o los productos.</Text>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text>Lista no encontrada.</Text>
      </div>
    );
  }

  return (
    <section className="p-4 md:p-6">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Heading level={1}>{list.nombre}</Heading>
          <Text className="text-muted-foreground">{list.descripcion}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsReordering((prev) => !prev)}
            aria-pressed={isReordering}
            className="flex items-center gap-2"
          >
            <GripVertical className="h-4 w-4" />
            {isReordering ? 'Finalizar reordenamiento' : 'Reordenar productos'}
          </Button>
          <InviteUserDialog
            onSubmit={handleInviteUser}
          />
          <CreateProductDialog
            listId={listId}
            categories={categoriesData?.data || []}
            onSubmit={handleCreateProduct}
          />
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {listSummary && (
          <>
            <ListSummaryCard title="Total Productos" value={listSummary.totalProductos} />
            <ListSummaryCard title="Comprados" value={listSummary.productosComprados} />
            <ListSummaryCard title="Pendientes" value={listSummary.productosPendientes} />
            <ListSummaryCard title="Valor Estimado" value={`${listSummary.valorTotalEstimado.toFixed(2)} €`} />
          </>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'purchased') => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="purchased">Comprados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {(categoriesData?.data || []).map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setCategoryFilter('');
          }}>
            Limpiar filtros
          </Button>
        </div>
      </div>

      <ProductsTable
        products={productsData?.data || []}
        categories={categoriesData?.data || []}
        categoriesMap={categoriesMap}
        onTogglePurchased={handleTogglePurchased}
        onDelete={handleDeleteProduct}
        onEdit={handleEditProduct}
        onAdjustQuantity={handleAdjustQuantity}
        onReorder={handleReorderProducts}
        pendingProductId={pendingProductId}
        isActionPending={isActionPending}
        isReordering={isReordering}
      />

      <Pagination
        currentPage={page}
        totalPages={productsData?.totalPages || 1}
        onPageChange={setPage}
        className="mt-4"
      />
    </section>
  );
}
