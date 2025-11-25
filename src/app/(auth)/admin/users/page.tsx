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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useSystemMetrics,
  useHealthStatus,
  usePerformanceMetrics,
  useAdminUsers,
  useUpdateUserStatus,
  useImpersonateUser,
} from '@/features/admin/hooks/use-admin-users';
import { SystemMetricsDashboard } from '@/features/admin/components/system-metrics-dashboard';
import { SystemHealthPanel } from '@/features/admin/components/system-health-panel';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Queries
  const { data: metrics, isLoading: metricsLoading } = useSystemMetrics();
  const { data: health } = useHealthStatus();
  const { data: performance } = usePerformanceMetrics();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(searchQuery, currentPage, 20);
  
  // Mutations
  const updateStatus = useUpdateUserStatus();
  const impersonate = useImpersonateUser();

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    if (confirm(`¿Confirmar ${currentStatus ? 'desactivar' : 'activar'} usuario?`)) {
      updateStatus.mutate({ userId, activo: !currentStatus });
    }
  };

  const handleImpersonate = (userId: string, userName: string) => {
    if (confirm(`¿Impersonar a ${userName}? Actuarás como este usuario hasta que finalices la impersonación.`)) {
      impersonate.mutate(userId);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Badge variant="outline" className="text-lg">
          Admin Dashboard
        </Badge>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">📊 Métricas</TabsTrigger>
          <TabsTrigger value="users">👥 Usuarios</TabsTrigger>
          <TabsTrigger value="health">🏥 Estado del Sistema</TabsTrigger>
        </TabsList>

        {/* Tab: Métricas del Sistema */}
        <TabsContent value="metrics" className="space-y-4">
          {metricsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : metrics ? (
            <SystemMetricsDashboard metrics={metrics} />
          ) : (
            <p className="text-center text-muted-foreground">No hay métricas disponibles</p>
          )}
        </TabsContent>

        {/* Tab: Gestión de Usuarios */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="search"
              placeholder="Buscar usuarios por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Limpiar
            </Button>
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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
                    <TableHead>Registro</TableHead>
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
                        {new Date(user.fechaCreacion).toLocaleDateString('es-ES')}
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
            <p className="text-center text-muted-foreground py-8">
              No se encontraron usuarios
            </p>
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
        </TabsContent>

        {/* Tab: Estado del Sistema */}
        <TabsContent value="health" className="space-y-4">
          {health ? (
            <SystemHealthPanel health={health} performance={performance} />
          ) : (
            <p className="text-center text-muted-foreground">
              Cargando estado del sistema...
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
