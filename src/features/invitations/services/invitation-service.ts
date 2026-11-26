import { axiosInstance } from '@/lib/api/axios-instance';
import {
  InvitationDto,
  BackendInvitationAccessResponse,
  ActiveInvitationDto,
  UpdatePermissionsDto,
  GenerateShareLinkDto,
  ShareLinkResponseDto,
} from '@/types/dtos/invitations';

const inviteUser = async (listId: string, email: string, tipoPermiso: 'LECTURA' | 'ESCRITURA' = 'LECTURA'): Promise<void> => {
  await axiosInstance.post(`/invitations/${listId}/share`, { 
    email,
    tipoPermiso
  });
};

const getPendingInvitations = async (): Promise<InvitationDto[]> => {
  const response = await axiosInstance.get<InvitationDto[]>('/invitations/pending');
  return response.data;
};

// NOTA: No existe endpoint /accept en el backend
// El acceso a la lista compartida se obtiene simplemente con GET /invitations/:hash/access
// Una vez el usuario tiene el hash válido y está autenticado, puede acceder directamente a la lista

const declineInvitation = async (invitationId: string): Promise<void> => {
  await axiosInstance.post(`/invitations/${invitationId}/decline`);
};

const getInvitationByHash = async (hash: string): Promise<BackendInvitationAccessResponse> => {
  const response = await axiosInstance.get(`/invitations/${hash}/access`);
  return response.data;
};

/**
 * Respuesta real del backend: GET /invitations/:listaId/list devuelve
 * {success, message, data: [{id, listaId, hash, tipoPermiso, creadaEn, expiraEn, activa}]}
 * (13A). Se mapea a ActiveInvitationDto; el email viene de emailInvitado
 * (vacío en invitaciones creadas antes de que existiera ese campo).
 */
interface BackendListInvitation {
  id: string;
  emailInvitado?: string | null;
  tipoPermiso: string;
  creadaEn: string;
}

const getInvitationsByList = async (listId: string): Promise<ActiveInvitationDto[]> => {
  const response = await axiosInstance.get<{ data: BackendListInvitation[] }>(
    `/invitations/${listId}/list`
  );
  return response.data.data.map((inv) => ({
    id: inv.id,
    email: inv.emailInvitado ?? '',
    status: 'PENDING',
    permissions: [inv.tipoPermiso],
    createdAt: inv.creadaEn,
  }));
};

const updatePermissions = async (listId: string, userId: string, dto: UpdatePermissionsDto): Promise<void> => {
  await axiosInstance.put(`/invitations/${listId}/permissions/${userId}`, dto);
};

const generateShareLink = async (
  listId: string,
  dto: GenerateShareLinkDto
): Promise<ShareLinkResponseDto> => {
  // Importar el adapter
  const { InvitationAdapter } = await import('@/lib/adapters/invitation-adapter');
  
  // Convertir al formato del backend
  const backendRequest = InvitationAdapter.toBackendRequest({
    permissions: dto.permissions,
    expiresIn: dto.expiresIn
  });
  
  // Llamar al endpoint correcto del backend: /invitations/:listaId/share
  const response = await axiosInstance.post(
    `/invitations/${listId}/share`,
    backendRequest
  );
  
  // Convertir la respuesta del backend al formato del frontend
  return InvitationAdapter.fromBackendResponse(response.data);
};

const revokePermission = async (listId: string, userId: string): Promise<void> => {
  await axiosInstance.delete(`/invitations/${listId}/permissions/${userId}`);
};

export const invitationService = {
  inviteUser,
  getPendingInvitations,
  declineInvitation,
  getInvitationByHash,
  getInvitationsByList,
  updatePermissions,
  generateShareLink,
  revokePermission,
};
