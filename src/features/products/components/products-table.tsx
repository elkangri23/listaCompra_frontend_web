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

          const handleDecrease = async () => {
            if (product.cantidad > 1) {
              await onAdjustQuantity(product.id, product.cantidad - 1);
            }
          };

          const handleIncrease = async () => {
            await onAdjustQuantity(product.id, product.cantidad + 1);
          };

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
          }, [debouncedQuantity]);

          return (
            <TableRow
              key={product.id}
              draggable={!isReordering}
              data-testid={`product-row-${product.id}`}
              aria-grabbed={draggingId === product.id}
              onDragStart={handleDragStart(product.id)}
              onDragOver={handleDragOver(product.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                draggingId === product.id && 'opacity-60',
                isReordering && 'cursor-move'
              )}
            >
              <TableCell className="align-middle">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-dashed">
                  <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{product.nombre}</span>
                  {product.descripcion && (
                    <span className="text-xs text-muted-foreground">{product.descripcion}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleDecrease}
                    disabled={product.cantidad <= 1 || isProductPending}
                    aria-label={`Reducir cantidad de ${product.nombre}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    onBlur={() => {
                      const newQuantity = parseInt(quantityInput);
                      if (isNaN(newQuantity) || newQuantity <= 0) {
                        setQuantityInput(product.cantidad.toString()); // Revert to original if invalid
                      }
                    }}
                    className="w-16 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    disabled={isProductPending}
                    aria-label={`Cantidad de ${product.nombre}`}
                    min="1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleIncrease}
                    disabled={isProductPending}
                    aria-label={`Aumentar cantidad de ${product.nombre}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {product.unidad && (
                    <span className="text-xs uppercase text-muted-foreground">{product.unidad}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {product.precio !== undefined && product.precio !== null ? (
                  <span className="font-medium">{product.precio.toFixed(2)} €</span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={product.comprado}
                    onChange={async (event) =>
                      await onTogglePurchased(
                        product.id,
                        event.target.checked
                      )
                    }
                    disabled={isProductPending}
                    aria-label={`Marcar ${product.nombre} como ${product.comprado ? 'pendiente' : 'comprado'}`}
                    className="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  {product.comprado ? (
                    <Badge variant="success">Comprado</Badge>
                  ) : (
                    <Badge variant="secondary">Pendiente</Badge>
                  )}
                  {product.urgente && <Badge variant="warning">Urgente</Badge>}
                </label>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{categoryLabel}</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <EditProductDialog
                    categories={categories}
                    defaultValues={product}
                    onSubmit={(values) => onEdit(product.id, values)}
                    isSubmitting={isProductPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={async () => await onDelete(product.id)}
                    disabled={isProductPending}
                    aria-label={`Eliminar ${product.nombre}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
