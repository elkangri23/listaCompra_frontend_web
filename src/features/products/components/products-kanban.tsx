'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductoListDto } from '@/types/dtos/products';
import type { CategoryResponseDto } from '@/types/dtos/categories';

interface ProductsKanbanProps {
  products: ProductoListDto[];
  categories: CategoryResponseDto[];
  onMoveProduct: (productId: string, newCategoryId: string | null) => Promise<void>;
  isMoving?: boolean;
}

export function ProductsKanban({
  products,
  categories,
  onMoveProduct,
  isMoving = false,
}: ProductsKanbanProps) {
  const [draggingProductId, setDraggingProductId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);

  // Agrupar productos por categoría
  const productsByCategory = products.reduce((acc, product) => {
    const categoryId = product.categoriaId || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(product);
    return acc;
  }, {} as Record<string, ProductoListDto[]>);

  // Crear columnas: sin categoría + categorías existentes
  const columns = [
    {
      id: 'uncategorized',
      nombre: 'Sin Categoría',
      products: productsByCategory['uncategorized'] || [],
      isSpecial: true,
    },
    ...categories
      .filter(c => c.activa)
      .map(category => ({
        id: category.id,
        nombre: category.nombre,
        products: productsByCategory[category.id] || [],
        isSpecial: false,
      })),
  ];

  const handleDragStart = (productId: string) => (e: React.DragEvent) => {
    setDraggingProductId(productId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', productId);
  };

  const handleDragOver = (categoryId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategoryId(categoryId);
  };

  const handleDragLeave = () => {
    setDragOverCategoryId(null);
  };

  const handleDrop = (categoryId: string) => async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCategoryId(null);

    if (!draggingProductId) return;

    const product = products.find(p => p.id === draggingProductId);
    if (!product) return;

    // Si ya está en esa categoría, no hacer nada
    const currentCategoryId = product.categoriaId || 'uncategorized';
    if (currentCategoryId === categoryId) return;

    const newCategoryId = categoryId === 'uncategorized' ? null : categoryId;

    try {
      await onMoveProduct(draggingProductId, newCategoryId);
    } finally {
      setDraggingProductId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggingProductId(null);
    setDragOverCategoryId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-72"
          onDragOver={handleDragOver(column.id)}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop(column.id)}
        >
          <Card
            className={cn(
              'transition-all',
              dragOverCategoryId === column.id && 'ring-2 ring-primary ring-offset-2',
              column.isSpecial && 'border-dashed'
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {column.isSpecial && <Package className="h-4 w-4 text-muted-foreground" />}
                  {column.nombre}
                </CardTitle>
                <Badge variant={column.isSpecial ? 'outline' : 'secondary'}>
                  {column.products.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 min-h-[200px]">
              {column.products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">
                    {column.isSpecial
                      ? 'Arrastra productos aquí para quitar su categoría'
                      : 'Arrastra productos aquí para categorizarlos'}
                  </p>
                </div>
              ) : (
                column.products.map((product) => (
                  <div
                    key={product.id}
                    draggable={!isMoving}
                    onDragStart={handleDragStart(product.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'p-3 border rounded-lg cursor-move transition-all',
                      'hover:shadow-md hover:border-primary',
                      draggingProductId === product.id && 'opacity-50 rotate-2',
                      isMoving && 'cursor-not-allowed opacity-60'
                    )}
                    aria-grabbed={draggingProductId === product.id}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{product.nombre}</div>
                        {product.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {product.descripcion}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={product.comprado ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {product.comprado ? '✓ Comprado' : 'Pendiente'}
                          </Badge>
                          {product.urgente && (
                            <Badge variant="destructive" className="text-xs">
                              Urgente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
