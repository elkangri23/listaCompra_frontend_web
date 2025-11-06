'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts, useCreateProduct } from '@/features/products/hooks/use-products';
import { Plus, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface ProductSuggestionsProps {
  listId: string;
}

/**
 * Componente que muestra sugerencias de productos basadas en compras frecuentes
 * Analiza el historial de compras y sugiere productos que el usuario compra regularmente
 */
export function ProductSuggestions({ listId }: ProductSuggestionsProps) {
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Obtener historial de productos comprados (últimos 100)
  const { data: purchasedData, isLoading } = useProducts(listId, {
    status: 'purchased',
    limit: 100,
  });

  // Obtener productos actuales de la lista
  const { data: currentData } = useProducts(listId, {
    status: 'pending',
    limit: 100,
  });

  const createProductMutation = useCreateProduct(listId);

  // Analizar productos comprados y crear sugerencias
  const suggestions = (() => {
    if (!purchasedData?.items) return [];

    // Contar frecuencia de cada producto
    const productFrequency = new Map<string, {
      nombre: string;
      categoriaId: string | undefined;
      descripcion: string | undefined;
      precio: number | undefined;
      count: number;
    }>();

    purchasedData.items.forEach((product) => {
      const key = product.nombre.toLowerCase();
      const existing = productFrequency.get(key);
      
      if (existing) {
        existing.count += 1;
      } else {
        productFrequency.set(key, {
          nombre: product.nombre,
          categoriaId: product.categoriaId,
          descripcion: product.descripcion,
          precio: product.precio,
          count: 1,
        });
      }
    });

    // Filtrar productos que ya están en la lista actual
    const currentProductNames = new Set(
      (currentData?.items || []).map(p => p.nombre.toLowerCase())
    );

    // Convertir a array, filtrar y ordenar por frecuencia
    return Array.from(productFrequency.entries())
      .filter(([key]) => !currentProductNames.has(key))
      .filter(([, data]) => data.count >= 2) // Solo sugerir productos comprados 2+ veces
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6) // Máximo 6 sugerencias
      .map(([, data]) => data);
  })();

  const handleAddProduct = async (suggestion: typeof suggestions[0]) => {
    setAddingProductId(suggestion.nombre);

    try {
      await createProductMutation.mutateAsync({
        nombre: suggestion.nombre,
        categoriaId: suggestion.categoriaId || undefined,
        descripcion: suggestion.descripcion || undefined,
        cantidad: 1,
        precio: suggestion.precio || undefined,
        urgente: false,
      });

      toast.success(`"${suggestion.nombre}" agregado a la lista`);
    } catch (error) {
      toast.error('Error al agregar el producto');
      console.error('Error adding suggested product:', error);
    } finally {
      setAddingProductId(null);
    }
  };

  // No mostrar si no hay sugerencias o está cargando
  if (isLoading || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Sugerencias de productos</CardTitle>
        </div>
        <CardDescription>
          Basado en tus compras frecuentes, estos productos podrían interesarte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.nombre} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{suggestion.nombre}</h4>
                    {suggestion.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {suggestion.descripcion}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {suggestion.count}x comprado
                      </Badge>
                      {suggestion.precio && (
                        <span className="text-sm text-muted-foreground">
                          ${suggestion.precio.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAddProduct(suggestion)}
                    disabled={addingProductId === suggestion.nombre}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
