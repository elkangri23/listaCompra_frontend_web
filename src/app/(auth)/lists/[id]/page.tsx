'use client';

import { Heading, Text } from '@/components/ui';
import { useList } from '@/features/lists/hooks/use-lists';
import { useParams } from 'next/navigation';
import { InviteUserDialog } from '@/features/invitations/components/invite-user-dialog';
import { useInviteUser } from '@/features/invitations/hooks/use-invitations';
import { InviteUserFormValues } from '@/features/invitations/components/invite-user-form';

// TODO: Este archivo está en desarrollo y necesita implementación completa
// Faltan hooks, estados y lógica de negocio
// Ver: src/features/products y src/features/lists

export default function ListDetailPage() {
  const params = useParams();
  const { id } = params;
  const { data: list, isLoading, isError } = useList(id as string);
  const inviteUserMutation = useInviteUser(id as string);

  const handleInviteUser = (data: InviteUserFormValues) => {
    inviteUserMutation.mutate(data);
  };

  return (
    <section className="p-4 md:p-6">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Text>Cargando lista...</Text>
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <Text className="text-destructive">Error al cargar la lista.</Text>
        </div>
      )}
      {list && (
        <>
          <header className="mb-6 flex items-center justify-between">
            <div>
              <Heading level={1}>{list.nombre}</Heading>
              <Text className="text-muted-foreground">{list.descripcion}</Text>
            </div>
            <InviteUserDialog onSubmit={handleInviteUser} />
          </header>

          <div className="rounded-lg border bg-card p-8 text-center">
            <Heading level={2} className="mb-2">
              Página en construcción
            </Heading>
            <Text className="text-muted-foreground">
              La gestión de productos y las funcionalidades avanzadas de esta lista se implementarán
              en el próximo sprint.
            </Text>
          </div>
        </>
      )}
    </section>
  );
}
