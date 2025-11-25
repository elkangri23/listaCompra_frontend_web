'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, MoreVertical, Trash2, Edit, Plus, Globe, Lock, Package } from 'lucide-react';
import type { BlueprintDto } from '@/types/dtos/blueprint';
import { useDeleteBlueprint, useCreateListFromBlueprint } from '../hooks/use-blueprints';
import { useRouter } from 'next/navigation';

interface BlueprintCardProps {
  blueprint: BlueprintDto;
  onEdit?: (blueprint: BlueprintDto) => void;
}

export function BlueprintCard({ blueprint, onEdit }: BlueprintCardProps) {
  const router = useRouter();
  const deleteBlueprintMutation = useDeleteBlueprint();
  const createListMutation = useCreateListFromBlueprint();
  const [isCreatingList, setIsCreatingList] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la plantilla "${blueprint.nombre}"?\n\n` +
      `Esta acción NO se puede deshacer.`
    );

    if (confirmDelete) {
      await deleteBlueprintMutation.mutateAsync(blueprint.id);
    }
  };

  const handleCreateList = async () => {
    setIsCreatingList(true);
    try {
      const result = await createListMutation.mutateAsync({
        blueprintId: blueprint.id,
        data: {
          nombre: blueprint.nombre,
          descripcion: blueprint.descripcion,
        },
      });
      // Redirigir a la nueva lista creada
      router.push(`/lists/${result.listaId}`);
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsCreatingList(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{blueprint.nombre}</CardTitle>
              <CardDescription className="line-clamp-2">
                {blueprint.descripcion || 'Sin descripción'}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Más opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(blueprint)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="h-4 w-4" />
          <span>{blueprint.productos.length} productos</span>
        </div>

        <div className="flex items-center gap-2">
          {blueprint.esPublico ? (
            <Badge variant="secondary" className="gap-1">
              <Globe className="h-3 w-3" />
              Pública
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              Privada
            </Badge>
          )}
          {blueprint.usosCount !== undefined && blueprint.usosCount > 0 && (
            <Badge variant="outline">
              {blueprint.usosCount} {blueprint.usosCount === 1 ? 'uso' : 'usos'}
            </Badge>
          )}
        </div>

        {blueprint.etiquetas && blueprint.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {blueprint.etiquetas.map((etiqueta) => (
              <Badge key={etiqueta} variant="secondary" className="text-xs">
                {etiqueta}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleCreateList}
          disabled={isCreatingList || createListMutation.isPending}
          className="flex-1"
        >
          {isCreatingList || createListMutation.isPending ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Usar Plantilla
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
