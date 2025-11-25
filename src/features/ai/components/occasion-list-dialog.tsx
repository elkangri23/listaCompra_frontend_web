'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartyPopper, Loader2, Eye, Plus, Users } from 'lucide-react';
import { useOccasions, useGenerateOccasionList, usePreviewOccasionList } from '@/features/ai/hooks/use-ai';
import { toast } from 'sonner';
import type { OccasionProduct } from '@/types/dtos/ai';

interface OccasionListDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function OccasionListDialog({ open: controlledOpen, onOpenChange }: OccasionListDialogProps = {}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [numPersonas, setNumPersonas] = useState<number>(4);
  const [contextoAdicional, setContextoAdicional] = useState('');
  const [previewProducts, setPreviewProducts] = useState<OccasionProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { data: occasionsData, isLoading: isLoadingOccasions } = useOccasions();
  const generateList = useGenerateOccasionList();
  const previewList = usePreviewOccasionList();

  const handlePreview = async () => {
    if (!selectedOccasion) {
      toast.error('Selecciona una ocasión');
      return;
    }

    try {
      const result = await previewList.mutateAsync({
        occasion: selectedOccasion,
        numPersonas: numPersonas > 0 ? numPersonas : undefined,
        contextoAdicional: contextoAdicional || undefined,
      });

      setPreviewProducts(result.data.preview.products);
      setShowPreview(true);
      toast.success(`Preview generado: ${result.data.metadata.totalProductos} productos`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al generar preview');
    }
  };

  const handleGenerate = async () => {
    if (!selectedOccasion) {
      toast.error('Selecciona una ocasión');
      return;
    }

    try {
      const result = await generateList.mutateAsync({
        occasion: selectedOccasion,
        numPersonas: numPersonas > 0 ? numPersonas : undefined,
        contextoAdicional: contextoAdicional || undefined,
        incluirPrecios: true,
      });

      toast.success(`Lista creada: ${result.data.list.nombre} con ${result.data.products.length} productos`);
      setOpen(false);
      router.push(`/lists/${result.data.list.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear lista');
    }
  };

  const resetState = () => {
    setSelectedOccasion('');
    setNumPersonas(4);
    setContextoAdicional('');
    setPreviewProducts([]);
    setShowPreview(false);
  };

  const handleClose = () => {
    setOpen(false);
    resetState();
  };

  const occasionsList = occasionsData?.data?.occasions || [];
  const selectedOccasionData = occasionsList.find(o => o.id === selectedOccasion);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PartyPopper className="h-4 w-4" />
          Lista por Ocasión
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-pink-600" />
            Crear Lista por Ocasión con IA
          </DialogTitle>
          <DialogDescription>
            Genera automáticamente una lista completa de productos para tu evento
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="select" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Seleccionar Ocasión</TabsTrigger>
            <TabsTrigger value="preview" disabled={!showPreview}>
              Preview {previewProducts.length > 0 && `(${previewProducts.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4">
            {isLoadingOccasions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                  {occasionsList.map((occasion) => (
                    <button
                      key={occasion.id}
                      onClick={() => setSelectedOccasion(occasion.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        selectedOccasion === occasion.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      aria-label={`Seleccionar ${occasion.nombre}`}
                    >
                      <div className="text-2xl mb-1">{occasion.emoji}</div>
                      <div className="font-semibold text-sm">{occasion.nombre}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {occasion.descripcion}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedOccasionData && (
                  <div className="bg-accent p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedOccasionData.emoji}</span>
                      <h3 className="font-semibold">{selectedOccasionData.nombre}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedOccasionData.descripcion}
                    </p>
                    {selectedOccasionData.ejemplos && selectedOccasionData.ejemplos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedOccasionData.ejemplos.map((ejemplo, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {ejemplo}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="num-personas" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Número de Personas (opcional)
                    </Label>
                    <Input
                      id="num-personas"
                      type="number"
                      min="1"
                      max="100"
                      value={numPersonas || ''}
                      onChange={(e) => setNumPersonas(parseInt(e.target.value) || 0)}
                      placeholder="Ej: 4"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contexto">Contexto Adicional (opcional)</Label>
                    <Textarea
                      id="contexto"
                      value={contextoAdicional}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContextoAdicional(e.target.value)}
                      placeholder="Ej: Dieta vegetariana, sin gluten, incluir bebidas sin alcohol..."
                      rows={3}
                      className="mt-1"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {contextoAdicional.length}/500 caracteres
                    </p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {previewProducts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay preview disponible</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold">Productos Sugeridos</h3>
                  <Badge variant="default">{previewProducts.length} productos</Badge>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {previewProducts.map((product, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{product.nombre}</div>
                          {product.descripcion && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {product.descripcion}
                            </p>
                          )}
                          {product.notas && (
                            <p className="text-xs text-blue-600 mt-1">💡 {product.notas}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium">
                            {product.cantidad} {product.unidad || 'ud'}
                          </div>
                          {product.categoria && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {product.categoria}
                            </Badge>
                          )}
                          {product.prioridadSugerida && (
                            <Badge
                              variant={
                                product.prioridadSugerida === 'alta'
                                  ? 'destructive'
                                  : product.prioridadSugerida === 'media'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs mt-1 ml-1"
                            >
                              {product.prioridadSugerida}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          {!showPreview ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!selectedOccasion || previewList.isPending}
                className="gap-2"
              >
                {previewList.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Ver Preview
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!selectedOccasion || generateList.isPending}
                className="gap-2"
              >
                {generateList.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Crear Lista
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Modificar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateList.isPending}
                className="gap-2"
              >
                {generateList.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Crear Lista con Preview
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
