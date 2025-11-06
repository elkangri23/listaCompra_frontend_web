import { axiosInstance } from '@/lib/api/axios-instance';
import { InvitationDto } from '@/types/dtos/invitations/InvitationDto';

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

export const invitationService = {
  inviteUser,
  getPendingInvitations,
  acceptInvitation,
  declineInvitation,
};
