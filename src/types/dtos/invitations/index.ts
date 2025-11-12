
export interface InvitationDto {
  id: string;
  listName: string;
  from: string;
  createdAt: string;
}

export class InviteUserDto {
  listId!: string;
  email!: string;
}

export interface PublicInvitationDetailsDto {
  listId: string;
  listName: string;
  inviterName: string;
}

export interface ActiveInvitationDto {
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED';
  permissions: string[];
  createdAt: string;
}

export interface UpdatePermissionsDto {
  permissions: string[];
}
