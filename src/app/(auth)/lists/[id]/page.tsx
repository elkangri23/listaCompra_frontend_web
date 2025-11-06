'use client';

import { Heading } from '@/components/ui';
import { useList } from '@/features/lists/hooks/use-lists';
import { useParams } from 'next/navigation';
import { InviteUserDialog } from '@/features/invitations/components/invite-user-dialog';
import { useInviteUser } from '@/features/invitations/hooks/use-invitations';
import { InviteUserFormValues } from '@/features/invitations/components/invite-user-form';

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
      {isLoading && <p>Cargando...</p>}
      {isError && <p>Error al cargar la lista.</p>}
      {list && (
        <header className="mb-6 flex items-center justify-between">
          <div>
            <Heading level={1}>{list.nombre}</Heading>
            <p className="text-muted-foreground">{list.descripcion}</p>
          </div>
          <InviteUserDialog onSubmit={handleInviteUser} />
        </header>
      )}
      {/* TODO: Add products table */}
    </section>
  );
}
