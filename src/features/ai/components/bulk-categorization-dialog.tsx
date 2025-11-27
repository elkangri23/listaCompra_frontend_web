'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useBulkCategorize } from '@/features/ai/hooks/use-ai';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { toast } from 'sonner';
import type { ProductoListDto } from '@/types/dtos/products';
import type { CategorizedProduct } from '@/types/dtos/ai';

interface BulkCategorizationDialogProps {
  listId: string;
  products: ProductoListDto[];
  onApply: (categorizations: Map<string, string>) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BulkCategorizationDialog({
  listId,
  products,
  onApply,
  open: controlledOpen,
  onOpenChange,
}: BulkCategorizationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [categorizedResults, setCategorizedResults] = useState<CategorizedProduct[]>([]);
  const [categoryOverrides, setCategoryOverrides] = useState<Map<string, string>>(new Map());
  const [showPreview, setShowPreview] = useState(false);

  const bulkCategorize = useBulkCategorize();
  const { data: categoriesData } = useCategories();

  // Filtrar productos sin categoría o con categoría incierta
  const uncategorizedProducts = products.filter(p => !p.categoriaId);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(uncategorizedProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelection = new Set(selectedProducts);
    if (checked) {
      newSelection.add(productId);
    } else {
      newSelection.delete(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleCategorize = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Selecciona al menos un producto');
      return;
    }

    if (selectedProducts.size > 50) {
      toast.error('Máximo 50 productos por lote');
      return;
    }

    const productsToCateg = products
      .filter(p => selectedProducts.has(p.id))
      .map(p => ({
        nombre: p.nombre,
        descripcion: p.descripcion,
      }));

    try {
      const result = await bulkCategorize.mutateAsync({
        products: productsToCateg,
        enrichWithExistingCategories: true,
      });

      setCategorizedResults(result.data.categorizedProducts);
      setShowPreview(true);

      toast.success(
        `${result.data.batchStats.successful} productos categorizados (${result.data.batchStats.averageConfidence.toFixed(0)}% confianza promedio)`
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al categorizar productos');
    }
  };

  const handleApplyCategories = async () => {
    const categorizations = new Map<string, string>();

    categorizedResults.forEach((result, index) => {
      const product = products.find(p => p.nombre === result.nombre);
      if (product) {
        const overrideCategory = categoryOverrides.get(product.id);
        const categoryName = overrideCategory || result.suggestedCategory.nombre;
        
        // Buscar ID de categoría por nombre
        const category = categoriesData?.categorias?.find(c => c.nombre === categoryName);
        if (category) {
          categorizations.set(product.id, category.id);
        }
      }
    });

    try {
      await onApply(categorizations);
      toast.success(`${categorizations.size} productos categorizados exitosamente`);
      setOpen(false);
      resetState();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al aplicar categorías');
    }
  };

  const resetState = () => {
    setSelectedProducts(new Set());
    setCategorizedResults([]);
    setCategoryOverrides(new Map());
    setShowPreview(false);
  };

  const handleClose = () => {
    setOpen(false);
    resetState();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Categorizar con IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Categorización Masiva con IA
          </DialogTitle>
          <DialogDescription>
            Selecciona productos sin categoría para categorizarlos automáticamente usando inteligencia artificial
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          // Paso 1: Selección de productos
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedProducts.size === uncategorizedProducts.length && uncategorizedProducts.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Seleccionar todos los productos"
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Seleccionar todos ({uncategorizedProducts.length} productos sin categoría)
                </label>
              </div>
              <Badge variant="secondary">
                {selectedProducts.size} seleccionados
              </Badge>
            </div>

            {uncategorizedProducts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p>Todos los productos ya tienen categoría</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {uncategorizedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                      aria-label={`Seleccionar ${product.nombre}`}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`product-${product.id}`}
                        className="font-medium cursor-pointer block"
                      >
                        {product.nombre}
                      </label>
                      {product.descripcion && (
                        <p className="text-sm text-muted-foreground">{product.descripcion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Límites de IA:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Máximo 50 productos por lote</li>
                  <li>La categorización usa caché (respuestas instantáneas para productos repetidos)</li>
                  <li>Puedes revisar y ajustar las categorías antes de aplicar</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Paso 2: Preview y ajuste
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold">Preview de Categorización</h3>
              <Badge variant="default" className="bg-green-600">
                {categorizedResults.length} productos
              </Badge>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {categorizedResults.map((result, index) => {
                const product = products.find(p => p.nombre === result.nombre);
                if (!product) return null;

                const overrideCategory = categoryOverrides.get(product.id);
                const currentCategory = overrideCategory || result.suggestedCategory.nombre;

                return (
                  <div
                    key={product.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{result.nombre}</p>
                      {result.descripcion && (
                        <p className="text-sm text-muted-foreground">{result.descripcion}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={result.suggestedCategory.confidence >= 80 ? 'default' : 'secondary'}
                          className="gap-1"
                        >
                          {result.source === 'cache' ? '⚡' : result.source === 'ai' ? '🤖' : '📁'}
                          {result.suggestedCategory.confidence}% confianza
                        </Badge>
                        {result.source === 'cache' && (
                          <span className="text-xs text-muted-foreground">(desde caché)</span>
                        )}
                      </div>
                    </div>
                    <div className="w-48">
                      <Select
                        value={currentCategory}
                        onValueChange={(value) => {
                          const newOverrides = new Map(categoryOverrides);
                          newOverrides.set(product.id, value);
                          setCategoryOverrides(newOverrides);
                        }}
                      >
                        <SelectTrigger aria-label={`Categoría para ${result.nombre}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={result.suggestedCategory.nombre}>
                            ✨ {result.suggestedCategory.nombre}
                          </SelectItem>
                          {result.alternativeCategories?.map((alt) => (
                            <SelectItem key={alt.nombre} value={alt.nombre}>
                              {alt.nombre} ({alt.confidence}%)
                            </SelectItem>
                          ))}
                          {categoriesData?.categorias
                            ?.filter(c => 
                              c.nombre !== result.suggestedCategory.nombre &&
                              !result.alternativeCategories?.some(alt => alt.nombre === c.nombre)
                            )
                            .map((category) => (
                              <SelectItem key={category.id} value={category.nombre}>
                                {category.nombre}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Revisa las categorías sugeridas. Puedes cambiarlas antes de aplicar.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!showPreview ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCategorize}
                disabled={selectedProducts.size === 0 || bulkCategorize.isPending}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {bulkCategorize.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Categorizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Categorizar {selectedProducts.size} productos
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="border-gray-300 hover:bg-gray-100"
              >
                Volver
              </Button>
              <Button
                onClick={handleApplyCategories}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aplicar Categorías
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
