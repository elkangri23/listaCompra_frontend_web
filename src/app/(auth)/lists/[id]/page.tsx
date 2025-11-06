'use client';

import { Heading, Text, Button } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useList } from '@/features/lists/hooks/use-lists';
import { useParams } from 'next/navigation';
import { InviteUserDialog } from '@/features/invitations/components/invite-user-dialog';
import { useInviteUser } from '@/features/invitations/hooks/use-invitations';
import { InviteUserFormValues } from '@/features/invitations/components/invite-user-form';
import { CollaboratorsList } from '@/features/lists/components/collaborators-list';
import { useCollaborators } from '@/features/lists/hooks/use-collaborators';
import { useIsListOwner } from '@/features/lists/hooks/use-permissions';
import { Users, ShoppingCart } from 'lucide-react';

export default function ListDetailPage() {
  const params = useParams();
  const listId = params.id as string;

  const { data: list, isLoading: isLoadingList, isError: isErrorList } = useList(listId);
  const { data: collaborators, isLoading: isLoadingCollaborators } = useCollaborators(listId);
  const isOwner = useIsListOwner(listId);
  const inviteUserMutation = useInviteUser(listId);

  const handleInviteUser = (data: InviteUserFormValues) => {
    inviteUserMutation.mutate(data);
  };

  if (isLoadingList || isLoadingCollaborators) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text>Cargando lista...</Text>
      </div>
    );
  }

  if (isErrorList) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <Text className="text-destructive">Error al cargar la lista.</Text>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text>Lista no encontrada.</Text>
      </div>
    );
  }

  return (
    <section className="p-4 md:p-6">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Heading level={1}>{list.nombre}</Heading>
          {list.descripcion && (
            <Text className="text-muted-foreground mt-1">{list.descripcion}</Text>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <InviteUserDialog onSubmit={handleInviteUser} />
          )}
        </div>
      </header>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Colaboradores ({collaborators?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Productos</CardTitle>
              <CardDescription>
                Administra los productos de tu lista de compras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text className="text-muted-foreground">
                La funcionalidad completa de productos estará disponible pronto.
              </Text>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Colaboradores de la Lista</CardTitle>
              <CardDescription>
                Gestiona quién tiene acceso a esta lista y sus permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {collaborators && (
                <CollaboratorsList
                  listId={listId}
                  collaborators={collaborators}
                  isOwner={isOwner}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
