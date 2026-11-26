import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreateListFromBlueprint } from '../hooks/use-blueprints';
import type { BlueprintSearchResultDto } from '@/types/dtos/blueprint';

interface Props {
  result: BlueprintSearchResultDto;
  isMine: boolean;
}

/**
 * Fila de resultado de la búsqueda de plantillas. Más ligera que
 * BlueprintCard: el endpoint de búsqueda no devuelve el detalle de
 * productos, solo el conteo, y no se puede editar ni borrar desde aquí
 * (las públicas son de otros usuarios).
 */
export function BlueprintSearchResultCard({ result, isMine }: Props) {
  const router = useRouter();
  const createListMutation = useCreateListFromBlueprint();
  const [isCreating, setIsCreating] = useState(false);

  const handleUse = async () => {
    setIsCreating(true);
    try {
      const created = await createListMutation.mutateAsync({
        blueprintId: result.id,
        data: { nombre: result.nombre, descripcion: result.descripcion },
      });
      router.push(`/lists/${created.listaId}`);
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-4">
        <FileText className="h-5 w-5 shrink-0 text-gray-400 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 truncate">{result.nombre}</p>
            <Badge variant={isMine ? 'default' : 'secondary'}>
              {isMine ? 'Mía' : 'Pública'}
            </Badge>
          </div>
          {result.descripcion && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{result.descripcion}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {result.productosCount} {result.productosCount === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <Button
          onClick={handleUse}
          disabled={isCreating || createListMutation.isPending}
          size="sm"
          className="shrink-0"
        >
          {isCreating || createListMutation.isPending ? (
            'Creando...'
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Usar Plantilla
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
