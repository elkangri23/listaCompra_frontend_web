import { axiosInstance } from '@/lib/api/axios-instance';
import {
  InvitationDto,
  PublicInvitationDetailsDto,
  ActiveInvitationDto,
  UpdatePermissionsDto,
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
  const response = await axiosInstance.get<PublicInvitationDetailsDto>(`/invitations/${hash}/access`);
  return response.data;
};

const getInvitationsByList = async (listId: string): Promise<ActiveInvitationDto[]> => {
  const response = await axiosInstance.get<ActiveInvitationDto[]>(`/invitations/${listId}/list`);
  return response.data;
};

const updatePermissions = async (listId: string, userId: string, dto: UpdatePermissionsDto): Promise<void> => {
  await axiosInstance.put(`/invitations/${listId}/permissions/${userId}`, dto);
};

export const invitationService = {
  inviteUser,
  getPendingInvitations,
  acceptInvitation,
  declineInvitation,
  getInvitationByHash,
  getInvitationsByList,
  updatePermissions,
};
