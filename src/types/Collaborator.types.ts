/**
 * Tipos para colaboradores de listas
 */

export enum CollaboratorRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface Collaborator {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: CollaboratorRole;
  joinedAt: Date;
}

export interface RemoveCollaboratorDto {
  listId: string;
  userId: string;
}

export interface UpdateCollaboratorRoleDto {
  listId: string;
  userId: string;
  role: CollaboratorRole;
}
