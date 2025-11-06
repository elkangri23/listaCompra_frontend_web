import { CollaboratorRole } from '@/types/Collaborator.types';

/**
 * Sistema de permisos para listas colaborativas
 */

export interface ListPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageCollaborators: boolean;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
}

/**
 * Obtiene los permisos según el rol del usuario
 */
export const getPermissionsByRole = (role: CollaboratorRole): ListPermissions => {
  switch (role) {
    case CollaboratorRole.OWNER:
      return {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canManageCollaborators: true,
        canAddProducts: true,
        canEditProducts: true,
        canDeleteProducts: true,
      };

    case CollaboratorRole.EDITOR:
      return {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManageCollaborators: false,
        canAddProducts: true,
        canEditProducts: true,
        canDeleteProducts: true,
      };

    case CollaboratorRole.VIEWER:
      return {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManageCollaborators: false,
        canAddProducts: false,
        canEditProducts: false,
        canDeleteProducts: false,
      };
  }
};

/**
 * Mensajes informativos según el permiso
 */
export const getPermissionMessage = (permission: keyof ListPermissions): string => {
  const messages: Record<keyof ListPermissions, string> = {
    canEdit: 'No tienes permisos para editar esta lista',
    canDelete: 'No tienes permisos para eliminar esta lista',
    canInvite: 'No tienes permisos para invitar usuarios',
    canManageCollaborators: 'No tienes permisos para gestionar colaboradores',
    canAddProducts: 'No tienes permisos para agregar productos',
    canEditProducts: 'No tienes permisos para editar productos',
    canDeleteProducts: 'No tienes permisos para eliminar productos',
  };

  return messages[permission];
};
