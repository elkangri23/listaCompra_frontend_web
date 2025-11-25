'use client';

import { useState } from 'react';
import {
  useStores,
  useCreateStore,
  useUpdateStore,
  useDeleteStore,
  useToggleStoreStatus,
} from '@/features/stores/hooks/use-stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { StoreResponseDto } from '@/types/dtos/stores';

export default function StoresPage() {
  const { data: storesData, isLoading, error } = useStores();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const toggleStatus = useToggleStoreStatus();

  const [newStoreName, setNewStoreName] = useState('');
  const [editingStore, setEditingStore] = useState<StoreResponseDto | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCreateStore = () => {
    if (!newStoreName.trim()) return;
    createStore.mutate({ nombre: newStoreName }, {
      onSuccess: () => {
        setNewStoreName('');
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleEditStore = () => {
    if (!editingStore || !editName.trim()) return;
    updateStore.mutate(
      { id: editingStore.id, nombre: editName },
      {
        onSuccess: () => {
          setEditingStore(null);
          setEditName('');
          setIsEditDialogOpen(false);
        },
      }
    );
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la tienda "${nombre}"?`)) {
      deleteStore.mutate({ id });
    }
  };

  const handleToggleStatus = (store: StoreResponseDto) => {
    toggleStatus.mutate({ id: store.id, activa: !store.activa });
  };

  const openEditDialog = (store: StoreResponseDto) => {
    setEditingStore(store);
    setEditName(store.nombre);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">Error al cargar las tiendas: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Tiendas</h1>
          <p className="text-muted-foreground mt-1">
            Administra las tiendas y sus categorías asociadas
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <span className="mr-2">+</span>
              Nueva Tienda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Tienda</DialogTitle>
              <DialogDescription>
                Ingresa el nombre de la nueva tienda. Podrás agregar categorías después.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="store-name" className="text-sm font-medium">
                  Nombre de la tienda
                </label>
                <Input
                  id="store-name"
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Ej: Mercadona, Carrefour, Lidl..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateStore();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewStoreName('');
                  setIsCreateDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateStore}
                disabled={createStore.isPending || !newStoreName.trim()}
              >
                {createStore.isPending ? 'Creando...' : 'Crear Tienda'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de tiendas */}
      {storesData && storesData.tiendas.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storesData.tiendas.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={store.activa ? 'default' : 'secondary'}>
                      {store.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {store.fechaCreacion
                      ? new Date(store.fechaCreacion).toLocaleDateString('es-ES')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ⋮
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(store)}>
                          ✏️ Editar nombre
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(store)}>
                          {store.activa ? '🔴 Desactivar' : '🟢 Activar'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(store.id, store.nombre)}
                          className="text-destructive"
                        >
                          🗑️ Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold">No hay tiendas</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Aún no has agregado ninguna tienda. Crea una para comenzar a organizar tus productos.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <span className="mr-2">+</span>
              Crear Primera Tienda
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tienda</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la tienda &quot;{editingStore?.nombre}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-store-name" className="text-sm font-medium">
                Nombre de la tienda
              </label>
              <Input
                id="edit-store-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre de la tienda"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditStore();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingStore(null);
                setEditName('');
                setIsEditDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditStore}
              disabled={updateStore.isPending || !editName.trim()}
            >
              {updateStore.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
