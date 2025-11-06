'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heading, Text, Button } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProducts, useCreateProduct } from '@/features/products/hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { ArrowLeft, Plus, Calendar, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const { data: productsData, isLoading } = useProducts(listId, {
    status: 'purchased',
    limit: 100,
  });

  const { data: categoriesData } = useCategories();
  const createProductMutation = useCreateProduct(listId);

  const categoriesMap = (categoriesData?.categorias || []).reduce((acc, category) => {
    acc[category.id] = category.nombre;
    return acc;
  }, {} as Record<string, string>);

  const handleAddAgain = async (product: any) => {
    setAddingProductId(product.id);
    try {
      await createProductMutation.mutateAsync({
        nombre: product.nombre,
        cantidad: product.cantidad,
        descripcion: product.descripcion,
        unidad: product.unidad,
        precio: product.precio,
        categoriaId: product.categoriaId,
        urgente: false,
      });
      toast.success(`"${product.nombre}" agregado nuevamente a la lista`);
    } catch (error) {
      toast.error('Error al agregar el producto');
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <section className="p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <Heading level={1}>Historial de Compras</Heading>
          <Text className="text-muted-foreground mt-1">
            Productos que has comprado anteriormente
          </Text>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Productos Comprados</CardTitle>
              <CardDescription>
                Vuelve a agregar productos que ya has comprado
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <Text className="text-muted-foreground">Cargando historial...</Text>
            </div>
          ) : !productsData?.items || productsData.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No hay productos en el historial</h3>
              <p className="text-sm text-muted-foreground">
                Los productos que marques como comprados aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Fecha de Compra</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.items.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.nombre}</div>
                          {product.descripcion && (
                            <div className="text-xs text-muted-foreground">
                              {product.descripcion}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.cantidad} {product.unidad || 'ud'}
                      </TableCell>
                      <TableCell>
                        {product.precio ? `${product.precio.toFixed(2)} €` : '—'}
                      </TableCell>
                      <TableCell>
                        {product.categoriaId ? (
                          <Badge variant="outline">
                            {categoriesMap[product.categoriaId] || 'Sin categoría'}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {product.fechaCompra
                            ? new Date(product.fechaCompra).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddAgain(product)}
                          disabled={addingProductId === product.id}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          {addingProductId === product.id ? 'Agregando...' : 'Agregar de nuevo'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => router.push(`/lists/${listId}`)}>
          Volver a la lista
        </Button>
      </div>
    </section>
  );
}
