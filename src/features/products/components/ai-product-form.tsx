/**
 * Componente de form de producto con categorización inteligente por IA
 * Envuelve ProductForm y agrega sugerencias de categoría automáticas
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductForm, ProductFormProps, ProductFormValues } from './product-form';
import { useCategorizeProduct } from '@/features/ai/hooks/use-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { CategorySuggestionDto } from '@/types/dtos/ai';

interface AIProductFormProps extends ProductFormProps {
  /**
   * Si la categorización automática debe estar habilitada por defecto
   */
  defaultAIEnabled?: boolean;

  /**
   * Callback cuando se selecciona una sugerencia de IA
   */
  onCategorySuggestionSelected?: (categoryId: string) => void;
}

export function AIProductForm({
  defaultValues,
  categories,
  onSubmit,
  isSubmitting,
  submitLabel,
  defaultAIEnabled = true,
  onCategorySuggestionSelected,
}: AIProductFormProps) {
  const [aiEnabled, setAiEnabled] = useState(defaultAIEnabled);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [suggestions, setSuggestions] = useState<CategorySuggestionDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    defaultValues?.categoriaId
  );
  const [formValues, setFormValues] = useState<Partial<ProductFormValues>>(defaultValues || {});

  const categorizeMutation = useCategorizeProduct();

  // Función de categorización con useCallback para evitar recreación
  const handleCategorize = useCallback(async () => {
    if (!productName || productName.length < 3) return;

    try {
      const result = await categorizeMutation.mutateAsync({
        nombre: productName,
        descripcion: productDescription,
      });

      setSuggestions(result.sugerencias);

      // Auto-seleccionar la categoría recomendada si tiene alta confianza (>0.7)
      if (
        result.categoriaRecomendada &&
        result.categoriaRecomendada.confianza > 0.7 &&
        !selectedCategoryId
      ) {
        setSelectedCategoryId(result.categoriaRecomendada.categoriaId);
        onCategorySuggestionSelected?.(result.categoriaRecomendada.categoriaId);
        
        toast.success('Categoría sugerida por IA', {
          description: `${result.categoriaRecomendada.nombre} (${Math.round(result.categoriaRecomendada.confianza * 100)}% confianza)`,
          icon: <Sparkles className="h-4 w-4" />,
        });
      }
    } catch (error) {
      console.error('Error al categorizar con IA:', error);
      toast.error('Error al obtener sugerencias de IA', {
        description: 'Puedes seleccionar la categoría manualmente',
      });
    }
  }, [productName, productDescription, categorizeMutation, selectedCategoryId, onCategorySuggestionSelected]);

  // Efecto para categorizar automáticamente cuando cambia el nombre del producto
  useEffect(() => {
    if (!aiEnabled || !productName || productName.length < 3) {
      setSuggestions([]);
      return;
    }

    // Debounce de 800ms para evitar demasiadas llamadas
    const timer = setTimeout(() => {
      handleCategorize();
    }, 800);

    return () => clearTimeout(timer);
  }, [productName, productDescription, aiEnabled, handleCategorize]);

  // Actualizar estados cuando cambian los valores del form
  useEffect(() => {
    if (formValues.nombre !== productName) {
      setProductName(formValues.nombre || '');
    }
    if (formValues.descripcion !== productDescription) {
      setProductDescription(formValues.descripcion || '');
    }
  }, [formValues, productName, productDescription]);

  const handleSuggestionClick = (suggestion: CategorySuggestionDto) => {
    setSelectedCategoryId(suggestion.categoriaId);
    setFormValues(prev => ({ ...prev, categoriaId: suggestion.categoriaId }));
    onCategorySuggestionSelected?.(suggestion.categoriaId);
    
    toast.success('Categoría aplicada', {
      description: suggestion.nombre,
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    // Si hay una categoría seleccionada por IA, usarla
    if (selectedCategoryId && !values.categoriaId) {
      values.categoriaId = selectedCategoryId;
    }
    
    await onSubmit(values);
  };

  return (
    <div className="space-y-4">
      {/* Toggle de IA */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Categorización Inteligente</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="ai-mode"
                checked={aiEnabled}
                onCheckedChange={setAiEnabled}
              />
              <Label htmlFor="ai-mode" className="text-sm font-normal cursor-pointer">
                {aiEnabled ? 'Activado' : 'Desactivado'}
              </Label>
            </div>
          </div>
          <CardDescription>
            {aiEnabled
              ? 'La IA sugerirá categorías automáticamente mientras escribes'
              : 'Desactivado - Selecciona la categoría manualmente'}
          </CardDescription>
        </CardHeader>

        {/* Sugerencias de IA */}
        {aiEnabled && suggestions.length > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-sm font-medium">Sugerencias de categoría:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <Button
                    key={suggestion.categoriaId}
                    variant={selectedCategoryId === suggestion.categoriaId ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="gap-2"
                  >
                    {selectedCategoryId === suggestion.categoriaId && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {suggestion.nombre}
                    <Badge variant="secondary" className="ml-1">
                      {Math.round(suggestion.confianza * 100)}%
                    </Badge>
                  </Button>
                ))}
              </div>
              {suggestions[0]?.razon && (
                <p className="text-xs text-muted-foreground mt-2">
                  💡 {suggestions[0].razon}
                </p>
              )}
            </div>
          </CardContent>
        )}

        {/* Estado de carga */}
        {aiEnabled && categorizeMutation.isPending && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analizando producto...</span>
            </div>
          </CardContent>
        )}

        {/* Error de IA */}
        {aiEnabled && categorizeMutation.isError && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>No se pudieron obtener sugerencias. Selecciona manualmente.</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Form de producto original */}
      <ProductForm
        defaultValues={{
          ...defaultValues,
          categoriaId: selectedCategoryId || defaultValues?.categoriaId,
        }}
        categories={categories}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onFieldChange={handleFormChange}
      />
    </div>
  );
}
