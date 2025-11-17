import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GeneralLoading } from '@/components/layout';
import { useSession } from 'next-auth/react';
import { CollaboratorItem } from './collaborator-item';
import { useCollaborators } from '../hooks/use-collaborators';
import { TriangleAlert } from 'lucide-react';

interface CollaboratorsSectionProps {
  listId: string;
  ownerId: string;
}

const MAX_COLLABORATORS = 10;

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
  const collaboratorCount = collaborators?.length || 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Colaboradores ({collaboratorCount}/{MAX_COLLABORATORS})
        </h3>
        <p className="text-sm text-gray-600">
          Personas que tienen acceso a esta lista.
        </p>
      </div>

      {collaboratorCount >= MAX_COLLABORATORS && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Límite de Colaboradores Alcanzado</AlertTitle>
          <AlertDescription>
            Has alcanzado el número máximo de colaboradores para esta lista. Para añadir más, primero debes eliminar a otros.
          </AlertDescription>
        </Alert>
      )}

      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {currentUserId && collaborators && collaborators.length > 0 ? (
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
          <p className="text-sm text-gray-500 py-4 text-center">No hay colaboradores en esta lista.</p>
        )}
      </div>
    </div>
  );
};
