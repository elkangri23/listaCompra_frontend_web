import { useState, useEffect, useRef, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Trash2, GripVertical, Minus, Plus } from 'lucide-react';
import { ProductoListDto } from '@/types/dtos/products';
import { EditProductDialog } from './edit-product-dialog';
import { ProductFormValues } from './product-form';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface ProductsTableProps {
  products: ProductoListDto[];
  categories: Array<{ id: string; nombre: string }>;
  categoriesMap: Record<string, string>;
  onTogglePurchased: (productId: string, purchased: boolean) => Promise<void> | void;
  onDelete: (productId: string) => Promise<void> | void;
  onEdit: (productId: string, values: ProductFormValues) => Promise<void> | void;
  onAdjustQuantity: (productId: string, nextQuantity: number) => Promise<void> | void;
  onReorder: (orderedIds: string[]) => Promise<void> | void;
  pendingProductId?: string | null;
  isActionPending?: boolean;
  isReordering?: boolean;
}

interface ProductRowProps {
  product: ProductoListDto;
  categories: Array<{ id: string; nombre: string }>;
  categoryLabel: string;
  isProductPending: boolean;
  draggingId: string | null;
  isReordering: boolean;
  onTogglePurchased: (productId: string, purchased: boolean) => Promise<void> | void;
  onDelete: (productId: string) => Promise<void> | void;
  onEdit: (productId: string, values: ProductFormValues) => Promise<void> | void;
  onAdjustQuantity: (productId: string, nextQuantity: number) => Promise<void> | void;
  onDragStart: (productId: string) => () => void;
  onDragOver: (productId: string) => (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragEnd: () => Promise<void>;
}

function ProductRow({
  product,
  categories,
  categoryLabel,
  isProductPending,
  draggingId,
  isReordering,
  onTogglePurchased,
  onDelete,
  onEdit,
  onAdjustQuantity,
  onDragStart,
  onDragOver,
  onDragEnd,
}: ProductRowProps) {
  const [quantityInput, setQuantityInput] = useState(product.cantidad.toString());
  const debouncedQuantity = useDebounce(quantityInput, 500);

  useEffect(() => {
    setQuantityInput(product.cantidad.toString());
  }, [product.cantidad]);

  useEffect(() => {
    const newQuantity = parseInt(debouncedQuantity);
    if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity !== product.cantidad) {
      onAdjustQuantity(product.id, newQuantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuantity]);

  const handleDecrease = async () => {
    if (product.cantidad > 1) {
      await onAdjustQuantity(product.id, product.cantidad - 1);
    }
  };

  const handleIncrease = async () => {
    await onAdjustQuantity(product.id, product.cantidad + 1);
  };

  return (
    <TableRow
      key={product.id}
      draggable={!isReordering}
      data-testid={`product-row-${product.id}`}
      aria-grabbed={draggingId === product.id}
      onDragStart={onDragStart(product.id)}
      onDragOver={onDragOver(product.id)}
      onDragEnd={onDragEnd}
      className={cn(
        draggingId === product.id && 'opacity-60',
        isProductPending && 'opacity-50',
      )}
    >
      <TableCell>
        <div className="flex items-center justify-center">
          <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{product.nombre}</div>
          {product.descripcion && (
            <div className="text-xs text-muted-foreground">{product.descripcion}</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleDecrease}
            disabled={product.cantidad <= 1 || isProductPending}
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={isProductPending}
            min="1"
            aria-label="Cantidad del producto"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleIncrease}
            disabled={isProductPending}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {product.unidad && <span className="text-sm text-muted-foreground">{product.unidad}</span>}
        </div>
      </TableCell>
      <TableCell>
        {product.precio ? `${product.precio.toFixed(2)} €` : '—'}
      </TableCell>
      <TableCell>
        <Badge
          variant={product.comprado ? 'default' : 'secondary'}
          onClick={() => onTogglePurchased(product.id, !product.comprado)}
          className="cursor-pointer"
          aria-label={
            product.comprado ? 'Marcar como pendiente' : 'Marcar como comprado'
          }
        >
          {product.comprado ? 'Comprado' : 'Pendiente'}
        </Badge>
        {product.urgente && (
          <Badge variant="destructive" className="ml-1">
            Urgente
          </Badge>
        )}
      </TableCell>
      <TableCell>{categoryLabel}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <EditProductDialog
            defaultValues={product}
            categories={categories}
            onSubmit={(values) => onEdit(product.id, values)}
            isSubmitting={isProductPending}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product.id)}
            disabled={isProductPending}
            aria-label={`Eliminar ${product.nombre}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProductsTable({
  products,
  categories,
  categoriesMap,
  onTogglePurchased,
  onDelete,
  onEdit,
  onAdjustQuantity,
  onReorder,
  pendingProductId,
  isActionPending = false,
  isReordering = false,
}: ProductsTableProps) {
  const [orderedProducts, setOrderedProducts] = useState(products);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isDragging.current) {
      setOrderedProducts(products);
    }
  }, [products]);

  const handleDragStart = (productId: string) => () => {
    setDraggingId(productId);
    isDragging.current = true;
  };

  const handleDragOver = (productId: string) => (event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    if (!draggingId || draggingId === productId) {
      return;
    }

    setOrderedProducts((current) => {
      const currentIndex = current.findIndex((item) => item.id === draggingId);
      const targetIndex = current.findIndex((item) => item.id === productId);

      if (currentIndex === -1 || targetIndex === -1) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      setHasOrderChanged(true);
      return next;
    });
  };

  const handleDragEnd = async () => {
    if (hasOrderChanged) {
      await onReorder(orderedProducts.map((product) => product.id));
    }

    setDraggingId(null);
    setHasOrderChanged(false);
    isDragging.current = false;
  };

  const isPending = (productId: string) =>
    isActionPending && pendingProductId === productId;

  const tableRows = useMemo(() => orderedProducts, [orderedProducts]);

  if (tableRows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/40 p-8 text-center text-sm text-muted-foreground">
        Todavía no hay productos en esta lista.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12" aria-label="Reordenar productos" />
          <TableHead>Producto</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableRows.map((product) => {
          const categoryLabel = product.categoriaId
            ? categoriesMap[product.categoriaId] ?? 'Sin categoría'
            : 'Sin categoría';
          const isProductPending = isPending(product.id);

          return (
            <ProductRow
              key={product.id}
              product={product}
              categories={categories}
              categoryLabel={categoryLabel}
              isProductPending={isProductPending}
              draggingId={draggingId}
              isReordering={isReordering}
              onTogglePurchased={onTogglePurchased}
              onDelete={onDelete}
              onEdit={onEdit}
              onAdjustQuantity={onAdjustQuantity}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}
