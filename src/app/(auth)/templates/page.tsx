'use client';

import { useState } from 'react';
import { FileText, Search, Filter, Plus, Loader2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { useBlueprints, useSearchBlueprints } from '@/features/blueprints/hooks/use-blueprints';
import { BlueprintCard } from '@/features/blueprints/components/blueprint-card';
import { BlueprintSearchResultCard } from '@/features/blueprints/components/blueprint-search-result-card';
import type { BlueprintDto } from '@/types/dtos/blueprint';
import styles from './templates.module.css';

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'mis-plantillas' | 'publicas'>('mis-plantillas');
  const [selectedEtiqueta, setSelectedEtiqueta] = useState<string | undefined>();
  const { data: session } = useSession();

  // Con 2 o más caracteres, la búsqueda usa el endpoint /blueprints/buscar:
  // busca en nombre Y descripción, en las plantillas propias Y públicas.
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isSearching = debouncedSearchTerm.trim().length >= 2;
  const { data: searchResults, isLoading: isLoadingSearch } =
    useSearchBlueprints(debouncedSearchTerm);

  const { data: misPlantillas, isLoading: isLoadingMias } = useBlueprints({
    search: searchTerm,
    esPublico: false,
    etiqueta: selectedEtiqueta,
    page: 1,
    limit: 50,
  });

  const { data: plantillasPublicas, isLoading: isLoadingPublicas } = useBlueprints({
    search: searchTerm,
    esPublico: true,
    etiqueta: selectedEtiqueta,
    page: 1,
    limit: 50,
  });

  const handleEdit = (blueprint: BlueprintDto) => {
    // TODO: Implementar modal de edición
    console.log('Edit blueprint:', blueprint);
  };

  const allEtiquetas = Array.from(
    new Set([
      ...(misPlantillas?.items.flatMap(b => b.etiquetas) || []),
      ...(plantillasPublicas?.items.flatMap(b => b.etiquetas) || []),
    ])
  );

  return (
    <div className={styles.root}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={styles.title}>Plantillas de Listas</h1>
            <p className={styles.description}>
              Crea plantillas reutilizables y usa plantillas públicas de la comunidad
            </p>
          </div>
          <Button variant="outline" disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {allEtiquetas.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant={selectedEtiqueta === undefined ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedEtiqueta(undefined)}
                >
                  Todas
                </Badge>
                {allEtiquetas.slice(0, 5).map((etiqueta) => (
                  <Badge
                    key={etiqueta}
                    variant={selectedEtiqueta === etiqueta ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedEtiqueta(etiqueta)}
                  >
                    {etiqueta}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="mis-plantillas">
            Mis Plantillas
            {misPlantillas && (
              <Badge variant="secondary" className="ml-2">
                {misPlantillas.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="publicas">
            Plantillas Públicas
            {plantillasPublicas && (
              <Badge variant="secondary" className="ml-2">
                {plantillasPublicas.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {isSearching ? (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-900">
                Resultados para «{debouncedSearchTerm.trim()}»
                {searchResults && (
                  <span className="text-gray-500 font-normal"> ({searchResults.total})</span>
                )}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
                <X className="h-4 w-4 mr-1" />
                Limpiar búsqueda
              </Button>
            </div>
            {isLoadingSearch ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Buscando plantillas...</span>
              </div>
            ) : searchResults && searchResults.results.length > 0 ? (
              <div className="space-y-3">
                {searchResults.results.map((result) => (
                  <BlueprintSearchResultCard
                    key={result.id}
                    result={result}
                    isMine={session?.user?.id === result.creadoPorId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sin resultados para «{debouncedSearchTerm.trim()}»
                </h3>
                <p className="text-gray-600">
                  Prueba con otro término o revisa las pestañas de plantillas
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
        <TabsContent value="mis-plantillas" className="mt-6">
          {isLoadingMias ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando plantillas...</span>
            </div>
          ) : misPlantillas && misPlantillas.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {misPlantillas.items.map((blueprint) => (
                <BlueprintCard
                  key={blueprint.id}
                  blueprint={blueprint}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes plantillas aún
              </h3>
              <p className="text-gray-600 mb-6">
                Ve a cualquiera de tus listas y guárdala como plantilla para reutilizarla
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="publicas" className="mt-6">
          {isLoadingPublicas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando plantillas públicas...</span>
            </div>
          ) : plantillasPublicas && plantillasPublicas.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantillasPublicas.items.map((blueprint) => (
                <BlueprintCard key={blueprint.id} blueprint={blueprint} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay plantillas públicas disponibles
              </h3>
              <p className="text-gray-600">
                Sé el primero en compartir una plantilla con la comunidad
              </p>
            </div>
          )}
        </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}