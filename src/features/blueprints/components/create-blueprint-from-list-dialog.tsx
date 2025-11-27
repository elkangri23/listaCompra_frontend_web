'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2 } from 'lucide-react';
import { useCreateBlueprintFromList } from '../hooks/use-blueprints';

interface CreateBlueprintFromListDialogProps {
  listId: string;
  listName: string;
  productCount: number;
}

export function CreateBlueprintFromListDialog({ 
  listId, 
  listName, 
  productCount 
}: CreateBlueprintFromListDialogProps) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState(`Plantilla: ${listName}`);
  const [descripcion, setDescripcion] = useState('');
  const [esPublico, setEsPublico] = useState(false);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [etiquetaInput, setEtiquetaInput] = useState('');

  const createBlueprintMutation = useCreateBlueprintFromList();

  const handleAddEtiqueta = () => {
    if (etiquetaInput.trim() && !etiquetas.includes(etiquetaInput.trim())) {
      setEtiquetas([...etiquetas, etiquetaInput.trim()]);
      setEtiquetaInput('');
    }
  };

  const handleRemoveEtiqueta = (etiqueta: string) => {
    setEtiquetas(etiquetas.filter(e => e !== etiqueta));
  };

  const handleCreate = async () => {
    if (!nombre.trim()) {
      return;
    }

    await createBlueprintMutation.mutateAsync({
      listId,
      blueprintData: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        esPublico,
        etiquetas: etiquetas.length > 0 ? etiquetas : undefined,
      },
    });

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNombre(`Plantilla: ${listName}`);
    setDescripcion('');
    setEsPublico(false);
    setEtiquetas([]);
    setEtiquetaInput('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Guardar como Plantilla
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Crear Plantilla desde Lista</DialogTitle>
          <DialogDescription>
            Se creará una plantilla reutilizable con los {productCount} productos de esta lista.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la plantilla *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Compra semanal, Lista cumpleaños..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescripcion(e.target.value)}
              placeholder="Describe para qué sirve esta plantilla..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="etiquetas">Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                id="etiquetas"
                value={etiquetaInput}
                onChange={(e) => setEtiquetaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEtiqueta();
                  }
                }}
                placeholder="Añadir etiqueta..."
              />
              <Button type="button" variant="outline" onClick={handleAddEtiqueta}>
                Añadir
              </Button>
            </div>
            {etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {etiquetas.map((etiqueta) => (
                  <Badge
                    key={etiqueta}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveEtiqueta(etiqueta)}
                  >
                    {etiqueta} ✕
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="publico"
              checked={esPublico}
              onCheckedChange={(checked) => setEsPublico(checked as boolean)}
            />
            <Label htmlFor="publico" className="text-sm font-normal cursor-pointer">
              Hacer pública (otros usuarios podrán verla y usarla)
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!nombre.trim() || createBlueprintMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createBlueprintMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Plantilla
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
