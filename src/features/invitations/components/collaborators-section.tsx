'use client';

import React from 'react';
import { useCollaborators } from '../hooks/use-collaborators';
import { CollaboratorItem } from './collaborator-item';
import { GeneralLoading } from '@/components/layout';
import { useSession } from 'next-auth/react';

interface CollaboratorsSectionProps {
  listId: string;
  ownerId: string;
}

export const CollaboratorsSection: React.FC<CollaboratorsSectionProps> = ({ listId, ownerId }) => {
  const { data: collaborators, isLoading, error } = useCollaborators(listId);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  if (isLoading) {
    return <GeneralLoading />;
  }

  if (error) {
    return <p className="text-red-500">Error al cargar los colaboradores.</p>;
  }

  const isOwner = currentUserId === ownerId;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900">Colaboradores ({collaborators?.length || 0})</h3>
      <div className="divide-y divide-gray-200">
        {collaborators && collaborators.length > 0 ? (
          collaborators.map((collaborator) => (
            <CollaboratorItem
              key={collaborator.id}
              listId={listId}
              collaborator={collaborator}
              isOwner={isOwner}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 py-4">No hay colaboradores en esta lista.</p>
        )}
      </div>
    </div>
  );
};
