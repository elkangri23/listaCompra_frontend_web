
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

// Tipo que devuelve el backend real
export interface BackendInvitationAccessResponse {
  success: boolean;
  message: string;
  data: {
    lista: {
      id: string;
      nombre: string;
      descripcion?: string;
      propietarioId: string;
      propietarioNombre: string;
    };
    permiso: {
      id: string;
      tipoPermiso: 'LECTURA' | 'ESCRITURA';
      creadoEn: string;
    };
    invitacion: {
      id: string;
      expiraEn: string;
      creadaEn: string;
    };
  };
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

export interface GenerateShareLinkDto {
  permissions: 'read' | 'write';
  expiresIn?: '24h' | '7d' | '30d' | 'never';
}

export interface ShareLinkResponseDto {
  hash: string;
  url: string;
  expiresAt?: string;
}
