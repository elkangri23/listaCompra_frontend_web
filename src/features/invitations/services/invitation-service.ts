import { axiosInstance } from '@/lib/api/axios-instance';
import {
  InvitationDto,
  PublicInvitationDetailsDto,
  BackendInvitationAccessResponse,
  ActiveInvitationDto,
  UpdatePermissionsDto,
  GenerateShareLinkDto,
  ShareLinkResponseDto,
} from '@/types/dtos/invitations';

const inviteUser = async (listId: string, email: string): Promise<void> => {
  await axiosInstance.post(`/invitations/${listId}/share`, { email });
};

const getPendingInvitations = async (): Promise<InvitationDto[]> => {
  const response = await axiosInstance.get<InvitationDto[]>('/invitations/pending');
  return response.data;
};

const acceptInvitation = async (invitationId: string): Promise<void> => {
  await axiosInstance.post(`/invitations/${invitationId}/accept`);
};

const declineInvitation = async (invitationId: string): Promise<void> => {
  await axiosInstance.post(`/invitations/${invitationId}/decline`);
};

const getInvitationByHash = async (hash: string): Promise<PublicInvitationDetailsDto> => {
  const response = await axiosInstance.get(`/invitations/${hash}/access`);
  
  console.log('🔍 Backend response for getInvitationByHash:', response.data);
  
  // El backend devuelve: { success: true, message: string, data: { lista: {...}, permiso: {...}, invitacion: {...} } }
  // La estructura real tiene propietarioNombre dentro de lista
  if (response.data?.success && response.data?.data) {
    const backendData = response.data.data;
    const transformed = {
      listId: backendData.lista?.id || '',
      listName: backendData.lista?.nombre || '',
      inviterName: backendData.lista?.propietarioNombre || 'Usuario', // El nombre está en lista.propietarioNombre
    };
    console.log('✅ Transformed data:', transformed);
    return transformed;
  }
  
  console.warn('⚠️ Unexpected backend response structure:', response.data);
  // Fallback si la estructura es diferente
  return response.data as unknown as PublicInvitationDetailsDto;
};

const getInvitationsByList = async (listId: string): Promise<ActiveInvitationDto[]> => {
  const response = await axiosInstance.get<ActiveInvitationDto[]>(`/invitations/${listId}/list`);
  return response.data;
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

export const invitationService = {
  inviteUser,
  getPendingInvitations,
  acceptInvitation,
  declineInvitation,
  getInvitationByHash,
  getInvitationsByList,
  updatePermissions,
  generateShareLink,
};
