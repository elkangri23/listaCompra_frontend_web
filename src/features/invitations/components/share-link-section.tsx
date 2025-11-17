'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useShareList } from '../hooks/use-share-list';
import { toast } from 'sonner';
import { Copy, Link2, Loader2 } from 'lucide-react';

interface ShareLinkSectionProps {
  listId: string;
}

export function ShareLinkSection({ listId }: ShareLinkSectionProps) {
  const [permissions, setPermissions] = useState<'read' | 'write'>('read');
  const [shareLink, setShareLink] = useState<string>('');
  const shareListMutation = useShareList(listId);

  const handleGenerateLink = async () => {
    try {
      const result = await shareListMutation.mutateAsync({ permissions });
      const fullUrl = `${window.location.origin}/invitations/${result.hash}`;
      setShareLink(fullUrl);
      toast.success('Enlace generado correctamente');
    } catch (error) {
      toast.error('Error al generar el enlace');
      console.error('Error generating share link:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el enlace');
      console.error('Error copying link:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="permissions" className="text-base font-semibold text-gray-900">
          Permisos de acceso
        </Label>
        <Select
          value={permissions}
          onValueChange={(value: string) => setPermissions(value as 'read' | 'write')}
        >
          <SelectTrigger id="permissions" className="w-full h-11">
            <SelectValue placeholder="Selecciona permisos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read">
              <div className="flex flex-col items-start">
                <span className="font-medium">Solo lectura</span>
                <span className="text-xs text-gray-500">Ver productos y categorías</span>
              </div>
            </SelectItem>
            <SelectItem value="write">
              <div className="flex flex-col items-start">
                <span className="font-medium">Lectura y escritura</span>
                <span className="text-xs text-gray-500">Ver, añadir y editar productos</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
          {permissions === 'read'
            ? '👀 Los usuarios podrán ver la lista pero no editarla'
            : '✏️ Los usuarios podrán ver y editar la lista'}
        </p>
      </div>

      <Button
        onClick={handleGenerateLink}
        disabled={shareListMutation.isPending}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
      >
        {shareListMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando enlace...
          </>
        ) : (
          <>
            <Link2 className="mr-2 h-4 w-4" />
            Generar Enlace de Compartir
          </>
        )}
      </Button>

      {shareLink && (
        <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Label htmlFor="share-link" className="text-base font-semibold text-green-900">
            ✅ Enlace generado
          </Label>
          <div className="flex gap-2">
            <Input
              id="share-link"
              value={shareLink}
              readOnly
              className="flex-1 bg-white border-green-300 font-mono text-sm"
            />
            <Button 
              onClick={handleCopyLink} 
              size="icon" 
              variant="outline"
              className="h-10 w-10 border-green-300 hover:bg-green-100"
            >
              <Copy className="h-4 w-4 text-green-700" />
              <span className="sr-only">Copiar enlace</span>
            </Button>
          </div>
          <p className="text-sm text-green-800 flex items-start gap-2">
            <span>🔗</span>
            <span>Comparte este enlace con cualquier persona para darle acceso a la lista</span>
          </p>
        </div>
      )}
    </div>
  );
}
