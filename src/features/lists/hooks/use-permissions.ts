import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useCollaborators } from './use-collaborators';
import { getPermissionsByRole, ListPermissions } from '@/lib/permissions/list-permissions';
import { CollaboratorRole } from '@/types/Collaborator.types';

/**
 * Hook para obtener los permisos del usuario actual en una lista
 */
export const useListPermissions = (listId: string): ListPermissions | null => {
  const { data: session } = useSession();
  const { data: collaborators } = useCollaborators(listId);

  return useMemo(() => {
    if (!session?.user?.id || !collaborators) {
      return null;
    }

    const userCollaborator = collaborators.find(
      (c) => c.userId === session.user.id
    );

    if (!userCollaborator) {
      // Usuario no es colaborador, sin permisos
      return getPermissionsByRole(CollaboratorRole.VIEWER);
    }

    return getPermissionsByRole(userCollaborator.role);
  }, [session, collaborators]);
};

/**
 * Hook para verificar si el usuario puede editar la lista
 */
export const useCanEditList = (listId: string): boolean => {
  const permissions = useListPermissions(listId);
  return permissions?.canEdit ?? false;
};

/**
 * Hook para verificar si el usuario puede eliminar la lista
 */
export const useCanDeleteList = (listId: string): boolean => {
  const permissions = useListPermissions(listId);
  return permissions?.canDelete ?? false;
};

/**
 * Hook para verificar si el usuario puede invitar a otros
 */
export const useCanInviteUsers = (listId: string): boolean => {
  const permissions = useListPermissions(listId);
  return permissions?.canInvite ?? false;
};

/**
 * Hook para verificar si el usuario puede gestionar colaboradores
 */
export const useCanManageCollaborators = (listId: string): boolean => {
  const permissions = useListPermissions(listId);
  return permissions?.canManageCollaborators ?? false;
};

/**
 * Hook para verificar si el usuario es el propietario de la lista
 */
export const useIsListOwner = (listId: string): boolean => {
  const { data: session } = useSession();
  const { data: collaborators } = useCollaborators(listId);

  return useMemo(() => {
    if (!session?.user?.id || !collaborators) {
      return false;
    }

    const userCollaborator = collaborators.find(
      (c) => c.userId === session.user.id
    );

    return userCollaborator?.role === CollaboratorRole.OWNER;
  }, [session, collaborators]);
};
