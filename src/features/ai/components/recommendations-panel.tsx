'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lightbulb, Plus, Loader2, Sparkles, RefreshCw, X } from 'lucide-react';
import { useRecommendations } from '@/features/ai/hooks/use-ai';
import { toast } from 'sonner';
import type { Recommendation } from '@/types/dtos/ai';

interface RecommendationsPanelProps {
  listId: string;
  onAddProduct: (recommendation: Recommendation) => Promise<void>;
}

export function RecommendationsPanel({ listId, onAddProduct }: RecommendationsPanelProps) {
  const [contexto, setContexto] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const {
    data: recommendationsData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useRecommendations(listId, {
    contexto: contexto || undefined,
    limit: 8,
  });

  const recommendations = recommendationsData?.data?.recommendations || [];

  const handleAddProduct = async (recommendation: Recommendation) => {
    const productKey = `${recommendation.productoNombre}-${recommendation.categoria}`;
    setAddingProductId(productKey);

    try {
      await onAddProduct(recommendation);
      toast.success(`${recommendation.productoNombre} añadido a la lista`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al añadir producto');
    } finally {
      setAddingProductId(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info('Actualizando recomendaciones...');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'destructive';
      case 'media':
        return 'default';
      case 'baja':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <CardTitle>Recomendaciones IA</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {!showContextInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContextInput(true)}
                className="gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Contexto
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
        <CardDescription>
          Sugerencias personalizadas basadas en los productos de tu lista
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showContextInput && (
          <div className="space-y-2 pb-4 border-b">
            <div className="flex items-center justify-between">
              <Label htmlFor="context-input" className="text-sm font-medium">
                Añade contexto para mejores recomendaciones
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowContextInput(false);
                  setContexto('');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              id="context-input"
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              placeholder="Ej: cena romántica, dieta vegetariana, comida rápida..."
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRefresh();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Presiona Enter para actualizar recomendaciones
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-sm">Generando recomendaciones...</p>
          </div>
        ) : isError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Error al cargar recomendaciones
            </p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Reintentar
            </Button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay recomendaciones disponibles</p>
            <p className="text-xs mt-1">
              Añade más productos a tu lista para obtener sugerencias
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => {
              const productKey = `${recommendation.productoNombre}-${recommendation.categoria}`;
              const isAdding = addingProductId === productKey;

              return (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {recommendation.productoNombre}
                        </p>
                        <Badge
                          variant={getPriorityColor(recommendation.prioridad)}
                          className="text-xs"
                        >
                          {recommendation.prioridad}
                        </Badge>
                      </div>
                      {recommendation.descripcion && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {recommendation.descripcion}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {recommendation.categoria && (
                          <Badge variant="outline" className="text-xs">
                            {recommendation.categoria}
                          </Badge>
                        )}
                        {recommendation.cantidad && (
                          <span className="text-xs text-muted-foreground">
                            {recommendation.cantidad} {recommendation.unidad || 'ud'}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3" />
                          {recommendation.confidence}%
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                        💡 {recommendation.razon}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddProduct(recommendation)}
                      disabled={isAdding}
                      className="flex-shrink-0"
                      aria-label={`Añadir ${recommendation.productoNombre}`}
                    >
                      {isAdding ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {recommendationsData?.data?.metadata && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {recommendationsData.data.metadata.totalRecommendations} recomendaciones en{' '}
              {recommendationsData.data.metadata.processingTimeMs}ms
              {recommendationsData.data.metadata.contextoUtilizado && (
                <span className="block mt-1">
                  Contexto: &quot;{recommendationsData.data.metadata.contextoUtilizado}&quot;
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
