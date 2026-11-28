'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  useAdminUsers,
  useImpersonateUser,
  useUpdateUserStatus,
} from '@/features/admin/hooks/use-admin-users';
import { SkeletonRow } from '@/components/ui/skeleton';

/**
 * Gestión de usuarios del panel de administración (fase 2).
 * Se renderiza dentro de la pestaña Usuarios de /admin y también en la
 * ruta /admin/users: un solo componente, sin duplicar la tabla.
 *
 * La columna «Última conexión» solo aparece si el backend devuelve ese
 * dato en algún usuario (hoy el DTO no lo incluye).
 */
export function AdminUsersSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: usersData, isLoading: usersLoading } = useAdminUsers(searchQuery, currentPage, 20);

  const updateStatus = useUpdateUserStatus();
  const impersonate = useImpersonateUser();

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    if (window.confirm(`¿Confirmar ${currentStatus ? 'desactivar' : 'activar'} usuario?`)) {
      updateStatus.mutate({ userId, activo: !currentStatus });
    }
  };

  const handleImpersonate = (userId: string, userName: string) => {
    if (
      window.confirm(
        `¿Impersonar a ${userName}? Actuarás como este usuario hasta que finalices la impersonación.`
      )
    ) {
      impersonate.mutate(userId);
    }
  };

  const showLastConnection = (usersData?.usuarios ?? []).some(
    (user) => user.ultimaConexion !== undefined && user.ultimaConexion !== null
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Usuarios</h2>

      <div className="flex items-center gap-4">
        <Input
          type="search"
          aria-label="Buscar usuarios por nombre o email"
          placeholder="Buscar usuarios por nombre o email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-md"
        />
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery('');
            setCurrentPage(1);
          }}
        >
          Limpiar
        </Button>
      </div>

      {usersLoading ? (
        <div
          className="rounded-md border p-4 space-y-3"
          role="status"
          aria-label="Cargando usuarios…"
        >
          <span className="sr-only">Cargando usuarios…</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : usersData && usersData.usuarios.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Listas</TableHead>
                <TableHead>Registro</TableHead>
                {showLastConnection && <TableHead>Última conexión</TableHead>}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.usuarios.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nombre}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.rol === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.rol}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.activo ? 'default' : 'destructive'}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.listasCreadas !== undefined && user.listasCreadas !== null
                      ? user.listasCreadas
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.fechaCreacion).toLocaleDateString('es-ES')}
                  </TableCell>
                  {showLastConnection && (
                    <TableCell>
                      {user.ultimaConexion
                        ? new Date(user.ultimaConexion).toLocaleDateString('es-ES')
                        : '—'}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label={`Acciones de ${user.nombre}`}>
                          ⋮
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleImpersonate(user.id, user.nombre)}
                        >
                          👤 Impersonar usuario
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user.id, user.activo)}
                        >
                          {user.activo ? '🔴 Desactivar' : '🟢 Activar'}
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
        <p className="text-center text-muted-foreground py-8">No se encontraron usuarios</p>
      )}

      {usersData && usersData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {usersData.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(usersData.totalPages, p + 1))}
            disabled={currentPage === usersData.totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
